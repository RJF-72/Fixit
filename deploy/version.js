// deploy/version.js — single version bump across mobile package.json + app.json.
// Usage: node deploy/version.js --bump=patch|minor|major  (default patch)
// Also increments android.versionCode and ios.buildNumber (required by both stores on every upload).
const fs = require("fs");
const path = require("path");
const bump = (process.argv.find((a) => a.startsWith("--bump=")) || "--bump=patch").split("=")[1];
if (!["patch", "minor", "major"].includes(bump)) { console.error("bump must be patch|minor|major"); process.exit(1); }
const pkgPath = path.join(__dirname, "..", "mobile", "package.json");
const appPath = path.join(__dirname, "..", "mobile", "app.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const app = JSON.parse(fs.readFileSync(appPath, "utf8"));
const parts = pkg.version.split(".").map(Number);
if (bump === "patch") parts[2] += 1;
if (bump === "minor") { parts[1] += 1; parts[2] = 0; }
if (bump === "major") { parts[0] += 1; parts[1] = 0; parts[2] = 0; }
pkg.version = parts.join(".");
app.expo.version = pkg.version;
app.expo.android.versionCode = (app.expo.android.versionCode || 0) + 1;
app.expo.ios.buildNumber = String(Number(app.expo.ios.buildNumber || 0) + 1);
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
fs.writeFileSync(appPath, JSON.stringify(app.expo ? app : { expo: app }, null, 2) + "\n");
console.log("version -> " + pkg.version + "  versionCode=" + app.expo.android.versionCode + "  buildNumber=" + app.expo.ios.buildNumber);
