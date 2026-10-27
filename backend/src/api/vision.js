// backend/src/api/vision.js — real AI vision diagnosis for FixIt.
// Architecture: the app NEVER holds keys. The backend proxies to the vision
// provider using a server-side key from the environment. No new npm deps:
// uses Node's native fetch.
//
// Env:
//   FIXIT_AI_PROVIDER  "openai" (default) | "none" — AI_PROVIDER is accepted
//                      as an alias ("stub"/"none" = no provider, matching
//                      render.yaml / backend/.env.example).
//   OPENAI_API_KEY     required when provider is "openai"
//   FIXIT_AI_MODEL     default "gpt-4o" (OPENAI_MODEL accepted as an alias)
//
// Contract: diagnoseWithVision({ photoUris, description, category }) resolves
// to a Diagnosis matching shared/types.ts, or throws (never returns fake data).

const SYSTEM_PROMPT = `You are FixIt's repair troubleshooter. Given photos and a user's description of a problem, produce a structured repair diagnosis as JSON.

Rules you MUST follow:
- Output ONLY valid JSON matching this exact shape:
  {"problem": string, "causes": string[], "confidence": "high"|"medium"|"low",
   "tools": string[], "materials": string[],
   "costMin": number, "costMax": number, "difficulty": "easy"|"moderate"|"advanced"|"professional",
   "minutesMin": number, "minutesMax": number,
   "steps": [{"n": number, "title": string, "detail": string}],
   "test": string, "alternatives": string[], "callPro": string}
- NEVER claim certainty. Use "confidence" honestly: "low" when photos are unclear.
- "callPro" must name when to call a qualified professional (electrical panel work, gas lines, structural, refrigerant, airbags).
- Never present yourself as a licensed professional. This is troubleshooting guidance, not professional advice.
- costs are USD estimates for parts+supplies; minutes are hands-on time for a DIYer.
- steps: 3-8 concrete steps, each with a short title and one-sentence detail.
- If the photos/description are insufficient, set confidence "low", keep causes to the most likely, and say so in "test".`;

function providerName() {
  const raw = (process.env.FIXIT_AI_PROVIDER || process.env.AI_PROVIDER || "openai").toLowerCase();
  if (raw === "stub" || raw === "none") return "none";
  if (raw === "openai" || raw === "openai-compatible") return "openai";
  return raw;
}

function modelName() {
  return process.env.FIXIT_AI_MODEL || process.env.OPENAI_MODEL || "gpt-4o";
}

function isConfigured() {
  const p = providerName();
  if (p === "none") return false;
  if (p === "openai") return Boolean(process.env.OPENAI_API_KEY);
  return false;
}

async function diagnoseWithVision({ photoUris = [], description, category }) {
  const p = providerName();
  if (p === "openai") return diagnoseOpenAI({ photoUris, description, category });
  throw new Error("No AI provider configured (FIXIT_AI_PROVIDER=" + p + ").");
}

async function diagnoseOpenAI({ photoUris, description, category }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set.");
  const model = modelName();

  const content = [
    { type: "text", text: `Category: ${category}\nUser description: ${description}\nDiagnose the problem from the photos and description.` },
  ];
  for (const uri of photoUris.slice(0, 6)) {
    content.push({ type: "image_url", image_url: { url: uri, detail: "high" } });
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 60000);
  let res;
  try {
    res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 2000,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content },
        ],
      }),
    });
  } catch (e) {
    throw new Error("Vision provider request failed: " + (e.name === "AbortError" ? "timed out" : e.message));
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error("Vision provider error " + res.status + ": " + body.slice(0, 200));
  }
  const data = await res.json();
  const text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (!text) throw new Error("Vision provider returned no content.");
  let d;
  try {
    d = JSON.parse(text);
  } catch (e) {
    throw new Error("Vision provider returned invalid JSON.");
  }
  return sanitize(d);
}

// Enforce the Diagnosis shape; drop anything unexpected, fill safe defaults.
function sanitize(d) {
  const s = (v, fb = "") => (typeof v === "string" ? v : fb);
  const arr = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : []);
  const num = (v, fb) => (typeof v === "number" && isFinite(v) ? v : fb);
  const steps = Array.isArray(d.steps)
    ? d.steps.slice(0, 8).map((st, i) => ({
        n: typeof st.n === "number" ? st.n : i + 1,
        title: s(st.title, "Step " + (i + 1)),
        detail: s(st.detail),
      }))
    : [];
  const conf = ["high", "medium", "low"].includes(d.confidence) ? d.confidence : "low";
  const diff = ["easy", "moderate", "advanced", "professional"].includes(d.difficulty) ? d.difficulty : "moderate";
  return {
    problem: s(d.problem, "Unidentified issue — photos unclear"),
    causes: arr(d.causes).slice(0, 6),
    confidence: conf,
    tools: arr(d.tools).slice(0, 12),
    materials: arr(d.materials).slice(0, 12),
    costMin: num(d.costMin, 0),
    costMax: num(d.costMax, 0),
    difficulty: diff,
    minutesMin: num(d.minutesMin, 15),
    minutesMax: num(d.minutesMax, 60),
    steps,
    test: s(d.test),
    alternatives: arr(d.alternatives).slice(0, 4),
    callPro: s(d.callPro, "If anything looks unsafe or beyond basic tools, call a qualified professional."),
  };
}

module.exports = { diagnoseWithVision, isConfigured, providerName, modelName };
