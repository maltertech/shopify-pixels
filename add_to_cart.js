// GA4
dataLayer.push({ecommerce: null});
dataLayer.push({
    event: 'add_to_cart',
    ecommerce: {
        value: activeVariant.price * quantity / 100,
        currency: "USD",
        items: [{
            item_id: product.id,
            item_name: product.title,
            item_variant: activeVariant.title,
            price: activeVariant.price / 100,
            quantity: quantity
        }]
    },
    eventCallback: function () {
        window.location.href = "/cart";
    }
});
