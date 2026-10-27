// tests/http.test.js — end-to-end over real HTTP against the Express app:
// health, demo-mode diagnosis, photo validation, and purchase verify.
// No keys are set, so diagnosis must answer with the labeled demo stub and
// verify must refuse to entitle.
const assert = require("assert");

(async () => {
  console.log("FixIt http test v1");
  delete process.env.OPENAI_API_KEY;
  delete process.env.REVENUECAT_API_KEY;
  const app = require("../backend/src/index");
  const server = app.listen(0);
  await new Promise((r) => server.on("listening", r));
  const base = "http://127.0.0.1:" + server.address().port;
  try {
    const health = await (await fetch(base + "/health")).json();
    assert(health.ok && health.app === "FixIt", "health endpoint");

    const diagRes = await fetch(base + "/api/diagnose", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "bathroom sink drains slowly", category: "Home", deviceId: "http-test", photoUris: ["data:image/jpeg;base64,/9j/4AAQSkZJRg=="] }),
    });
    const diag = await diagRes.json();
    assert.strictEqual(diagRes.status, 200, "diagnose over HTTP 200");
    assert.strictEqual(diag.stub, true, "no key -> labeled demo stub over HTTP");
    assert.strictEqual(diagRes.headers.get("x-fixit-quota-tier"), "preview", "quota tier header present");

    const badPhoto = await fetch(base + "/api/diagnose", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "bathroom sink drains slowly", photoUris: ["file:///tmp/x.jpg"] }),
    });
    assert.strictEqual(badPhoto.status, 400, "local photo path rejected over HTTP");

    const verifyRes = await fetch(base + "/api/purchases/verify", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: "android", appUserId: "http-test", receipt: "fake" }),
    });
    const verifyBody = await verifyRes.json();
    assert.strictEqual(verifyRes.status, 503, "verify unconfigured over HTTP");
    assert.strictEqual(verifyBody.entitled, false, "fake receipt not entitled over HTTP");

    console.log("HTTP PASS: routes wired, demo stub + verify honesty hold over HTTP");
  } finally {
    server.close();
  }
})().catch((e) => { console.error("HTTP FAIL:", e); process.exit(1); });
