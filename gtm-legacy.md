# GA4 via Manual Placement

### View Collection

```
const collection = {{ collection | json }};
collection.products = {{ collection.products | json }};

// GA4 view_item_list
dataLayer.push({ecommerce: null});
dataLayer.push({
    event: "view_item_list",
    ecommerce: {
        currency: Shopify.currency.active,
        item_list_id: collection.id,
        item_list_name: collection.title,
        items: collection.products.map(function (item, index) {
            return {
                item_id: item.id,
                item_name: item.title,
                item_variant: item.variants[0].title,
                item_category: item.type,
                quantity: 1,
                index: index,
                item_list_id: collection.id,
                item_list_name: collection.title,
                price: item.price / 100
            }
        })
    }
});
```

### View Product & Add To Cart

Note, this code will only be accurate if you update activeVariant and qauntity.
If there are subscriptions, build in the logic for subscription_included and subscription_item

```
const product = {{ product | json }};
const activeVariant = {{ product.selected_or_first_available_variant | json }};
let quantity = 1;

// GA4 view_item
dataLayer.push({ecommerce: null});
dataLayer.push({
    event: "view_item",
    ecommerce: {
        currency: Shopify.currency.active,
        value: activeVariant.price / 100,
        items: [
            {
                item_id: product.id,
                item_name: product.title,
                item_category: product.type,
                item_variant: activeVariant.title,
                price: activeVariant.price / 100,
                quantity: 1
            }
        ]
    }
});

// GA4 add_to_cart
dataLayer.push({ecommerce: null});
dataLayer.push({
    event: 'add_to_cart',
    ecommerce: {
        currency: Shopify.currency.active,
        value: activeVariant.price * quantity / 100,
        items: [{
            item_id: product.id,
            item_name: product.title,
            item_category: product.type,
            item_variant: activeVariant.title,
            price: activeVariant.price / 100,
            quantity: quantity,
            subscription_item: false,
        }],
        subscription_included: false,
    }
});
```

### View Cart & Begin Checkout

Only fire begin_checkout when you redirect the user to /checkout

```
const cart = {{ cart | json }};

// GA4 view_cart
dataLayer.push({ecommerce: null});
dataLayer.push({
    event: "view_cart",
    ecommerce: {
        currency: Shopify.currency.active,
        value: cart.total_price / 100,
        items: cart.items.map(function (item) {
            return {
                item_id: item.product_id,
                item_name: item.product_title,
                item_variant: item.variant_title,
                item_category: item.type,
                price: item.price / 100,
                quantity: item.quantity,
                subscription_item: item.selling_plan_allocation !== undefined
            }
        }),
        subscription_included: cart.items.filter(item => item.selling_plan_allocation).length > 0,
    }
});

// GA4 begin_checkout
dataLayer.push({ecommerce: null});
dataLayer.push({
    event: 'begin_checkout',
    ecommerce: {
        currency: Shopify.currency.active,
        value: cart.total_price / 100,
        items: cart.items.map(function (item) {
            return {
                item_id: item.product_id,
                item_name: item.product_title,
                item_category: item.type,
                item_variant: item.variant_title,
                price: item.price / 100,
                quantity: item.quantity,
                subscription_item: item.selling_plan_allocation !== undefined
            }
        }),
        subscription_included: cart.items.filter(item => item.selling_plan_allocation).length > 0,
    }
});
```

### Purchase (Post Purchase Page)

This needs be placed on /admin/settings/checkout under Post-purchase additional scripts.

