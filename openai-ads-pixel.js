(function () {
    "use strict";

    var PIXEL_ID = "XXXXXXXXX";
    var DEBUG = false;

    function log() {
        if (!DEBUG) return;
        var args = ["[oaiq pixel]"].concat([].slice.call(arguments));
        console.log.apply(console, args);
    }

    // OpenAI expects amounts as integer minor units (cents). Shopify reports
    // major-unit decimals like 25.99. This assumes 2-decimal currencies (USD).
    function toCents(value) {
        var n = Number(value);
        return Number.isFinite(n) ? Math.round(n * 100) : 0;
    }

    // Returns { amount, currency } only when both are valid, otherwise {}.
    // Spreading the result keeps invalid money fields out of the payload.
    function money(amountMajor, currency) {
        var cents = toCents(amountMajor);
        if (cents > 0 && typeof currency === "string" && currency.length === 3) {
            return {amount: cents, currency: currency};
        }
        return {};
    }

    function assign(target, source) {
        for (var k in source) {
            if (Object.prototype.hasOwnProperty.call(source, k)) target[k] = source[k];
        }
        return target;
    }

    // Builds one contents[] entry. Returns null if there is no usable id, so the
    // caller can drop it.
    function buildItem(id, name, quantity, amountMajor, currency) {
        if (id == null || id === "") return null;
        var q = parseInt(quantity, 10);
        var item = {
            id: String(id),
            content_type: "product",
            quantity: Number.isFinite(q) && q > 0 ? q : 1,
        };
        if (name) item.name = String(name);
        assign(item, money(amountMajor, currency));
        return item;
    }

    // 1. Load the OpenAI Ads SDK. The loader creates the window.oaiq queue
    //    immediately, so init and measure calls made before the script finishes
    //    downloading are buffered and replayed in order once it loads.
    (function (w, d, s, u) {
        if (w.oaiq) return;
        var q = function () {
            q.q.push(arguments);
        };
        q.q = [];
        w.oaiq = q;
        var j = d.createElement(s);
        j.async = 1;
        j.src = u;
        var f = d.getElementsByTagName(s)[0];
        f.parentNode.insertBefore(j, f);
    })(window, document, "script", "https://bzrcdn.openai.com/sdk/oaiq.min.js");

    // 2. Initialize. Queued first so it always runs before any measure call.
    oaiq("init", {pixelId: PIXEL_ID, debug: DEBUG});

    function measure(name, props, options) {
        try {
            if (options) {
                oaiq("measure", name, props, options);
            } else {
                oaiq("measure", name, props);
            }
            log("measure", name, props, options || "");
        } catch (e) {
            log("measure failed", name, e);
        }
    }

    // Build an OpenAI contents[] array from a Shopify checkout payload, dropping
    // any line item that has no usable id.
    function mapCheckoutLineItems(checkout) {
        var items = (checkout && checkout.lineItems) || [];
        var out = [];
        for (var i = 0; i < items.length; i++) {
            var li = items[i] || {};
            var variant = li.variant || {};
            var price = variant.price || {};
            var item = buildItem(
                variant.sku || variant.id || li.id,
                li.title || (variant.product && variant.product.title),
                li.quantity,
                price.amount,
                price.currencyCode || checkout.currencyCode
            );
            if (item) out.push(item);
        }
        return out;
    }

    // 3. Subscribe to events synchronously so nothing fired on page load is missed.

    // Product View -> contents_viewed
    analytics.subscribe("product_viewed", function (event) {
        var v = event && event.data && event.data.productVariant;
        if (!v) return;
        var price = v.price || {};
        var item = buildItem(
            v.sku || v.id,
            (v.product && v.product.title) || v.title,
            1,
            price.amount,
            price.currencyCode
        );
        if (!item) {
            log("product_viewed skipped, no usable id", v);
            return;
        }
        var props = {type: "contents", contents: [item]};
        assign(props, money(price.amount, price.currencyCode));
        measure("contents_viewed", props);
    });

    // Add To Cart -> items_added
    analytics.subscribe("product_added_to_cart", function (event) {
        var line = event && event.data && event.data.cartLine;
        if (!line) return;
        var m = line.merchandise || {};
        var price = m.price || {};
        var lineTotal = (line.cost && line.cost.totalAmount) || {};
        var item = buildItem(
            m.sku || m.id,
            (m.product && m.product.title) || m.title,
            line.quantity,
            price.amount,
            price.currencyCode
        );
        if (!item) {
            log("product_added_to_cart skipped, no usable id", m);
            return;
        }
        var props = {type: "contents", contents: [item]};
        assign(props, money(lineTotal.amount, lineTotal.currencyCode || price.currencyCode));
        measure("items_added", props);
    });

    // Checkout -> checkout_started
    analytics.subscribe("checkout_started", function (event) {
        var c = event && event.data && event.data.checkout;
        if (!c) return;
        var contents = mapCheckoutLineItems(c);
        if (!contents.length) {
            log("checkout_started skipped, no line items");
            return;
        }
        var props = {type: "contents", contents: contents};
        assign(props, money(c.totalPrice && c.totalPrice.amount, c.currencyCode));
        // Stable id for deduplication if you also send this via the Conversions API.
        measure("checkout_started", props, {event_id: c.token});
    });

    // Purchase -> order_created
    analytics.subscribe("checkout_completed", function (event) {
        var c = event && event.data && event.data.checkout;
        if (!c) return;
        var contents = mapCheckoutLineItems(c);
        if (!contents.length) {
            log("checkout_completed skipped, no line items");
            return;
        }
        var props = {type: "contents", contents: contents};
        assign(props, money(c.totalPrice && c.totalPrice.amount, c.currencyCode));
        measure("order_created", props, {event_id: (c.order && c.order.id) || c.token});
    });

    // 4. Restore the ChatGPT ad click identifier (oppref) so conversions attribute
    //    across page navigations. The sandbox iframe URL is not the storefront URL
    //    and sandbox cookies do not persist on the storefront domain, so we manage
    //    oppref ourselves: read it from the landing URL, persist it on the
    //    storefront via the browser.cookie API, and seed it into the sandbox cookie
    //    that the SDK reads.
    (function restoreOppref() {
        try {
            var loc =
                (init && init.context && init.context.document && init.context.document.location) ||
                {};
            var search = loc.search || "";
            var fresh = null;
            try {
                fresh = new URLSearchParams(search).get("oppref");
            } catch (e) {
                /* URLSearchParams unavailable, ignore */
            }

            var seed = function (value) {
                if (!value) return;
                document.cookie = "__oppref=" + value + "; path=/";
                log("oppref seeded into sandbox", value);
            };

            if (fresh) {
                seed(fresh);
                browser.cookie.set("__oppref", fresh); // persist on storefront domain
                log("captured fresh oppref from URL", fresh);
                return;
            }

            var stored = browser.cookie.get("__oppref");
            if (stored && typeof stored.then === "function") {
                stored.then(seed).catch(function (e) {
                    log("oppref restore failed", e);
                });
            } else {
                seed(stored);
            }
        } catch (e) {
            log("oppref handling failed", e);
        }
    })();
})();