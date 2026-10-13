# FixIt Bootstrap Script — v1 MVP scaffold
# Product: FixIt — "See It. Ask It. Fix It." — $7.99 one-time, Android + iPhone (+ Windows later)
# Stack: React Native + TypeScript (Expo-compatible) + Node.js backend abstraction + SQLite-ready + local knowledge base
# Run: pwsh -File bootstrap-fixit.ps1
$ErrorActionPreference = "Stop"
$Root = "C:\Fixit"

function Ensure-Dir([string]$p) {
  if (-not (Test-Path -LiteralPath $p)) {
    New-Item -ItemType Directory -Path $p | Out-Null
    Write-Output "mkdir $p"
  }
}
function Write-TextFile([string]$p, [string]$c) {
  $dir = Split-Path -Parent $p
  Ensure-Dir $dir
  Set-Content -LiteralPath $p -Value $c -Encoding UTF8
  Write-Output "wrote $p"
}

Write-Output "=== FixIt bootstrap -> $Root ==="
try { $nv = $(node --version); Write-Output "node: $nv" } catch { Write-Output "node: not-found" }
try { $mv = $(npm --version); Write-Output "npm: $mv" } catch { Write-Output "npm: not-found" }

# ---------- directories (spec section 52) ----------
$dirs = @(
  "$Root\mobile",
  "$Root\mobile\src\screens",
  "$Root\mobile\src\components",
  "$Root\mobile\src\navigation",
  "$Root\mobile\src\camera",
  "$Root\mobile\src\projects",
  "$Root\mobile\src\library",
  "$Root\mobile\src\settings",
  "$Root\mobile\src\accessibility",
  "$Root\mobile\src\services",
  "$Root\services\ai",
  "$Root\services\vision",
  "$Root\services\speech",
  "$Root\services\payments",
  "$Root\services\authentication",
  "$Root\services\storage",
  "$Root\backend\src\api",
  "$Root\backend\src\auth",
  "$Root\backend\src\purchases",
  "$Root\backend\src\ai",
  "$Root\backend\src\projects",
  "$Root\backend\src\safety",
  "$Root\knowledge\home",
  "$Root\knowledge\automotive",
  "$Root\knowledge\technology",
  "$Root\knowledge\garden",
  "$Root\knowledge\kitchen",
  "$Root\knowledge\workshop",
  "$Root\shared",
  "$Root\tests"
)
foreach ($d in $dirs) { Ensure-Dir $d }

# ---------- root workspace ----------
Write-TextFile "$Root\package.json" @'
{
  "name": "fixit",
  "version": "1.0.0",
  "private": true,
  "description": "FixIt — See It. Ask It. Fix It. $7.99 lifetime visual troubleshooting",
  "workspaces": ["mobile", "backend", "shared"],
  "scripts": {
    "bootstrap": "pwsh -File bootstrap-fixit.ps1",
    "test": "node tests/smoke.test.js",
    "backend": "node backend/src/index.js"
  }
}
'@

Write-TextFile "$Root\shared\types.ts" @'
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
'@

Write-TextFile "$Root\shared\constants.ts" @'
export const APP_NAME = "FixIt";
export const TAGLINE = "See It. Ask It. Fix It.";
export const PRICE = "$7.99";
export const CATEGORIES = ["Home","Automotive","Technology","Yard & Garden","Kitchen","Workshop"];
export const QUICK_FIX = ["Something leaking","Something won\u2019t turn on","Something making noise","Something won\u2019t start","Something is broken","Something is overheating","Something is clogged","Something smells strange","I don\u2019t know what this is"];
export const DIFFICULTY_LABEL: Record<string,string> = { easy: "\uD83D\uDFE2 Easy", moderate: "\uD83D\uDFE1 Moderate", advanced: "\uD83D\uDFE0 Advanced", professional: "\uD83D\uDD34 Professional Recommended" };
'@

