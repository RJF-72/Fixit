// tests/economics.test.js — quota caps + parts hook. Pure Node, no dependencies.
const assert = require("assert");
const { LIMITS, checkQuota, consumeQuota, _resetForTests } = require("../backend/src/api/quota");
const { partsLinks } = require("../backend/src/api/parts");
console.log("FixIt economics test v1");
_resetForTests();
// Preview tier: 3 free analyses, 4th blocked (user falls back to local library).
for (let i = 0; i < LIMITS.preview; i++) {
  const s = consumeQuota("device-a", "preview");
  assert(s.allowed || s.remaining === 0, "preview call " + (i + 1) + " allowed until exhausted");
}
const blocked = checkQuota("device-a", "preview");
assert(!blocked.allowed && blocked.remaining === 0, "preview 4th call blocked in same month");
// Full ($7.99 lifetime) tier: generous but bounded.
_resetForTests();
for (let i = 0; i < LIMITS.full; i++) consumeQuota("device-b", "full");
assert(!checkQuota("device-b", "full").allowed, "full tier capped at " + LIMITS.full + "/month");
// Quotas are per-device, per-month.
assert(checkQuota("device-c", "preview").allowed, "different device unaffected");
assert(checkQuota("device-a", "preview", Date.now() + 31 * 24 * 3600 * 1000).allowed, "quota resets next month");
// Parts hook: genuine encoded retailer search links, AutoZone only for auto.
const links = partsLinks(["faucet cartridge"], "Home");
assert(links.length === 1 && links[0].links.length === 3, "3 retailers for home parts");
assert(links[0].links[0].url.includes(encodeURIComponent("faucet cartridge")), "query encoded in URL");
const auto = partsLinks(["spark plug"], "Automotive");
assert(auto[0].links.length === 4, "AutoZone added for automotive");
console.log("ECONOMICS PASS: preview=" + LIMITS.preview + "/mo, full=" + LIMITS.full + "/mo, parts links ok");
