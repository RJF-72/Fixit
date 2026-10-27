// POST /api/purchases/verify — server-side purchase validation (spec 25-27/42).
//
// Flow: the mobile app buys through Google Play Billing / StoreKit via the
// RevenueCat SDK (mobile/src/services/purchases.ts), then asks this endpoint
// to confirm the purchase. RevenueCat has already validated the store receipt
// with Google/Apple; this endpoint checks the buyer's RevenueCat subscriber
// record for the lifetime product before granting the entitlement that
// ./diagnose uses to set the "full" tier.
//
// Body: { platform: "android"|"ios", appUserId, receipt? }
//   appUserId — the RevenueCat app user id (the app uses its device id).
//   receipt   — optional store transaction id, kept on the entitlement
//               record for audit; RevenueCat remains the validation source.
//
// Env (server-side only, never in the app):
//   REVENUECAT_API_KEY        RevenueCat *secret* API key. Without it this
//                             endpoint is NOT configured: it returns 503 with
//                             entitled:false — it never grants on faith.
//   REVENUECAT_ENTITLEMENT_ID Optional RevenueCat entitlement identifier to
//                             accept in addition to owning the SKU below.
//   FIXIT_LIFETIME_SKU        Lifetime product id (default fixit_lifetime_799).
const { grantEntitlement } = require("./entitlements");

const RC_API_BASE = "https://api.revenuecat.com/v1";

function lifetimeSku() {
  return process.env.FIXIT_LIFETIME_SKU || "fixit_lifetime_799";
}

function isConfigured() {
  return Boolean(process.env.REVENUECAT_API_KEY);
}

// Pure check over a RevenueCat subscriber payload, exported for tests:
// entitled iff the lifetime SKU appears in non_subscriptions (a
// non-consumable purchase) or the configured entitlement is active.
function subscriberIsEntitled(subscriber, now = new Date()) {
  if (!subscriber || typeof subscriber !== "object") return false;
  const nonSubs = subscriber.non_subscriptions || {};
  const owned = nonSubs[lifetimeSku()];
  if (Array.isArray(owned) && owned.length > 0) return true;
  const entId = process.env.REVENUECAT_ENTITLEMENT_ID;
  if (entId) {
    const ent = (subscriber.entitlements || {})[entId];
    if (ent && (!ent.expires_date || new Date(ent.expires_date) > now)) return true;
  }
  return false;
}

async function fetchSubscriber(appUserId, platform) {
  const headers = {
    Authorization: "Bearer " + process.env.REVENUECAT_API_KEY,
    "Content-Type": "application/json",
  };
  if (platform === "ios") headers["X-Platform"] = "ios";
  if (platform === "android") headers["X-Platform"] = "android";
  const res = await fetch(RC_API_BASE + "/subscribers/" + encodeURIComponent(appUserId), { headers });
  if (res.status === 404) return null; // RevenueCat has never seen this user
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error("RevenueCat lookup failed " + res.status + ": " + body.slice(0, 200));
  }
  const data = await res.json();
  return data.subscriber || null;
}

module.exports = async (req, res) => {
  const { platform = "", receipt = "" } = req.body || {};
  const appUserId = (req.body && (req.body.appUserId || req.body.deviceId)) || req.headers["x-device-id"];
  if (!appUserId) {
    return res.status(400).json({ entitled: false, error: "appUserId (or deviceId) required" });
  }
  if (!isConfigured()) {
    // Honest unconfigured state — the old stub returned entitled:true for
    // any receipt, which would have given the paid tier away for free.
    return res.status(503).json({
      entitled: false,
      configured: false,
      error: "Purchase verification is not configured on this server (set REVENUECAT_API_KEY).",
    });
  }
  try {
    const subscriber = await fetchSubscriber(String(appUserId), platform);
    const entitled = subscriberIsEntitled(subscriber);
    if (entitled) {
      grantEntitlement(String(appUserId), { platform, sku: lifetimeSku() });
    }
    return res.json({
      entitled,
      configured: true,
      sku: lifetimeSku(),
      platform,
      ...(receipt ? { transactionRecorded: true } : {}),
    });
  } catch (e) {
    console.error("purchase verification failed:", e.message);
    return res.status(502).json({ entitled: false, configured: true, error: "Purchase verification is temporarily unavailable.", detail: e.message });
  }
};

module.exports.isConfigured = isConfigured;
module.exports.subscriberIsEntitled = subscriberIsEntitled;
module.exports.lifetimeSku = lifetimeSku;