```
<!-- GTM -->
<script>
    (function (w, d, s, l, i) { w[l] = w[l] || []; w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' }); var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f); })(window, document, 'script', 'dataLayer', 'GTM-XXXXXX');
</script>

<!-- Fire Purchase & Upsell Purchase Event -->
<script>
    // make sure the initial conversion isn't tracked twice
    if (!Shopify.wasPostPurchasePageSeen) {
        const order = window.Shopify.order;
        // { "id": 5714202034495, "number": 553141, "checkoutToken": "2de8ee63b26ad156800fbf17d0a59d3f", "lineItems": [ { "id": 14584747458879, "finalLinePrice": "34.99", "finalPrice": "34.99", "lineLevelTotalDiscount": 0, "optionsWithValues": [ { "name": "Title", "value": "Default Title" } ], "originalLinePrice": "34.99", "originalPrice": "34.99", "price": "34.99", "product": { "id": 8952708530495, "type": "Toothpaste" }, "properties": [], "quantity": 1, "title": "LIVFRESH Wintergreen - 1 Pack", "variant": { "id": 47136226410815, "sku": "LIV1153-1X" } } ], "subtotalPrice": "34.99", "totalPrice": "39.98", "currency": "USD", "discounts": null, "customer": { "id": 7569136582975, "email": "zach@maltertech.com", "acceptsMarketing": false, "hasAccount": true, "firstName": "Zachary", "lastName": "Malter", "ordersCount": 11, "totalSpent": "45.31" } }

        // track initial conversion
        dataLayer.push({ecommerce: null});
        dataLayer.push({
            event: "purchase",
            ecommerce: {
                currency: order.currency,
                transaction_id: order.id,
                affiliation: "Online Store",
                value: order.totalPrice,
                coupon: order.discounts ? order.discounts[0].code : null,
                items: order.lineItems.map(function (item) {
                    return {
                        item_id: item.product.id,
                        item_name: item.title,
                        item_category: item.product.type,
                        item_variant: null,
                        price: item.price,
                        quantity: item.quantity,
                        subscription_item: item.title.includes("Subscription")
                    }
                }),
                subscription_included: order.lineItems.filter(item => item.title.includes("Subscription")).length > 0,
            }
        });
    }

    // set up additional conversion tracking if they take an upsell
    Shopify.on('CheckoutAmended', function (newOrder, previousOrder) {
        // identify which items were recently added, if any
        const oldItems = previousOrder.lineItems.map(function (line) {
            return line.id;
        });

        const addedItems = newOrder.lineItems.filter(
            function (line) {
                return oldItems.indexOf(line.id) < 0;
            }
        );

        // no new items were added, so we skip conversion tracking
        if (addedItems.length === 0) {
            return;
        }
        
        // track additional purchase
        dataLayer.push({ecommerce: null});
        dataLayer.push({
            event: "purchase",
            ecommerce: {
                currency: newOrder.currency,
                transaction_id: `${newOrder.id}-upsell`,
                affiliation: "Online Store",
                value: newOrder.totalPrice - previousOrder.totalPrice,
                items: addedItems.map(function (item) {
                    return {
                        item_id: item.product.id,
                        item_name: item.title,
                        item_category: item.product.type,
                        item_variant: null,
                        price: item.price,
                        quantity: item.quantity,
                        subscription_item: item.title.includes("Subscription")
                    };
                }),
                subscription_included: addedItems.filter(item => item.title.includes("Subscription")).length > 0,
            }
        });
    });
</script>
```

### Purchase (Order Status)

This needs be placed on /admin/settings/checkout under Additional scripts.

```
{% if first_time_accessed == true and post_purchase_page_accessed == false %}
    <script>
        // GA4 purchase
        dataLayer.push({ecommerce: null});
        dataLayer.push({
            event: "purchase",
            ecommerce: {
                currency: "{{ checkout.currency }}",
                transaction_id: "{{ checkout.order_number }}",
                affiliation: "Online Store",
                value: {{ checkout.total_price | times: 0.01 }},
                tax: {{ checkout.tax_price | times: 0.01 }},
                shipping: {{ checkout.shipping_price | times: 0.01 }},
                coupon: `{{ checkout.discount_applications[0].title }}`,
                items: [
                    {% for item in checkout.line_items %}
                    {
                        'item_name': `{{ item.product.title }}`,
                        'item_id': '{{ item.product_id }}',
                        'item_variant': `{{ item.variant.title }}`,
                        'item_category': `{{ item.product.type }}`,
                        'price': {{ item.final_price | times: 0.01 }},
                        'quantity': {{ item.quantity }},
                        'subscription_item': {% if item.selling_plan_allocation == nil %}false{% else %}true{% endif %}
                    },
                    {% endfor %}
                ],
                subscription_included: Shopify.Checkout.hasSellingPlan,
            }
        });
    </script>
{% endif %}
```
