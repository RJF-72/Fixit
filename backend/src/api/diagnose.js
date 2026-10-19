// POST /api/diagnose { photoUris, description, category, deviceId, tier } -> structured Diagnosis + safety filter (spec 7/13/14)
const { safetyBanner } = require("./safety");
const { checkQuota, consumeQuota, quotaHeaders } = require("./quota");
const { partsLinks } = require("./parts");
const vision = require("./vision");

function stubDiagnosis(safety, after) {
  // Labeled demo stub: returned ONLY when no vision provider is configured.
  // The response carries stub:true so clients can show "demo mode" honestly.
  const materials = ["replacement cartridge or O-ring"];
  return {
    stub: true,
    notice: "Demo mode — no vision AI key configured on this server (set OPENAI_API_KEY).",
    problem: "Example: worn faucet cartridge or valve seal",
    causes: ["worn cartridge", "valve seal", "loose packing nut"],
    confidence: "medium",
    safetyWarning: safety,
    tools: ["adjustable wrench", "screwdriver"],
    materials,
    costMin: 10, costMax: 40, difficulty: "moderate", minutesMin: 20, minutesMax: 45,
    steps: [
      { n: 1, title: "Shut off water", detail: "Close valve beneath sink." },
      { n: 2, title: "Relieve pressure", detail: "Open faucet." },
      { n: 3, title: "Remove handle + cartridge", detail: "Retaining screw, then cartridge." },
      { n: 4, title: "Install + test", detail: "Reverse removal, reopen water, check leaks." },
    ],
    test: "Run hot+cold, check base/handle/spout.",
    alternatives: ["tighten packing nut first"],
    callPro: "If shutoff fails or connection damaged, call a qualified plumber.",
    findParts: partsLinks(materials, "Home"),
    quota: after,
  };
}

module.exports = async (req, res) => {
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

  if (!vision.isConfigured()) {
    return res.json(stubDiagnosis(safety, after));
  }
  try {
    const d = await vision.diagnoseWithVision({ photoUris, description, category });
    const materials = d.materials || [];
    return res.json({
      ...d,
      safetyWarning: safety,
      findParts: partsLinks(materials, category),
      quota: after,
    });
  } catch (e) {
    // Never fake analysis: on provider failure, say so and point at the offline library.
    console.error("vision diagnosis failed:", e.message);
    return res.status(502).json({
      error: "AI diagnosis is temporarily unavailable.",
      detail: e.message,
      fallback: "Use the offline How-To Library and search — unlimited and free.",
      safetyWarning: safety,
      quota: after,
    });
  }
};
