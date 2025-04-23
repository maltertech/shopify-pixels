// Copyright 2012 Google Inc. All rights reserved.

// Load gtag.js script.
const script = document.createElement('script');
script.src = 'https://www.googletagmanager.com/gtag/js?id=DC-XXXXXXX';
script.async = true;
document.head.appendChild(script);

// Configure gtag.js script.
window.dataLayer = window.dataLayer || [];

function gtag() {
    dataLayer.push(arguments);
}

gtag('js', new Date());
gtag("config", "DC-XXXXXXX", {"allow_enhanced_conversions": true});

// GA4 purchase
analytics.subscribe("checkout_completed", (event) => {
    gtag("set", "user_data", {
        "email": event.data.checkout.email,
        "phone_number": event.data.checkout.phone,
        "address": {
            "first_name": event.data.checkout.shippingAddress?.firstName,
            "last_name": event.data.checkout.shippingAddress?.lastName,
            "street": event.data.checkout.shippingAddress?.address1,
            "city": event.data.checkout.shippingAddress?.city,
            "region": event.data.checkout.shippingAddress?.province,
            "postal_code": event.data.checkout.shippingAddress?.zip,
            "country": event.data.checkout.shippingAddress?.country
        }
    });
    gtag("event", "conversion", {
        "send_to": "DC-XXXXXXX/sales0/maltertech0+transactions",
        "value": event.data.checkout.totalPrice.amount,
        "currency": event.data.checkout.currencyCode,
        "transaction_id": event.data.checkout.order.id
    });
    console.log(dataLayer);
});