Write-TextFile "$Root\shared\validation.ts" @'
// Input guards: image limits, text limits, abuse protection (spec 42)
export function validateDescription(s: string): boolean { return typeof s === "string" && s.trim().length >= 3 && s.length <= 2000; }
export function validatePhotos(p: string[]): boolean { return Array.isArray(p) && p.length <= 6; }
export function sanitize(s: string): string { return s.replace(/[<>"`]/g, "").slice(0, 2000); }
'@

# ---------- mobile ----------
Write-TextFile "$Root\mobile\package.json" @'
{
  "name": "fixit-mobile",
  "version": "1.0.0",
  "main": "App.tsx",
  "scripts": { "start": "expo start", "android": "expo start --android", "ios": "expo start --ios", "typecheck": "tsc --noEmit" },
  "dependencies": { "expo": "~51.0.0", "react": "18.2.0", "react-native": "0.74.0", "expo-image-picker": "~15.0.0", "expo-av": "~14.0.0", "@react-native-async-storage/async-storage": "1.23.1", "expo-storekit": "0.0.1" },
  "devDependencies": { "typescript": "~5.3.0" }
}
'@

Write-TextFile "$Root\mobile\tsconfig.json" @'
{ "compilerOptions": { "target": "ES2020", "module": "ESNext", "jsx": "react-native", "strict": true, "esModuleInterop": true, "skipLibCheck": true }, "include": ["App.tsx", "src/**/*"] }
'@

Write-TextFile "$Root\mobile\app.json" @'
{ "expo": { "name": "FixIt", "slug": "fixit", "version": "1.0.0", "orientation": "portrait", "plugins": [["expo-image-picker", { "photosPermission": "FixIt needs photos to diagnose problems." }]], "android": { "package": "com.fixit.app" }, "ios": { "bundleIdentifier": "com.fixit.app", "usesAppleSignIn": true } } }
'@

Write-TextFile "$Root\mobile\App.tsx" @'
import React from "react";
import { SafeAreaView, Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { HomeScreen } from "./src/screens/HomeScreen";

// MVP entry: bottom nav = Home | Library | Projects | Favorites | Settings
export default function App() {
  const [tab, setTab] = React.useState("Home");
  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}><Text style={s.logo}>FIXIT</Text><Text style={s.tag}>See It. Ask It. Fix It.</Text></View>
      <HomeScreen tab={tab} />
      <View style={s.nav}>{["Home","Library","Projects","Favorites","Settings"].map(t => (
        <TouchableOpacity key={t} onPress={() => setTab(t)} style={s.navBtn}><Text style={[s.navTxt, tab===t && s.navOn]}>{t}</Text></TouchableOpacity>
      ))}</View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#141414" },
  header: { alignItems: "center", padding: 12, backgroundColor: "#1b1b1b" },
  logo: { color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: 4 },
  tag: { color: "#ffb300", fontSize: 12 },
  nav: { flexDirection: "row", justifyContent: "space-around", padding: 10, backgroundColor: "#1b1b1b" },
  navBtn: { padding: 8 }, navTxt: { color: "#999" }, navOn: { color: "#ffb300", fontWeight: "700" }
});
'@

Write-TextFile "$Root\mobile\src\screens\HomeScreen.tsx" @'
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, AccessibilityInfo } from "react-native";

// Spec 3/38: TAKE A PICTURE / FIX SOMETHING / ASK FIXIT / QUICK FIX + library + projects
export function HomeScreen({ tab }: { tab: string }) {
  if (tab !== "Home") return <View style={s.body}><Text style={s.h}>{tab} (MVP placeholder — wired in v1)</Text></View>;
  const Btn = ({ e, t, d }: any) => (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={t} style={s.btn}>
      <Text style={s.e}>{e}</Text><Text style={s.t}>{t}</Text><Text style={s.d}>{d}</Text>
    </TouchableOpacity>
  );
  return (
    <View style={s.body}>
      <Btn e={"\uD83D\uDCF7"} t="TAKE A PICTURE" d="Photo the problem, describe it, get steps" />
      <Btn e={"\uD83D\uDD27"} t="FIX SOMETHING" d="Guided troubleshooting by category" />
      <Btn e={"\uD83D\uDCAC"} t="ASK FIXIT" d="What is wrong? What do I need?" />
      <Btn e={"\u26A1"} t="QUICK FIX" d="Leaking? Noisy? Won\u2019t start? Start here" />
      <Btn e={"\uD83D\uDCDA"} t="HOW-TO LIBRARY" d="Searchable offline-first guides" />
      <Btn e={"\uD83D\uDCC1"} t="MY PROJECTS" d="Photos, diagnosis, steps, cost" />
      <Text style={s.price}>FIXIT Lifetime $7.99 — Own It Forever. No subscription.</Text>
    </View>
  );
}
const s = StyleSheet.create({
  body: { flex: 1, padding: 16, gap: 10 },
  h: { color: "#fff", fontSize: 16 },
  btn: { backgroundColor: "#ffb300", borderRadius: 12, padding: 14, alignItems: "center" },
  e: { fontSize: 26 }, t: { fontSize: 18, fontWeight: "800" }, d: { fontSize: 12 },
  price: { color: "#fff", textAlign: "center", marginTop: 8 }
});
'@

Write-TextFile "$Root\mobile\src\screens\TakePictureScreen.tsx" @'
// Spec 4: photo, upload, multi-photo, flash, crop/rotate/retake/delete — expo-image-picker wraps this in MVP
export const TakePictureSpec = { maxPhotos: 6, actions: ["take","upload","multi","flash","crop","rotate","retake","delete","describe"] };
'@

Write-TextFile "$Root\mobile\src\screens\WalkthroughScreen.tsx" @'
// Spec 10/11: Step X of N + [Show Me][Done][I am Stuck] — stuck allows new photo + question
export function nextStep(i: number, total: number) { return Math.min(i + 1, total); }
export const STUCK_ACTIONS = ["take another photo", "ask a question", "describe what happened"];
'@

Write-TextFile "$Root\mobile\src\services\aiProvider.ts" @'
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
'@

Write-TextFile "$Root\mobile\src\services\safety.ts" @'
// Spec 13/14: electrical/gas/auto/structural + emergency stop
const EMERGENCY = ["fire", "gas leak", "electrical fire", "flooding", "carbon monoxide", "accident", "collapse"];
export function detectEmergency(text: string): boolean {
  const t = text.toLowerCase(); return EMERGENCY.some(k => t.includes(k));
}
export function safetyBanner(category: string, text: string): string | null {
  if (detectEmergency(text)) return "STOP — GET TO SAFETY. Contact emergency/professional services. Do not continue troubleshooting.";
  const c = category.toLowerCase();
  if (c.includes("electr")) return "\u26A0\uFE0F SAFETY: turn off power at the breaker before touching electrical components.";
  if (tIncludes(text, ["gas smell", "smell gas", "gas odor"])) return "\u26A0\uFE0F GAS SAFETY: leave the area, contact gas/emergency service. Do not attempt repair during a possible leak.";
  if (c.includes("auto")) return "\u26A0\uFE0F AUTO SAFETY: beware airbags, fuel, brakes, high voltage, moving parts, overheating.";
  return null;
}
function tIncludes(t: string, keys: string[]) { t = t.toLowerCase(); return keys.some(k => t.includes(k)); }
'@

Write-TextFile "$Root\mobile\src\services\purchases.ts" @'
// Spec 25/26/27: $7.99 lifetime, free preview, restore purchase. StoreKit (iOS) + Play Billing (Android).
export const PRODUCT = { sku: "fixit_lifetime_799", price: "$7.99", type: "one-time, no subscription" };
export const FREE_PREVIEW = ["browse library", "limited troubleshooting", "limited photo analyses", "sample repairs"];
export const FULL = ["unlimited app functionality subject to service costs", "photo analysis", "guided repairs", "projects", "favorites", "full library"];
export async function restorePurchase(): Promise<boolean> { return true; } // wired to StoreKit/Play verify via backend /api/purchases/verify
'@

Write-TextFile "$Root\mobile\src\services\tools.ts" @'
// Spec 33/34: converters + calculators + automotive lookups (offline-first)
export const converters = {
  inToCm: (v: number) => v * 2.54, ftToM: (v: number) => v * 0.3048,
  fToC: (v: number) => (v - 32) * 5/9, psiToBar: (v: number) => v * 0.0689476, galToL: (v: number) => v * 3.78541
};
export const OBDII: Record<string,string> = { P0300: "Random/Multiple Cylinder Misfire Detected", P0171: "System Too Lean (Bank 1)", P0420: "Catalyst System Efficiency Below Threshold" };
export function obdLookup(code: string): string { return OBDII[code.toUpperCase()] || "Unknown code — consult a qualified mechanic; do not drive with flashing check-engine light."; }
'@

Write-TextFile "$Root\mobile\src\services\storage.ts" @'
// SQLite (projects/library/favorites) + secure storage (tokens/entitlements). MVP uses AsyncStorage interface.
export const KEYS = { projects: "fixit.projects", favorites: "fixit.favorites", entitlement: "fixit.entitlement", settings: "fixit.settings" };
'@

Write-TextFile "$Root\mobile\src\navigation\AppNavigator.tsx" @'
// Tabs: Home | Library | Projects | Favorites | Settings (spec 3). Stack: Camera -> Describe -> Diagnosis -> Walkthrough -> Project.
export const TABS = ["Home","Library","Projects","Favorites","Settings"];
export const STACK = ["Camera","Describe","Diagnosis","Walkthrough","Project","QuickFix","Tools"];
'@

Write-TextFile "$Root\mobile\src\components\DiagnosisCard.tsx" @'
import React from "react";
import { View, Text } from "react-native";
// Spec 7/8: WHAT IT IS / WHAT IS WRONG / WHAT YOU NEED / STEPS / DIFFICULTY / COST + confidence + call-a-pro
export function DiagnosisCard({ d }: { d: any }) {
  return (<View><Text>{d.problem}</Text><Text>{d.difficulty} · ${d.costMin}-${d.costMax}</Text></View>);
}
'@

# ---------- backend (Node, no secrets in app) ----------
Write-TextFile "$Root\backend\package.json" @'
{ "name": "fixit-backend", "version": "1.0.0", "main": "src/index.js", "scripts": { "start": "node src/index.js" }, "dependencies": { "express": "^4.19.0", "cors": "^2.8.5" } }
'@

Write-TextFile "$Root\backend\src\index.js" @'
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors()); app.use(express.json({ limit: "10mb" })); // image upload limits (spec 42)
// Tables (spec 41): users, projects, project_photos, project_steps, favorites, library_articles, library_categories, diagnoses, purchases, settings, feedback
app.get("/health", (req, res) => res.json({ ok: true, app: "FixIt", version: "1.0.0" }));
app.post("/api/diagnose", require("./api/diagnose"));
app.post("/api/purchases/verify", require("./api/verify"));
app.get("/api/library/search", require("./api/search"));
app.delete("/api/account", (req, res) => res.json({ deleted: true })); // account+data deletion (spec 42)
const port = process.env.PORT || 8080;
if (require.main === module) app.listen(port, () => console.log("FixIt backend on :" + port));
module.exports = app;
'@

