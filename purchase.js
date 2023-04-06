{% if first_time_accessed %}

   <!-- Determine if there is a subscription -->
    {% assign subscription = "false" %}
    {% for item in line_items %}
       {% if item.selling_plan_allocation != nil %}
            {% assign subscription = "true" %}
           {% break %}
       {% endif %}
    {% endfor %}

    <!-- Fire GA event -->
    <script>
        // GA4
        dataLayer.push({ecommerce: null});
        dataLayer.push({
            event: "purchase",
            ecommerce: {
                transaction_id: "{{ order_number }}",
                affiliation: "Online Store",
                value: {{ total_price | times: 0.01 }},
                tax: {{ tax_price | times: 0.01 }},
                shipping: {{ shipping_price | times: 0.01 }},
                currency: "USD",
                coupon: `{{ discount_applications[0].title }}`,
                items: [
                    {% for item in line_items %}
                    {
                        'item_name': `{{ item.product.title }}`,
                        'item_id': '{{ item.product_id }}',
                        'item_variant': `{{ item.variant.title }}`,
                        'price': {{ item.final_price | times: 0.01 }},
                        'quantity': {{ item.quantity }},
                    },
                    {% endfor %}
                ],
                subscription: {{ subscription }}
            }
        });
    </script>
    
{% endif %}
