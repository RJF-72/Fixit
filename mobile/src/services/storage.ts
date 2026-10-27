// SQLite (projects/library/favorites) + secure storage (tokens/entitlements). MVP uses AsyncStorage interface.
import AsyncStorage from "@react-native-async-storage/async-storage";

export const KEYS = { projects: "fixit.projects", favorites: "fixit.favorites", entitlement: "fixit.entitlement", settings: "fixit.settings", deviceId: "fixit.deviceId" };

// Anonymous per-install id. It is the RevenueCat app user id AND the id the
// backend uses for quota + server-side entitlement, so a purchase verified
// on this device is the same identity /api/diagnose checks.
let cachedDeviceId: string | null = null;
export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;
  let id = await AsyncStorage.getItem(KEYS.deviceId);
  if (!id) {
    id = "dev-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
    await AsyncStorage.setItem(KEYS.deviceId, id);
  }
  cachedDeviceId = id;
  return id;
}

export async function saveEntitlement(entitled: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.entitlement, entitled ? "full" : "preview");
}
export async function loadEntitlement(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEYS.entitlement)) === "full";
}
