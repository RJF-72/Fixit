// backend/src/api/quota.js — the $7.99-lifetime economics guard.
// AI vision/reasoning costs real money per call, so AI analyses are metered;
// everything local (library, search, calculators, saved projects) is unlimited.
// Tiers: preview (free, pre-purchase) vs full (verified lifetime unlock).
// Production: derive tier server-side from /api/purchases/verify, and persist
// counters in the DB. This in-memory version is correct logic for one instance.
const MONTH = 30 * 24 * 3600 * 1000;
const LIMITS = { preview: 3, full: 100 };
const store = new Map(); // key -> { count, resetAt }
function monthKey(id, tier, now = Date.now()) {
  return tier + ":" + String(id || "anonymous") + ":" + Math.floor(now / MONTH);
}
function checkQuota(id, tier = "preview", now = Date.now()) {
  tier = tier === "full" ? "full" : "preview";
  const key = monthKey(id, tier, now);
  const rec = store.get(key) || { count: 0, resetAt: (Math.floor(now / MONTH) + 1) * MONTH };
  const limit = LIMITS[tier];
  return { tier, allowed: rec.count < limit, remaining: Math.max(0, limit - rec.count), limit, resetAt: rec.resetAt };
}
function consumeQuota(id, tier = "preview", now = Date.now()) {
  const s = checkQuota(id, tier, now);
  if (!s.allowed) return s;
  const key = monthKey(id, tier, now);
  const rec = store.get(key) || { count: 0, resetAt: s.resetAt };
  rec.count += 1;
  rec.resetAt = s.resetAt;
  store.set(key, rec);
  return checkQuota(id, tier, now);
}
function quotaHeaders(res, s) {
  res.set("X-FixIt-Quota-Tier", s.tier);
  res.set("X-FixIt-Quota-Remaining", String(s.remaining));
  res.set("X-FixIt-Quota-Reset", new Date(s.resetAt).toISOString());
}
function _resetForTests() { store.clear(); }
module.exports = { LIMITS, checkQuota, consumeQuota, quotaHeaders, _resetForTests };
