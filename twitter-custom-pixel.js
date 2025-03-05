!function (e, t, n, s, u, a) {
    e.twq || (s = e.twq = function () {
        s.exe ? s.exe.apply(s, arguments) : s.queue.push(arguments);
    }, s.version = '1.1', s.queue = [], u = t.createElement(n), u.async = !0, u.src = 'https://static.ads-twitter.com/uwt.js',
        a = t.getElementsByTagName(n)[0], a.parentNode.insertBefore(u, a))
}(window, document, 'script');
twq('config', 'p6m2d');

// purchase
analytics.subscribe("checkout_completed", (event) => {
    twq('event', 'XXXXXXXXXXXXXXXXXXXXX', {
        value: event.data.checkout.totalPrice.amount,
        currency: event.data.checkout.currencyCode,
        conversion_id: event.data.checkout.order.id,
        email_address: event.data.checkout.email
    });
});