# GA4 Shopify by MalterTech

This is a general guide on how to push GA4 dataLayer events using data from Shopify.

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
        currency: Shopify.currency.active,
        value: activeVariant.price * quantity / 100,
        items: [{
            item_id: product.id,
            item_name: product.title,
            item_category: item.type,
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
Only fire beign_checkout when you redirect the user to /checkout
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

### Purchase
This needs be placed on /admin/settings/checkout under Additional scripts.
```
{% if first_time_accessed %}

    <!-- Fire GA event -->
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

### Enhanced Conversion Google Ads

```
<!-- Global site tag (gtag.js) - Google Ads: 10869445557 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-10869445557"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'AW-10869445557', {'allow_enhanced_conversions': true});
</script>

<!-- Event snippet for Purchase (MalterTech TagTeam 11/15/2023) conversion page -->
<script>
  gtag('event', 'conversion', {
      'send_to': 'AW-10869445557/USfBCK22_fYYELWn-r4o',
    'value': {{ checkout.subtotal_price | times: 0.01 }},
    'currency': '{{ checkout.currency }}',
      'transaction_id': '{{ checkout.order_number }}'
  });
</script>
```

Variable Mappings:
```
Shopify.checkout.email
Shopify.checkout.shipping_address.phone
Shopify.checkout.shipping_address.first_name
Shopify.checkout.shipping_address.last_name
Shopify.checkout.shipping_address.address1
Shopify.checkout.shipping_address.city
Shopify.checkout.shipping_address.province
Shopify.checkout.shipping_address.country_code
Shopify.checkout.shipping_address.zip
```
