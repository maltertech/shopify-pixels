analytics.subscribe("checkout_address_info_submitted", (event) => {
    console.log(event);
});

analytics.subscribe("checkout_completed", (event) => {
    console.log(event);
});

analytics.subscribe("checkout_contact_info_submitted", (event) => {
    console.log(event);
});

analytics.subscribe("checkout_shipping_info_submitted", (event) => {
    console.log(event);
});

analytics.subscribe("checkout_started", (event) => {
    console.log(event);
});

analytics.subscribe("collection_viewed", (event) => {
    console.log(event);
});

analytics.subscribe("page_viewed", (event) => {
    console.log(event);
});

analytics.subscribe("payment_info_submitted", (event) => {
    console.log(event);
});

analytics.subscribe("product_added_to_cart", (event) => {
    console.log(event);
});

analytics.subscribe("product_viewed", (event) => {
    console.log(event);
});

analytics.subscribe("search_submitted", (event) => {
    console.log(event);
});
