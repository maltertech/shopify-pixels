# GA4 Shopify by MalterTech

## View Collection
```
const collection = {{ collection | json }};
collection.products = {{ collection.products | json }};

// GA4 view_item_list
dataLayer.push({ecommerce: null});
dataLayer.push({
    event: "view_item_list",
    ecommerce: {
        currency: Shopify.currency.active,
        items: collection.products.map(function (item, index) {
            return {
                item_id: item.product_id,
                item_name: item.product_title,
                index: index,
                item_list_id: collection.id,
                item_list_name: collection.title,
                price: item.price / 100
            }
        })
    }
});
```

## View Product & Add To Cart
### Note, this code will only be accurate if you update activeVariant and qauntity.
### If there are subscriptions, build in the logic for subscription_included and subscription_item
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
        items: [
            {
                item_id: product.id,
                item_name: product.title,
                item_variant: activeVariant.id,
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
        subscription_included: false,
        value: activeVariant.price * quantity / 100,
        currency: Shopify.currency.active,
        items: [{
            item_id: product.id,
            item_name: product.title,
            item_variant: activeVariant.title,
            price: activeVariant.price / 100,
            quantity: quantity,
            subscription_item: false,
        }]
    }
});
```

## View Cart & Begin Checkout
### Only fire beign_checkout when you redirect the user to /checkout
```
const cart = {{ cart | json }};

// GA4 view cart
dataLayer.push({ecommerce: null});
dataLayer.push({
    event: "view_cart",
    ecommerce: {
        subscription_included: cart.items.filter(item => item.selling_plan_allocation).length > 0,
        currency: Shopify.currency.active,
        value: cart.total_price / 100,
        items: cart.items.map(function (item) {
            return {
                item_id: item.product_id,
                item_name: item.product_title,
                item_variant: item.variant_title,
                price: item.price / 100,
                quantity: item.quantity,
                subscription_item: item.selling_plan_allocation !== undefined
            }
        })
    }
});

// GA4 begin checkout
dataLayer.push({ecommerce: null});
dataLayer.push({
    event: 'begin_checkout',
    ecommerce: {
        subscription_included: cart.items.filter(item => item.selling_plan_allocation).length > 0,
        currency: Shopify.currency.active,
        value: cart.total_price / 100,
        items: cart.items.map(function (item) {
            return {
                item_id: item.product_id,
                item_name: item.product_title,
                item_variant: item.variant_title,
                price: item.price / 100,
                quantity: item.quantity,
                subscription_item: item.selling_plan_allocation !== undefined
            }
        })
    }
});
```

## Purchase
### This needs be placed on /admin/settings/checkout udner Additional scripts.
```
{% if first_time_accessed %}

    <!-- Fire GA event -->
    <script>
        // GA4 purchase
        dataLayer.push({ecommerce: null});
        dataLayer.push({
            event: "purchase",
            ecommerce: {
               subscription_included: Shopify.Checkout.hasSellingPlan,
               transaction_id: "{{ checkout.order_number }}",
                affiliation: "Online Store",
                value: {{ checkout.total_price | times: 0.01 }},
                tax: {{ checkout.tax_price | times: 0.01 }},
                shipping: {{ checkout.shipping_price | times: 0.01 }},
                currency: "USD",
                coupon: `{{ checkout.discount_applications[0].title }}`,
                items: [
                    {% for item in checkout.line_items %}
                    {
                        'item_name': `{{ item.product.title }}`,
                        'item_id': '{{ item.product_id }}',
                        'item_variant': `{{ item.variant.title }}`,
                        'price': {{ item.final_price | times: 0.01 }},
                        'quantity': {{ item.quantity }},
                        'subscription_item': {% if item.selling_plan_allocation == nil %}false{% else %}true{% endif %}
                    },
                    {% endfor %}
                ],
            }
        });
    </script>
    
{% endif %}
```
