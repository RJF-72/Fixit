// Spec 10/11: Step X of N + [Show Me][Done][I am Stuck] — stuck allows new photo + question
export function nextStep(i: number, total: number) { return Math.min(i + 1, total); }
export const STUCK_ACTIONS = ["take another photo", "ask a question", "describe what happened"];
