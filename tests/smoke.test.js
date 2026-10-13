const assert = require("assert");
const { safetyBanner } = require("../backend/src/api/safety");
console.log("FixIt smoke test v1");
assert(safetyBanner("Home", "there is a fire in kitchen").startsWith("STOP"), "emergency stop");
assert(safetyBanner("Electrical", "outlet sparks").includes("breaker"), "electrical warning");
assert(require("fs").existsSync(require("path").join(__dirname, "..", "knowledge", "library.json")), "library exists");
assert(require("fs").existsSync(require("path").join(__dirname, "..", "mobile", "App.tsx")), "App exists");
assert(require("fs").existsSync(require("path").join(__dirname, "..", "backend", "src", "index.js")), "backend exists");
console.log("SMOKE PASS: spec scaffold ok (safety, library, app, backend)");