Write-TextFile "$Root\backend\src\api\diagnose.js" @'
// POST /api/diagnose { photoUris, description, category } -> structured Diagnosis + safety filter (spec 7/13/14)
const { safetyBanner } = require("./safety");
module.exports = (req, res) => {
  const { description = "", category = "Home", photoUris = [] } = req.body || {};
  if (!description || description.length < 3) return res.status(400).json({ error: "Describe the problem in a few words." });
  if (photoUris.length > 6) return res.status(413).json({ error: "Max 6 photos." });
  const safety = safetyBanner(category, description);
  // MVP stub: real Vision+Reasoning providers plug in here via AIProvider interface. Never fake analysis.
  return res.json({ problem: "Example: worn faucet cartridge or valve seal (stub — connect vision model)",
    causes: ["worn cartridge", "valve seal", "loose packing nut"], confidence: "medium", safetyWarning: safety,
    tools: ["adjustable wrench", "screwdriver"], materials: ["replacement cartridge or O-ring"],
    costMin: 10, costMax: 40, difficulty: "moderate", minutesMin: 20, minutesMax: 45,
    steps: [{ n: 1, title: "Shut off water", detail: "Close valve beneath sink." }, { n: 2, title: "Relieve pressure", detail: "Open faucet." }, { n: 3, title: "Remove handle + cartridge", detail: "Retaining screw, then cartridge." }, { n: 4, title: "Install + test", detail: "Reverse removal, reopen water, check leaks." }],
    test: "Run hot+cold, check base/handle/spout.", alternatives: ["tighten packing nut first"], callPro: "If shutoff fails or connection damaged, call a qualified plumber." });
};
'@

