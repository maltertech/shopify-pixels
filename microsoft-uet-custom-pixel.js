(function (w, d, t, r, u) {
    var f, n, i;
    w[u] = w[u] || [], f = function () {
        var o = {ti: "XXXXXXXXXX", enableAutoSpaTracking: true};
        o.q = w[u], w[u] = new UET(o), w[u].push("pageLoad")
    }, n = d.createElement(t), n.src = r, n.async = 1, n.onload = n.onreadystatechange = function () {
        var s = this.readyState;
        s && s !== "loaded" && s !== "complete" || (f(), n.onload = n.onreadystatechange = null)
    }, i = d.getElementsByTagName(t)[0], i.parentNode.insertBefore(n, i)
})(window, document, "script", "//bat.bing.com/bat.js", "uetq");


// add to cart
analytics.subscribe("product_added_to_cart", (event) => {
    window.uetq = window.uetq || [];
    window.uetq.push("event", "add_to_cart", {
        "revenue_value": event.data.cartLine.cost.totalAmount.amount,
        "currency": event.data.cartLine.cost.totalAmount.currencyCode,
    });
});

// checkout completed
analytics.subscribe("checkout_completed", (event) => {
    window.uetq = window.uetq || [];
    window.uetq.push('set', {
        "pid": {
            "em": event.data.checkout.email,
            "ph": event.data.checkout.phone
        }
    });
    window.uetq.push("event", "purchase", {
        "revenue_value": event.data.checkout.totalPrice.amount,
        "currency": event.data.checkout.currencyCode
    });
});