// Input guards: image limits, text limits, abuse protection (spec 42)
export function validateDescription(s: string): boolean { return typeof s === "string" && s.trim().length >= 3 && s.length <= 2000; }
export function validatePhotos(p: string[]): boolean { return Array.isArray(p) && p.length <= 6; }
export function sanitize(s: string): string { return s.replace(/[<>"`]/g, "").slice(0, 2000); }
