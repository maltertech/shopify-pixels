// Copyright 2012 Google Inc. All rights reserved.

// Load gtag.js script.
const script = document.createElement('script');
script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXX';
script.async = true;
document.head.appendChild(script);

// Configure gtag.js script.
window.dataLayer = window.dataLayer || [];

function gtag() {
    dataLayer.push(arguments);
}

gtag('js', new Date());
gtag("config", "AW-XXXXXXXXX", {"allow_enhanced_conversions": true});

// GA4 add_to_cart
analytics.subscribe("product_added_to_cart", (event) => {
    gtag("event", "conversion", {
        "send_to": "AW-XXXXXXXXX/YYYYYYYYYYYYY",
        "value": event.data.cartLine.cost.totalAmount.amount,
        "currency": event.data.cartLine.cost.totalAmount.currencyCode,
        "transaction_id": ""
    });
    console.log(dataLayer);
});

// GA4 begin_checkout
analytics.subscribe("checkout_started", (event) => {
    gtag("event", "conversion", {
        "send_to": "AW-XXXXXXXXX/YYYYYYYYYYYYY",
        "value": event.data.checkout.totalPrice.amount,
        "currency": event.data.checkout.currencyCode,
        "transaction_id": ""
    });
    console.log(dataLayer);
});

// GA4 purchase
analytics.subscribe("checkout_completed", (event) => {
    gtag("set", "user_data", {
        "email": event.data.checkout.email,
        "phone_number": event.data.checkout.phone,
        "address": {
            "first_name": event.data.checkout.shippingAddress.firstName,
            "last_name": event.data.checkout.shippingAddress.lastName,
            "street": event.data.checkout.shippingAddress.address1,
            "city": event.data.checkout.shippingAddress.city,
            "region": event.data.checkout.shippingAddress.province,
            "postal_code": event.data.checkout.shippingAddress.zip,
            "country": event.data.checkout.shippingAddress.country
        }
    });
    gtag("event", "conversion", {
        "send_to": "AW-XXXXXXXXX/YYYYYYYYYYYYY",
        "value": event.data.checkout.totalPrice.amount,
        "currency": event.data.checkout.currencyCode,
        "transaction_id": event.data.checkout.order.id
    });
    console.log(dataLayer);
});