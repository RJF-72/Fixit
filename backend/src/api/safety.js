// Shared with mobile logic; server is authoritative.
function detectEmergency(t) { t = String(t||"").toLowerCase(); return ["fire","gas leak","electrical fire","flooding","carbon monoxide","accident","collapse"].some(k => t.includes(k)); }
function safetyBanner(category, text) {
  if (detectEmergency(text)) return "STOP — GET TO SAFETY. Contact emergency/professional services.";
  if (/electr/i.test(category||"")) return "\u26A0\uFE0F SAFETY: turn off power at the breaker first.";
  if (/gas smell|smell gas|gas odor/i.test(text||"")) return "\u26A0\uFE0F GAS SAFETY: leave area, contact gas/emergency service.";
  return null;
}
module.exports = { safetyBanner, detectEmergency };
