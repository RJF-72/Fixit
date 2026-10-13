// Spec 28/29/40: abstraction — Mobile -> AI Service Interface -> Vision -> Reasoning -> Structured Diagnosis -> Safety Filter -> UI
// No secret keys in app. App calls backend /api/diagnose with photos+description+category.
export interface AIProvider { diagnose(req: { photoUris: string[]; description: string; category: string }): Promise<any>; }
export class BackendAIProvider implements AIProvider {
  constructor(private baseUrl: string) {}
  async diagnose(req: { photoUris: string[]; description: string; category: string }) {
    const res = await fetch(this.baseUrl + "/api/diagnose", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(req) });
    if (!res.ok) throw new Error("AI unavailable — falling back to local library");
    return res.json();
  }
}
export class LocalFallbackProvider implements AIProvider {
  async diagnose(req: any) { return { offline: true, message: "Use local How-To Library (offline). AI requires internet.", req }; }
}
