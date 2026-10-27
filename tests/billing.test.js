// tests/billing.test.js — purchase verification: no more entitled-on-faith.
// RevenueCat is mocked via global.fetch; no real keys are used.
const assert = require("assert");
const { mockRes, mockReq } = require("./helpers");

const verify = require("../backend/src/api/verify");
const entitlements = require("../backend/src/api/entitlements");

const realFetch = global.fetch;

(async () => {
  console.log("FixIt billing test v1");
  const savedKey = process.env.REVENUECAT_API_KEY;
  try {
    // 1. Unconfigured server: any receipt gets entitled:false (503), never true.
    delete process.env.REVENUECAT_API_KEY;
    entitlements._resetForTests();
    let res = mockRes();
    await verify(mockReq({ platform: "android", appUserId: "user-1", receipt: "anything" }), res);
    assert.strictEqual(res.statusCode, 503, "unconfigured verify returns 503");
    assert.strictEqual(res.body.entitled, false, "unconfigured verify never entitles");
    assert.strictEqual(res.body.configured, false, "unconfigured flag is honest");
    assert(!entitlements.hasEntitlement("user-1"), "no entitlement recorded");

    // 2. Missing user id is a 400, not an entitlement.
    process.env.REVENUECAT_API_KEY = "test-rc-key-not-real";
    res = mockRes();
    await verify(mockReq({ platform: "android", receipt: "x" }), res);
    assert.strictEqual(res.statusCode, 400, "missing appUserId returns 400");
    assert.strictEqual(res.body.entitled, false);

    // 3. RevenueCat knows the user but they own nothing -> entitled:false.
    global.fetch = async () => ({
      ok: true, status: 200,
      json: async () => ({ subscriber: { entitlements: {}, non_subscriptions: {}, subscriptions: {} } }),
      text: async () => "",
    });
    res = mockRes();
    await verify(mockReq({ platform: "android", appUserId: "user-free" }), res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.entitled, false, "no purchase on record -> not entitled");
    assert(!entitlements.hasEntitlement("user-free"), "free user not granted");

    // 4. RevenueCat shows the lifetime SKU in non_subscriptions -> entitled,
    //    and the entitlement is recorded for /api/diagnose tier checks.
    global.fetch = async (url, opts) => {
      assert.strictEqual(opts.headers.Authorization, "Bearer test-rc-key-not-real", "secret key sent to RevenueCat");
      return {
        ok: true, status: 200,
        json: async () => ({ subscriber: { entitlements: {}, non_subscriptions: { fixit_lifetime_799: [{ id: "txn-1", purchase_date: "2026-10-26T00:00:00Z" }] }, subscriptions: {} } }),
        text: async () => "",
      };
    };
    res = mockRes();
    await verify(mockReq({ platform: "android", appUserId: "user-paid", receipt: "txn-1" }), res);
    assert.strictEqual(res.body.entitled, true, "lifetime owner is entitled");
    assert.strictEqual(res.body.sku, "fixit_lifetime_799", "SKU reported");
    assert(entitlements.hasEntitlement("user-paid"), "entitlement recorded server-side");

    // 5. Unknown user (RevenueCat 404) -> entitled:false, not an error grant.
    global.fetch = async () => ({ ok: false, status: 404, json: async () => ({}), text: async () => "not found" });
    res = mockRes();
    await verify(mockReq({ platform: "ios", appUserId: "user-ghost" }), res);
    assert.strictEqual(res.body.entitled, false, "unknown user not entitled");

    // 6. Pure payload check: active named entitlement also counts.
    process.env.REVENUECAT_ENTITLEMENT_ID = "full_access";
    assert(verify.subscriberIsEntitled({ entitlements: { full_access: { expires_date: null } }, non_subscriptions: {} }), "named entitlement accepted");
    assert(!verify.subscriberIsEntitled({ entitlements: { full_access: { expires_date: "2020-01-01T00:00:00Z" } }, non_subscriptions: {} }), "expired entitlement rejected");
    delete process.env.REVENUECAT_ENTITLEMENT_ID;

    console.log("BILLING PASS: fake receipts rejected, RevenueCat-verified owners entitled");
  } finally {
    global.fetch = realFetch;
    if (savedKey === undefined) delete process.env.REVENUECAT_API_KEY; else process.env.REVENUECAT_API_KEY = savedKey;
  }
})().catch((e) => { console.error("BILLING FAIL:", e); process.exit(1); });