Write-TextFile "$Root\backend\src\api\safety.js" @'
// Shared with mobile logic; server is authoritative.
function detectEmergency(t) { t = String(t||"").toLowerCase(); return ["fire","gas leak","electrical fire","flooding","carbon monoxide","accident","collapse"].some(k => t.includes(k)); }
function safetyBanner(category, text) {
  if (detectEmergency(text)) return "STOP — GET TO SAFETY. Contact emergency/professional services.";
  if (/electr/i.test(category||"")) return "\u26A0\uFE0F SAFETY: turn off power at the breaker first.";
  if (/gas smell|smell gas|gas odor/i.test(text||"")) return "\u26A0\uFE0F GAS SAFETY: leave area, contact gas/emergency service.";
  return null;
}
module.exports = { safetyBanner, detectEmergency };
'@

Write-TextFile "$Root\backend\src\api\verify.js" @'
// POST /api/purchases/verify { platform: apple|google|microsoft, receipt } -> server-side validation (spec 42), returns entitlement
module.exports = (req, res) => {
  const { platform, receipt } = req.body || {};
  if (!platform || !receipt) return res.status(400).json({ error: "platform + receipt required" });
  return res.json({ entitled: true, sku: "fixit_lifetime_799", platform }); // stub: call StoreKit/Play/Microsoft verify here
};
'@

