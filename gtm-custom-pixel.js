// GTM
(function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
    var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'GTM-XXXXXX');

// GA4 view_item_list
analytics.subscribe("collection_viewed", (event) => {
    console.log(event)
    dataLayer.push({ecommerce: null});
    dataLayer.push({
        event: "view_item_list",
        ecommerce: {
            currency: event.data.collection.productVariants[0].price.currencyCode,
            item_list_id: event.data.collection.id,
            item_list_name: event.data.collection.title,
            items: event.data.collection.productVariants.map(function (variant, index) {
                return {
                    item_id: variant.product.id,
                    item_name: variant.product.title,
                    item_variant: variant.title,
                    item_category: variant.product.type,
                    quantity: 1,
                    index: index,
                    item_list_id: event.data.collection.id,
                    item_list_name: event.data.collection.title,
                    price: variant.price.amount
                }
            })
        }
    });
    console.log(dataLayer);
});

// GA4 view_item
analytics.subscribe("product_viewed", (event) => {
    console.log(event)
    dataLayer.push({ecommerce: null});
    dataLayer.push({
        event: "view_item",
        ecommerce: {
            currency: event.data.productVariant.price.currencyCode,
            value: event.data.productVariant.price.amount,
            items: [
                {
                    item_id: event.data.productVariant.product.id,
                    item_name: event.data.productVariant.product.title,
                    item_category: event.data.productVariant.product.type,
                    item_variant: event.data.productVariant.title,
                    price: event.data.productVariant.price.amount,
                    quantity: 1
                }
            ]
        }
    });
    console.log(dataLayer);
});

// GA4 add_to_cart
analytics.subscribe("product_added_to_cart", (event) => {
    console.log(event)
    dataLayer.push({ecommerce: null});
    dataLayer.push({
        event: 'add_to_cart',
        ecommerce: {
            currency: event.data.cartLine.cost.totalAmount.currencyCode,
            value: event.data.cartLine.cost.totalAmount.amount,
            items: [{
                item_id: event.data.cartLine.merchandise.product.id,
                item_name: event.data.cartLine.merchandise.product.title,
                item_category: event.data.cartLine.merchandise.product.type,
                item_variant: event.data.cartLine.merchandise.title,
                price: event.data.cartLine.merchandise.price.amount,
                quantity: event.data.cartLine.quantity,
            }],
        }
    });
    console.log(dataLayer);
});

// GA4 begin_checkout
analytics.subscribe("checkout_started", (event) => {
    console.log(event)
    dataLayer.push({ecommerce: null});
    dataLayer.push({
        event: 'begin_checkout',
        ecommerce: {
            currency: event.data.checkout.currencyCode,
            value: event.data.checkout.totalPrice.amount,
            items: event.data.checkout.lineItems.map(function (item) {
                return {
                    item_id: item.variant.product.id,
                    item_name: item.variant.product.title,
                    item_category: item.variant.product.type,
                    item_variant: item.variant.title,
                    price: item.variant.price.amount,
                    quantity: item.quantity,
                }
            }),
        }
    });
    console.log(dataLayer);
});

// GA4 purchase
analytics.subscribe("checkout_completed", (event) => {
    console.log(event)
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
    console.log(dataLayer);
});