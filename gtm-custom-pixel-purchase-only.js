// GTM
(function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
    var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'GTM-XXXXXXX');

// checkout_completed
analytics.subscribe("checkout_completed", (event) => {
    dataLayer.push({ecommerce: null});
    dataLayer.push({
        event: "purchase",
        ecommerce: {
            currency: event.data.checkout.currencyCode,
            transaction_id: event.data.checkout.order.id,
            affiliation: "Online Store",
            value: event.data.checkout.totalPrice.amount,
            tax: event.data.checkout.totalTax.amount,
            shipping: event.data.checkout.shippingLine.price.amount,
            coupon: event.data.checkout.discountApplications.map(discount => discount.title).join(","),
            items: event.data.checkout.lineItems.map(function (item) {
                return {
                    item_id: item.variant.product.id,
                    item_name: item.variant.product.title,
                    item_category: item.variant.product.type,
                    item_variant: item.variant.title,
                    price: item.variant.price.amount,
                    quantity: item.quantity,
                }
            })
        }
    });
    console.log("GTM dataLayer:", dataLayer);
});
