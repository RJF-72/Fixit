export type Difficulty = "easy" | "moderate" | "advanced" | "professional";
export interface DiagnosisRequest { photoUris: string[]; description: string; category: string; answers?: Record<string,string>; }
export interface DiagStep { n: number; title: string; detail: string; }
export interface Diagnosis {
  problem: string; causes: string[]; confidence: "high"|"medium"|"low";
  safetyWarning?: string; tools: string[]; materials: string[];
  costMin: number; costMax: number; difficulty: Difficulty; minutesMin: number; minutesMax: number;
  steps: DiagStep[]; test: string; alternatives: string[]; callPro: string;
}
export interface LibraryArticle {
  id: string; title: string; category: string; difficulty: Difficulty;
  minutes: number; costMin: number; costMax: number;
  tools: string[]; materials: string[]; safety?: string; steps: string[];
}
export interface Project {
  id: string; title: string; status: "saved"|"in-progress"|"completed";
  photos: string[]; problem: string; diagnosis?: Diagnosis; cost?: string; notes?: string; date: string;
}
export const LIFETIME_SKU = "fixit_lifetime_799";
export const LIFETIME_PRICE = "$7.99";
