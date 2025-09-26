!function (w, d) {
    if (!w.rdt) {
        var p = w.rdt = function () {
            p.sendEvent ? p.sendEvent.apply(p, arguments) : p.callQueue.push(arguments)
        };
        p.callQueue = [];
        var t = d.createElement("script");
        t.src = "https://www.redditstatic.com/ads/pixel.js";
        t.async = !0;
        var s = d.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(t, s)
    }
}(window, document);

// Initialize with correct pixel ID per brand
rdt('init', 'PIXEL_ID');

// page_viewed
analytics.subscribe("page_viewed", (event) => {
    rdt('track', 'PageVisit');
});

// product_added_to_cart
analytics.subscribe("product_added_to_cart", (event) => {
    rdt('track', 'AddToCart', {
        currency: event.data.cartLine.cost.totalAmount.currencyCode,
        value: event.data.cartLine.cost.totalAmount.amount,
        itemCount: 1
    });
});

// checkout_started
analytics.subscribe("checkout_started", (event) => {
    rdt('track', 'InitiateCheckout', {
        currency: event.data.checkout.currencyCode,
        value: event.data.checkout.totalPrice.amount,
        itemCount: event.data.checkout.lineItems.length
    });
});

// checkout_completed
analytics.subscribe("checkout_completed", (event) => {
    rdt('track', 'Purchase', {
        currency: event.data.checkout.currencyCode,
        value: event.data.checkout.totalPrice.amount,
        itemCount: event.data.checkout.lineItems.length,
        transactionId: event.data.checkout.order.id
    });
});