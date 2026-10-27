// Spec 25/26/27: $7.99 lifetime, free preview, restore purchase.
// Real billing: Google Play Billing / StoreKit through the RevenueCat SDK
// (react-native-purchases). The SDK key in app config is a *public* store
// key; receipt validation happens server-side — after any purchase/restore
// this module asks the backend (/api/purchases/verify) to confirm the
// purchase against RevenueCat, and only a server "entitled:true" unlocks
// the full tier (the backend derives diagnosis quota from that record).
// If the SDK key or the backend verification is not configured, every entry
// point says so and returns not-entitled — nothing here grants on faith.
import { Platform } from "react-native";
import Purchases, { CustomerInfo, PurchasesPackage } from "react-native-purchases";
import { API_URL, REVENUECAT_API_KEY } from "./config";
import { getDeviceId, saveEntitlement } from "./storage";

export const PRODUCT = { sku: "fixit_lifetime_799", price: "$7.99", type: "one-time, no subscription" };
export const FREE_PREVIEW = ["browse library", "limited troubleshooting", "limited photo analyses", "sample repairs"];
export const FULL = ["unlimited app functionality subject to service costs", "photo analysis", "guided repairs", "projects", "favorites", "full library"];

export interface EntitlementState {
  configured: boolean; // RevenueCat SDK key present in app config
  storeOwns: boolean; // the store/RevenueCat says this user owns the lifetime SKU
  entitled: boolean; // server verified — this is what unlocks the full tier
  message: string;
}

const NOT_CONFIGURED: EntitlementState = {
  configured: false,
  storeOwns: false,
  entitled: false,
  message: "Purchases are not configured in this build yet (no store key). Nothing has been charged.",
};

let sdkConfigured = false;
export function isPurchasesConfigured(): boolean {
  return REVENUECAT_API_KEY.length > 0;
}

async function ensureSdk(): Promise<boolean> {
  if (!isPurchasesConfigured()) return false;
  if (!sdkConfigured) {
    const appUserID = await getDeviceId();
    Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID });
    sdkConfigured = true;
  }
  return true;
}

// Does RevenueCat's record for this user show ownership of the lifetime SKU?
// Checked by product id (works whether or not a named entitlement exists in
// the RevenueCat dashboard): an active entitlement for the SKU, or the SKU
// in the purchased-products list (non-consumables land there).
export function customerOwnsLifetime(info: CustomerInfo): boolean {
  const active = (info.entitlements && info.entitlements.active) || {};
  for (const id of Object.keys(active)) {
    if (active[id] && active[id].productIdentifier === PRODUCT.sku) return true;
  }
  const purchased: string[] = (info as any).allPurchasedProductIdentifiers || [];
  return purchased.includes(PRODUCT.sku);
}

async function verifyWithBackend(): Promise<{ entitled: boolean; message: string }> {
  if (!API_URL) return { entitled: false, message: "Backend URL is not configured, so the purchase could not be verified." };
  const appUserId = await getDeviceId();
  const res = await fetch(API_URL + "/api/purchases/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-device-id": appUserId },
    body: JSON.stringify({ platform: Platform.OS === "ios" ? "ios" : "android", appUserId }),
  });
  const data = await res.json().catch(() => null);
  if (res.ok && data && data.entitled) return { entitled: true, message: "Lifetime unlock verified." };
  return {
    entitled: false,
    message: (data && data.error) || "The server could not verify this purchase yet — try Restore in a moment.",
  };
}

async function settleWithBackend(storeOwns: boolean): Promise<EntitlementState> {
  if (!storeOwns) {
    await saveEntitlement(false);
    return { configured: true, storeOwns: false, entitled: false, message: "No lifetime purchase found for this account." };
  }
  const v = await verifyWithBackend();
  await saveEntitlement(v.entitled);
  return { configured: true, storeOwns: true, entitled: v.entitled, message: v.message };
}

export async function checkEntitlement(): Promise<EntitlementState> {
  if (!(await ensureSdk())) return NOT_CONFIGURED;
  const info = await Purchases.getCustomerInfo();
  return settleWithBackend(customerOwnsLifetime(info));
}

export async function purchaseLifetime(): Promise<EntitlementState> {
  if (!(await ensureSdk())) return NOT_CONFIGURED;
  const offerings = await Purchases.getOfferings();
  let pkg: PurchasesPackage | undefined;
  const offeringList = offerings.current ? [offerings.current] : Object.values(offerings.all || {});
  for (const offering of offeringList) {
    pkg = (offering.availablePackages || []).find((p) => p.product.identifier === PRODUCT.sku);
    if (pkg) break;
  }
  if (!pkg) {
    return {
      configured: true, storeOwns: false, entitled: false,
      message: "The lifetime product (" + PRODUCT.sku + ") is not available from the store yet — it must be created in Play Console / App Store Connect and attached to a RevenueCat offering.",
    };
  }
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return settleWithBackend(customerOwnsLifetime(customerInfo));
  } catch (e: any) {
    if (e && e.userCancelled) {
      return { configured: true, storeOwns: false, entitled: false, message: "Purchase cancelled — nothing was charged." };
    }
    throw e;
  }
}

// Restore a previous purchase. Returns true ONLY when the store shows the
// purchase AND the backend verifies it. (The old stub returned true for
// everyone — that fake entitlement is gone.)
export async function restorePurchase(): Promise<boolean> {
  const state = await restorePurchaseState();
  return state.entitled;
}

export async function restorePurchaseState(): Promise<EntitlementState> {
  if (!(await ensureSdk())) return NOT_CONFIGURED;
  const info = await Purchases.restorePurchases();
  return settleWithBackend(customerOwnsLifetime(info));
}