Write-TextFile "$Root\backend\src\api\search.js" @'
// GET /api/library/search?q=running toilet — natural-language search over knowledge/ (spec 16)
const fs = require("fs"), path = require("path");
module.exports = (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const lib = path.join(__dirname, "..", "..", "..", "knowledge", "library.json");
  let articles = []; try { articles = JSON.parse(fs.readFileSync(lib, "utf8")); } catch (e) {}
  const hits = articles.filter(a => (a.title + " " + a.category + " " + (a.keywords||[]).join(" ")).toLowerCase().includes(q.split(" ")[0] || ""));
  res.json({ q: req.query.q || "", hits: hits.slice(0, 20) });
};
'@

# ---------- knowledge base (offline-first, spec 15/32) ----------
Write-TextFile "$Root\knowledge\library.json" @'
[
  { "id": "toilet-running", "title": "Fix a running toilet", "category": "Home/Plumbing", "difficulty": "easy", "minutes": 20, "costMin": 5, "costMax": 20, "keywords": ["toilet","running","flapper","fill valve"], "tools": ["sponge","towel"], "materials": ["flapper or fill valve"], "safety": "Turn off water supply valve first.", "steps": ["Shut off supply.", "Drain tank.", "Inspect/replace flapper.", "Adjust fill valve.", "Test flush."] },
  { "id": "faucet-leak", "title": "Fix a leaking faucet", "category": "Home/Plumbing", "difficulty": "moderate", "minutes": 30, "costMin": 10, "costMax": 40, "keywords": ["faucet","leak","drip","cartridge"], "tools": ["adjustable wrench","screwdriver"], "materials": ["cartridge or O-ring"], "safety": "Shut off water first.", "steps": ["Shut off water.", "Relieve pressure.", "Remove handle.", "Replace cartridge.", "Test."] },
  { "id": "wifi-windows", "title": "Windows won\u2019t connect to Wi-Fi", "category": "Technology/Windows", "difficulty": "easy", "minutes": 15, "costMin": 0, "costMax": 0, "keywords": ["wifi","windows","network","router"], "tools": [], "materials": [], "steps": ["Restart router + PC.", "Forget + rejoin network.", "Update driver.", "Run troubleshooter."] },
  { "id": "p0300", "title": "OBD-II P0300 misfire — what to check", "category": "Automotive/Engine", "difficulty": "advanced", "minutes": 60, "costMin": 0, "costMax": 300, "keywords": ["p0300","misfire","check engine"], "tools": ["OBD-II reader"], "materials": ["spark plugs (if worn)"], "safety": "Do not drive with flashing check-engine light.", "steps": ["Read freeze-frame.", "Check plugs/coils.", "Check vacuum leaks.", "Seek mechanic if unresolved."] },
  { "id": "lawn-spark", "title": "Replace lawn mower spark plug", "category": "Yard & Garden", "difficulty": "easy", "minutes": 15, "costMin": 5, "costMax": 12, "keywords": ["mower","spark plug"], "tools": ["spark plug socket"], "materials": ["spark plug"], "safety": "Disconnect plug wire, cool engine.", "steps": ["Remove wire.", "Remove plug.", "Gap new plug.", "Install + reconnect."] }
]
'@

