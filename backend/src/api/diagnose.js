// POST /api/diagnose { photoUris, description, category, deviceId, tier } -> structured Diagnosis + safety filter (spec 7/13/14)
const { safetyBanner } = require("./safety");
const { checkQuota, consumeQuota, quotaHeaders } = require("./quota");
const { partsLinks } = require("./parts");
module.exports = (req, res) => {
  const { description = "", category = "Home", photoUris = [] } = req.body || {};
  if (!description || description.length < 3) return res.status(400).json({ error: "Describe the problem in a few words." });
  if (photoUris.length > 6) return res.status(413).json({ error: "Max 6 photos." });
  const safety = safetyBanner(category, description);
  // Tier MUST come from server-side purchase verification in production
  // (see ./verify); the client value is accepted only until verify is wired.
  const deviceId = req.body.deviceId || req.headers["x-device-id"] || "anonymous";
  const tier = req.body.tier === "full" ? "full" : "preview";
  const q = checkQuota(deviceId, tier);
  quotaHeaders(res, q);
  if (!q.allowed) {
    return res.status(429).json({ error: "Monthly AI analysis allowance used (" + q.limit + ").",
      fallback: "Use the offline How-To Library and search — unlimited and free.",
      findParts: [], quota: q });
  }
  const after = consumeQuota(deviceId, tier);
  quotaHeaders(res, after);
  const materials = ["replacement cartridge or O-ring"];
  // MVP stub: real Vision+Reasoning providers plug in here via AIProvider interface. Never fake analysis.
  return res.json({ problem: "Example: worn faucet cartridge or valve seal (stub — connect vision model)",
    causes: ["worn cartridge", "valve seal", "loose packing nut"], confidence: "medium", safetyWarning: safety,
    tools: ["adjustable wrench", "screwdriver"], materials: ["replacement cartridge or O-ring"],
    costMin: 10, costMax: 40, difficulty: "moderate", minutesMin: 20, minutesMax: 45,
    steps: [{ n: 1, title: "Shut off water", detail: "Close valve beneath sink." }, { n: 2, title: "Relieve pressure", detail: "Open faucet." }, { n: 3, title: "Remove handle + cartridge", detail: "Retaining screw, then cartridge." }, { n: 4, title: "Install + test", detail: "Reverse removal, reopen water, check leaks." }],
    test: "Run hot+cold, check base/handle/spout.", alternatives: ["tighten packing nut first"], callPro: "If shutoff fails or connection damaged, call a qualified plumber.",
    findParts: partsLinks(materials, category), quota: after });
};
