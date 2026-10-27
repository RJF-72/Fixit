import Constants from "expo-constants";
import { Platform } from "react-native";

// App configuration comes from app.json `extra` (public config only — the
// RevenueCat keys below are the store SDK keys, which are public by design;
// every secret key lives on the backend). A value that is empty or still a
// SET_* placeholder counts as "not configured", and the features that need
// it say so honestly instead of pretending to work.
const extra: Record<string, any> = (Constants.expoConfig && Constants.expoConfig.extra) || {};

function configured(value: any): string {
  return typeof value === "string" && value.length > 0 && !value.startsWith("SET_") ? value : "";
}

export const API_URL: string = configured(extra.apiUrl);
export const REVENUECAT_API_KEY: string = configured(
  Platform.OS === "ios" ? extra.revenueCatIosApiKey : extra.revenueCatAndroidApiKey
);
