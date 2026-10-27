// tests/diagnose.test.js — diagnosis path: demo stub honesty, photo
// validation, live GPT-4o wiring (mocked fetch — no real key), and
// server-side tier derivation. Pure Node, no dependencies.
const assert = require("assert");
const { mockRes, mockReq } = require("./helpers");

const diagnose = require("../backend/src/api/diagnose");
const { _resetForTests: resetQuota } = require("../backend/src/api/quota");
const entitlements = require("../backend/src/api/entitlements");

const realFetch = global.fetch;
function saveEnv() {
  return { key: process.env.OPENAI_API_KEY, provider: process.env.FIXIT_AI_PROVIDER, aiProvider: process.env.AI_PROVIDER };
}
function restoreEnv(saved) {
  for (const [envName, v] of [["OPENAI_API_KEY", saved.key], ["FIXIT_AI_PROVIDER", saved.provider], ["AI_PROVIDER", saved.aiProvider]]) {
    if (v === undefined) delete process.env[envName]; else process.env[envName] = v;
  }
  global.fetch = realFetch;
}

(async () => {
  console.log("FixIt diagnose test v1");
  const saved = saveEnv();
  try {
    // 1. No key configured -> honestly labeled demo stub, never fake analysis.
    delete process.env.OPENAI_API_KEY;
    delete process.env.FIXIT_AI_PROVIDER;
    delete process.env.AI_PROVIDER;
    resetQuota(); entitlements._resetForTests();
    let res = mockRes();
    await diagnose(mockReq({ description: "kitchen faucet drips", category: "Home", deviceId: "dev-stub", photoUris: [] }), res);
    assert.strictEqual(res.statusCode, 200, "stub path returns 200");
    assert.strictEqual(res.body.stub, true, "demo response carries stub:true");
    assert(/Demo mode/.test(res.body.notice), "demo response carries the demo notice");
    assert.strictEqual(res.body.quota.tier, "preview", "unverified device is preview tier");

    // 2. A client-sent tier:"full" must NOT lift the tier (fake-tier hole).
    res = mockRes();
    await diagnose(mockReq({ description: "kitchen faucet drips", category: "Home", deviceId: "dev-fake-tier", tier: "full" }), res);
    assert.strictEqual(res.body.quota.tier, "preview", "client-sent tier is ignored");

    // 3. Local device paths are rejected — OpenAI could never fetch them.
    res = mockRes();
    await diagnose(mockReq({ description: "washer is leaking", deviceId: "dev-path", photoUris: ["file:///data/user/0/photo.jpg"] }), res);
    assert.strictEqual(res.statusCode, 400, "file:// photo rejected with 400");

    // 4. With a key set, photos (data URLs) reach GPT-4o and the structured
    //    diagnosis comes back un-stubbed. fetch is mocked; no real key used.
    process.env.OPENAI_API_KEY = "test-key-not-real";
    let seenRequest = null;
    global.fetch = async (url, opts) => {
      seenRequest = { url, body: JSON.parse(opts.body), auth: opts.headers.Authorization };
      return {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify({
            problem: "Worn faucet cartridge", causes: ["cartridge wear"], confidence: "high",
            tools: ["wrench"], materials: ["cartridge"], costMin: 12, costMax: 30,
            difficulty: "moderate", minutesMin: 20, minutesMax: 40,
            steps: [{ n: 1, title: "Shut off water", detail: "Close the valve." }],
            test: "Run the tap.", alternatives: [], callPro: "If the shutoff fails, call a plumber.",
          }) } }],
        }),
        text: async () => "",
      };
    };
    resetQuota();
    res = mockRes();
    const dataUrl = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
    await diagnose(mockReq({ description: "kitchen faucet drips", category: "Home", deviceId: "dev-live", photoUris: [dataUrl] }), res);
    assert.strictEqual(res.statusCode, 200, "live path returns 200");
    assert(!res.body.stub, "live diagnosis is not labeled stub");
    assert.strictEqual(res.body.problem, "Worn faucet cartridge", "provider diagnosis returned");
    assert.strictEqual(seenRequest.url, "https://api.openai.com/v1/chat/completions", "OpenAI endpoint called");
    assert.strictEqual(seenRequest.body.model, "gpt-4o", "GPT-4o is the default model");
    assert.strictEqual(seenRequest.auth, "Bearer test-key-not-real", "server key sent as bearer");
    const imagePart = seenRequest.body.messages[1].content.find((c) => c.type === "image_url");
    assert(imagePart && imagePart.image_url.url === dataUrl, "photo data URL forwarded to the model");

    // 5. A server-verified entitlement lifts the tier without any client say.
    entitlements.grantEntitlement("dev-live", { platform: "android", sku: "fixit_lifetime_799" });
    res = mockRes();
    await diagnose(mockReq({ description: "kitchen faucet drips", category: "Home", deviceId: "dev-live", photoUris: [] }), res);
    assert.strictEqual(res.body.quota.tier, "full", "verified purchaser gets full tier");
    assert.strictEqual(res.body.quota.limit, 100, "full tier uses the full monthly cap");

    console.log("DIAGNOSE PASS: stub labeled, photos validated + forwarded to gpt-4o, tier server-derived");
  } finally {
    restoreEnv(saved);
  }
})().catch((e) => { console.error("DIAGNOSE FAIL:", e); process.exit(1); });
