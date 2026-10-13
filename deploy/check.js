// deploy/check.js — readiness gate for all stores. Pure Node, no dependencies.
// Fails (exit 1) with actionable messages; passes with a checklist.
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const fail = [];
const ok = [];
function need(cond, label, hint) {
  if (cond) ok.push(label);
  else fail.push(label + "  <-- " + hint);
}
function json(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); }
  catch (e) { fail.push(p + " is not valid JSON (" + e.message + ")"); return null; }
}
const app = json(path.join(root, "mobile", "app.json"));
const mpkg = json(path.join(root, "mobile", "package.json"));
const eas = json(path.join(root, "mobile", "eas.json"));
const expo = app && app.expo;
if (expo) {
  need(expo.slug === "fixit", "slug=fixit", "set expo.slug to fixit");
  need(expo.scheme === "fixit", "scheme=fixit (deep links)", "set expo.scheme");
  need(expo.version === (mpkg && mpkg.version), "app.json version == package.json version (" + ((mpkg && mpkg.version) || "?") + ")", "run: node deploy/version.js --bump=patch");
  need(expo.android && expo.android.package === "com.fixit.app", "android.package=com.fixit.app", "Play requires a fixed applicationId");
  need(Number.isInteger(expo.android && expo.android.versionCode), "android.versionCode is integer", "increment on every Play upload (version.js does it)");
  need(expo.ios && expo.ios.bundleIdentifier === "com.fixit.app", "ios.bundleIdentifier=com.fixit.app", "App Store requires a fixed bundle id");
  need(expo.ios && expo.ios.buildNumber, "ios.buildNumber set", "increment on every App Store upload");
  need(expo.icon && fs.existsSync(path.join(root, "mobile", expo.icon)), "icon file exists (" + (expo.icon || "?") + ")", "add mobile/assets/icon.png (placeholder ok, real art before launch)");
  need(expo.web && expo.web.output === "static", "web.output=static (PWA export)", "needed for Microsoft Store / web hosting path");
  need(expo.extra && expo.extra.eas && expo.extra.eas.projectId && expo.extra.eas.projectId !== "SET_EAS_PROJECT_ID", "EAS projectId linked", "run: eas init — then set extra.eas.projectId");
}
if (eas) {
  need(eas.build && eas.build.production && eas.build.production.android, "eas production android profile", "needed for Play .aab builds");
  need(eas.build && eas.build.production && eas.build.production.ios, "eas production ios profile", "needed for App Store builds");
}
need(fs.existsSync(path.join(root, "backend", "Dockerfile")), "backend/Dockerfile", "needed for backend-anywhere deploys");
need(fs.existsSync(path.join(root, "render.yaml")), "render.yaml", "one-click backend deploy descriptor");
need(fs.existsSync(path.join(root, "store", "listing.md")), "store/listing.md", "single source of truth for listings");
need(fs.existsSync(path.join(root, "store", "privacy-policy.md")), "store/privacy-policy.md", "required by Play + App Store + Microsoft");
console.log("== FixIt deploy readiness ==");
ok.forEach((l) => console.log("  PASS " + l));
fail.forEach((l) => console.log("  FAIL " + l));
if (fail.length) { console.log(fail.length + " blocking issue(s) — see hints above."); process.exit(1); }
console.log("READY: all gates pass. Next: pwsh deploy/deploy.ps1 -Help");