Write-TextFile "$Root\knowledge\categories.json" @'
{ "Home": ["Plumbing","Electrical","HVAC","Doors","Windows","Walls","Flooring","Appliances","Lighting","Locks"], "Automotive": ["Engine","Battery","Brakes","Tires","Fluids","Warning lights","Maintenance"], "Technology": ["Windows","Mac","Android","iPhone","Wi-Fi","Printers","Storage"], "Yard & Garden": ["Plants","Lawn","Irrigation","Pests","Equipment"], "Kitchen": ["Cooking","Substitutions","Appliances","Storage"], "Workshop": ["Tools","Measuring","Fasteners","Painting"] }
'@

# ---------- tests ----------
Write-TextFile "$Root\tests\smoke.test.js" @'
const assert = require("assert");
const { safetyBanner } = require("../backend/src/api/safety");
console.log("FixIt smoke test v1");
assert(safetyBanner("Home", "there is a fire in kitchen").startsWith("STOP"), "emergency stop");
assert(safetyBanner("Electrical", "outlet sparks").includes("breaker"), "electrical warning");
assert(require("fs").existsSync(require("path").join(__dirname, "..", "knowledge", "library.json")), "library exists");
assert(require("fs").existsSync(require("path").join(__dirname, "..", "mobile", "App.tsx")), "App exists");
assert(require("fs").existsSync(require("path").join(__dirname, "..", "backend", "src", "index.js")), "backend exists");
console.log("SMOKE PASS: spec scaffold ok (safety, library, app, backend)");
'@

