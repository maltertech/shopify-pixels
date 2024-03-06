!function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
        n.callMethod ?
            n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s)
}(window, document, "script",
    "https://connect.facebook.net/en_US/fbevents.js");
fbq("init", 123456789);

// integrate third-party pixel tracking
analytics.subscribe("page_viewed", (event) => {
    fbq("track", "PageView");
});

analytics.subscribe("product_viewed", (event) => {
    fbq("track", "ViewContent", {
        currency: event.data.productVariant.price.currencyCode,
        value: event.data.productVariant.price.amount,
    });
});

analytics.subscribe("product_added_to_cart", (event) => {
    fbq("track", "AddToCart", {
        currency: event.data.cartLine.cost.totalAmount.currencyCode,
        value: event.data.cartLine.cost.totalAmount.amount,
    });
});

analytics.subscribe("checkout_started", (event) => {
    fbq("track", "InitiateCheckout");
});

analytics.subscribe("checkout_completed", (event) => {
    fbq("track", "Purchase", {
        currency: event.data.checkout.currencyCode,
        value: event.data.checkout.totalPrice.amount,
    });
});