// Checkout click
document.querySelector("#cartFooterCheckout").addEventListener("click", function () {
    // GA4
    dataLayer.push({ecommerce: null});
    dataLayer.push({
        event: 'begin_checkout',
        ecommerce: {
            currency: "USD",
            value: cart.total_price / 100,
            items: cart.items.map(function (item) {
                return {
                    item_id: item.product_id,
                    item_name: item.product_title,
                    item_variant: item.variant_title,
                    price: item.price / 100,
                    quantity: item.quantity
                }
            })
        },
        eventCallback: function () {
            window.location.href = "/checkout";
        }
    });
});
