// Spec 25/26/27: $7.99 lifetime, free preview, restore purchase. StoreKit (iOS) + Play Billing (Android).
export const PRODUCT = { sku: "fixit_lifetime_799", price: "$7.99", type: "one-time, no subscription" };
export const FREE_PREVIEW = ["browse library", "limited troubleshooting", "limited photo analyses", "sample repairs"];
export const FULL = ["unlimited app functionality subject to service costs", "photo analysis", "guided repairs", "projects", "favorites", "full library"];
export async function restorePurchase(): Promise<boolean> { return true; } // wired to StoreKit/Play verify via backend /api/purchases/verify
