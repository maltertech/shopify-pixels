// load the OpenAI Ads SDK
!function (w, d) {
    if (w.oaiq) return;
    var q = w.oaiq = function () {
        q.q.push(arguments)
    };
    q.q = [];
    var t = d.createElement("script");
    t.src = "https://bzrcdn.openai.com/sdk/oaiq.min.js";
    t.async = !0;
    var s = d.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(t, s)
}(window, document);

oaiq("init", {pixelId: "XXXXXXXXX"});

// OpenAI expects amounts as integer cents, Shopify reports major-unit decimals
function toCents(amount) {
    return Math.round(Number(amount) * 100);
}

// build an OpenAI contents[] array from checkout line items
function buildContents(checkout) {
    return checkout.lineItems.map((lineItem) => ({
        id: String(lineItem.variant.sku || lineItem.variant.id),
        content_type: "product",
        name: lineItem.title,
        quantity: lineItem.quantity,
        amount: toCents(lineItem.variant.price.amount),
        currency: checkout.currencyCode,
    }));
}

// restore the ChatGPT ad click id (oppref) so conversions attribute across page
// navigations, the sandbox cookie does not persist on the storefront domain
const oppref = new URLSearchParams(init.context.document.location.search).get("oppref");
if (oppref) {
    document.cookie = `__oppref=${oppref}; path=/`;
    browser.cookie.set("__oppref", oppref);
} else {
    browser.cookie.get("__oppref").then((stored) => {
        if (stored) {
            document.cookie = `__oppref=${stored}; path=/`;
        }
    });
}

// page view
analytics.subscribe("page_viewed", (event) => {
    const variant = event.data.productVariant;
    oaiq("measure", "page_viewed", {
        type: "contents",
        contents: [{
            name: event.context.document.location.href
        }],
    });
});

// product_viewed
analytics.subscribe("product_viewed", (event) => {
    const variant = event.data.productVariant;
    oaiq("measure", "contents_viewed", {
        type: "contents",
        contents: [{
            id: String(variant.sku || variant.id),
            content_type: "product",
            name: variant.product.title,
            quantity: 1,
            amount: toCents(variant.price.amount),
            currency: variant.price.currencyCode,
        }],
        amount: toCents(variant.price.amount),
        currency: variant.price.currencyCode,
    });
});

// product_added_to_cart
analytics.subscribe("product_added_to_cart", (event) => {
    const cartLine = event.data.cartLine;
    const merchandise = cartLine.merchandise;
    oaiq("measure", "items_added", {
        type: "contents",
        contents: [{
            id: String(merchandise.sku || merchandise.id),
            content_type: "product",
            name: merchandise.product.title,
            quantity: cartLine.quantity,
            amount: toCents(merchandise.price.amount),
            currency: merchandise.price.currencyCode,
        }],
        amount: toCents(cartLine.cost.totalAmount.amount),
        currency: cartLine.cost.totalAmount.currencyCode,
    });
});

// checkout_started
analytics.subscribe("checkout_started", (event) => {
    const checkout = event.data.checkout;
    oaiq("measure", "checkout_started", {
        type: "contents",
        contents: buildContents(checkout),
        amount: toCents(checkout.totalPrice.amount),
        currency: checkout.currencyCode,
    }, {event_id: checkout.token});
});

// checkout_completed
analytics.subscribe("checkout_completed", (event) => {
    const checkout = event.data.checkout;
    oaiq("measure", "order_created", {
        type: "contents",
        contents: buildContents(checkout),
        amount: toCents(checkout.totalPrice.amount),
        currency: checkout.currencyCode,
    }, {event_id: checkout.order.id});
});