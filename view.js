// GA4
dataLayer.push({ecommerce: null});
dataLayer.push({
    event: "view_item",
    ecommerce: {
        currency: "USD",
        items: [
            {
                item_id: product.id,
                item_name: product.title
                item_variant: product.variants[0].title,
                price: product.price | divided_by: 100,
                quantity: 1
            }
        ]
    }
});

// GA4
dataLayer.push({ecommerce: null});
dataLayer.push({
    event: "view_item_list",
    ecommerce: {
        item_list_id: collection.id,
        item_list_name: collection.title,
        currency: "USD",
        items: collection.products.map(function (product) {
            return {
                item_id: product.id,
                item_name: product.title
                item_variant: product.variants[0].title,
                price: product.price | divided_by: 100,
                quantity: 1
            }
        })
    }
});



// GA4
dataLayer.push({ecommerce: null});
dataLayer.push({
    event: "view_cart",
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
    }
});
