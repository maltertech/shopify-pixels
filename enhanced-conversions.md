# Google Ads Enhanced Conversions

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
