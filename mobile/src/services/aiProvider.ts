// Spec 28/29/40: abstraction — Mobile -> AI Service Interface -> Vision -> Reasoning -> Structured Diagnosis -> Safety Filter -> UI
// No secret keys in app. App calls backend /api/diagnose with photos+description+category.
import * as FileSystem from "expo-file-system";
import { API_URL } from "./config";
import { getDeviceId } from "./storage";

export interface AIProvider { diagnose(req: { photoUris: string[]; description: string; category: string }): Promise<any>; }

function mimeFor(uri: string): string {
  const ext = uri.split("?")[0].split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg"; // jpg / jpeg / heic picks are sent as jpeg data
}

// The backend forwards photo URLs to the vision provider, which cannot fetch
// local device files — so picked photos are read as base64 and sent as data
// URLs. https/data URLs pass through untouched.
export async function encodePhoto(uri: string): Promise<string> {
  if (uri.startsWith("data:") || uri.startsWith("https://") || uri.startsWith("http://")) return uri;
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  return "data:" + mimeFor(uri) + ";base64," + base64;
}

export class BackendAIProvider implements AIProvider {
  constructor(private baseUrl: string = API_URL) {}
  async diagnose(req: { photoUris: string[]; description: string; category: string }) {
    if (!this.baseUrl) {
      throw new Error("FixIt backend URL is not configured (app.json extra.apiUrl). Use the offline How-To Library instead.");
    }
    const photoUris = await Promise.all((req.photoUris || []).slice(0, 6).map(encodePhoto));
    const deviceId = await getDeviceId();
    const res = await fetch(this.baseUrl + "/api/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-device-id": deviceId },
      body: JSON.stringify({ photoUris, description: req.description, category: req.category, deviceId }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      // Surface the server's own message (quota, validation, provider down)
      // instead of swallowing it behind a generic failure.
      throw new Error((data && data.error) || "AI unavailable — falling back to local library");
    }
    return data;
  }
}
export class LocalFallbackProvider implements AIProvider {
  async diagnose(req: any) { return { offline: true, message: "Use local How-To Library (offline). AI requires internet.", req }; }
}
