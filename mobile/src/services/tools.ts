// Spec 33/34: converters + calculators + automotive lookups (offline-first)
export const converters = {
  inToCm: (v: number) => v * 2.54, ftToM: (v: number) => v * 0.3048,
  fToC: (v: number) => (v - 32) * 5/9, psiToBar: (v: number) => v * 0.0689476, galToL: (v: number) => v * 3.78541
};
export const OBDII: Record<string,string> = { P0300: "Random/Multiple Cylinder Misfire Detected", P0171: "System Too Lean (Bank 1)", P0420: "Catalyst System Efficiency Below Threshold" };
export function obdLookup(code: string): string { return OBDII[code.toUpperCase()] || "Unknown code — consult a qualified mechanic; do not drive with flashing check-engine light."; }