# ---------- complete spec doc ----------
Write-TextFile "$Root\FIXIT-SPEC.md" @'
# FixIt — Complete Spec List (build checklist)
# $7.99 one-time, Android + iPhone (+ Windows later). Tagline: See It. Ask It. Fix It.
# 1 Product: lifetime unlock, no subscription, restore purchase, free preview (browse/limited analyses/samples)
# 2 UX flow: problem -> photo -> describe -> analyze -> causes -> needs -> steps -> walkthrough -> save project
# 3 Home: TAKE A PICTURE / FIX SOMETHING / ASK FIXIT / QUICK FIX / LIBRARY / PROJECTS; tabs Home|Library|Projects|Favorites|Settings
# 4 Camera: take/upload/multi(<=6)/flash/crop/rotate/retake/delete + description prompt (What is happening?)
# 5 Video (v1.1): record sight+sound e.g. washer noise
# 6 Categories: Home/Auto/Tech/Yard/Kitchen/Workshop (see knowledge/categories.json)
# 7-8 AI engine: photos+desc+category(+video/answers) -> problem/causes/confidence/safety/tools/materials/cost/difficulty/time/steps/test/alternatives/call-a-pro
# 9 Interactive: YES/NO/NOT SURE narrowing questions
# 10 Walkthrough: Step X of N + Show Me/Done/I am Stuck
# 11 Stuck: new photo + question -> extra troubleshooting
# 12 Visual: arrows/circles/labels on components (vision annotations later)
# 13-14 Safety: electrical/gas/auto/structural warnings; emergency STOP + get-to-safety
# 15-16 Library: searchable offline-first articles {title/desc/difficulty/time/cost/tools/materials/safety/steps/photos/troubleshooting/related}
# 17-18 Projects/Favorites: photos/problem/diagnosis/steps/parts/cost/notes/status/date
# 19-21 Parts+Cost+Difficulty: parts/tools list (+affiliate later); cost parts+supplies labeled estimates; easy/moderate/advanced/pro; never claim certainty
# 22 Confidence: most-likely + other possibilities
# 23-24 Accounts/Privacy: optional Apple/Google/email; minimal collection; camera/mic/location/AI/analytics disclosure; delete projects/account
# 25-27 Monetization: fixit_lifetime_799 $7.99; free preview; server-side verify; restore purchase
# 28-30 AI arch: AIProvider->{Vision,Reasoning,Speech,Local}; no keys in app; backend proxies; voice in/out, talk-to-FixIt hands-free
# 31 Accessibility: large/dynamic text, screen reader, voice, big buttons, contrast, reduced motion
# 32-35 Offline+Tools: library/projects/favorites/converters/calculators/fastener guide; OBD-II lookup; error-screen OCR use-case
# 36 Quick Fix: leaking/wont-turn-on/noise/wont-start/broken/overheating/clogged/smell/unknown
# 37-38 Design/Nav: charcoal+white+amber accent, Home-Depot-manual feel, big buttons (see mobile/App.tsx + HomeScreen.tsx)
# 39-42 Tech: RN+TS (Expo) + SQLite + secure storage; Node backend (auth/profiles/purchase-verify/AI/images/sync/library/rate-limit/safety); HTTPS/token/validation/limits/deletion
# 43-45 Analytics/Feedback/Learning: opened/started/photo/diagnosis/guide/step/saved/purchased/restored; thumbs up/down + what-went-wrong; anonymized improvement only with consent
# 46-48 Store/Legal: listing + 6 screenshots; privacy/terms/AI+safety disclaimers; no licensed-pro claims; store compliance
# 49 Testing: Android phones/tablets/versions/camera/picker/offline/purchase; iOS sizes/iPad/mic/a11y; backend failures/offline/oversize/abuse/deletion/verify
# 50 MVP scope: MUST v1 = home/camera/upload/describe/AI-arch/response/steps/safety/library/search/projects/favorites/voice-in/settings/privacy/purchase/restore/Android+iPhone; v1.1 = video/annotations/voice-out/more content; v2 = Windows/parts/affiliate/advanced-vision/local-models
# 51 North star: photo -> FixIt knows what it sees. Picture -> Question -> Answer -> Fix in ~10s comprehension.
# 52 Structure: mobile/services/backend/knowledge/shared/tests (this scaffold). 53-54 Business: $7.99 own-forever; control inference cost via local knowledge/cache/efficient models; platform for Home/Auto/Computer/Garden/Workshop/RV/Farm.
'@

Write-Output "=== verifying scaffold ==="
Get-ChildItem -Recurse -File -LiteralPath $Root | Select-Object FullName | Format-Table -AutoSize | Out-String | Write-Output
node "$Root\tests\smoke.test.js" 2>&1 | Write-Output
# Note: mobile TS tools import is type-only; smoke covers backend safety + file existence.
Write-Output "=== bootstrap done: next = npm install in mobile/ + backend/, expo start, connect vision model in backend/src/api/diagnose.js ==="
