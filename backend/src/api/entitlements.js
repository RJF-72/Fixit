// backend/src/api/entitlements.js — server-side record of verified purchases.
// Populated ONLY by ./verify after the store receipt checks out with
// RevenueCat. ./diagnose reads this to derive the caller's tier — the tier
// is never taken from the client.
// Production note: this in-memory map is correct logic for a single instance;
// move it to the database (spec 41 `purchases` table) when the backend scales
// past one instance, the same caveat ./quota already carries.
const store = new Map(); // appUserId -> { platform, sku, verifiedAt }

function grantEntitlement(appUserId, { platform = "", sku = "" } = {}) {
  if (!appUserId) return false;
  store.set(String(appUserId), { platform, sku, verifiedAt: new Date().toISOString() });
  return true;
}

function hasEntitlement(appUserId) {
  return Boolean(appUserId) && store.has(String(appUserId));
}

function getEntitlement(appUserId) {
  return (appUserId && store.get(String(appUserId))) || null;
}

function _resetForTests() { store.clear(); }

module.exports = { grantEntitlement, hasEntitlement, getEntitlement, _resetForTests };
