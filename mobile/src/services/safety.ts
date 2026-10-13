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
