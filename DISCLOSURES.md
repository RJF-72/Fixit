# FixIt — Disclosures for Buyers

Read this before buying. Everything below is stated plainly so there are no surprises.

## What is working
- Mobile app scaffold (Expo React Native + TypeScript, iOS + Android): Home, Take-Picture,
  Walkthrough screens, navigation, camera/upload flow (up to 6 photos), projects, favorites,
  offline-first library search.
- Node/Express backend: `/api/diagnose`, purchase verification hook, library search,
  quota/rate limiting, parts lookup, account/data deletion.
- Safety filter is real and tested: category-aware warnings plus emergency STOP banners
  for electrical/gas/fire scenarios (see `tests/smoke.test.js`).
- Store-compliance docs ship in the repo: `store/listing.md`, `store/privacy-policy.md`.
- No AI keys ship in the app — the backend proxies all AI calls (correct architecture).

## What is not finished — please read
1. **The AI diagnosis needs a vision API key to run live.** The vision provider is now wired
   (`backend/src/api/vision.js` → OpenAI GPT-4o vision, key from `OPENAI_API_KEY` env var,
   strict JSON output validated against the Diagnosis schema, safety filter and quota enforced).
   With no key set, the endpoint honestly returns a labeled demo stub (`stub: true`). The buyer
   supplies their own key at deploy — no code changes needed.
2. **The offline knowledge library now holds 28 articles** across Home, Automotive, Technology,
  Yard & Garden, Kitchen, and Workshop (was 5). The spec calls for a fuller library —
   the buyer can keep growing it.
3. **V2.0 features are spec'd, not built:** video diagnosis, voice-out, Windows version,
   parts/affiliate, advanced vision, local models (see `FIXIT-SPEC.md` §50). The current
   release is v1.0.
4. **Not published to the App Store or Play Store.** The $7.99 lifetime purchase flow
   (`fixit_lifetime_799`) was never tested against the live stores. (A Payhip $7.99 buy
   button exists on the marketing landing page.)
5. **$0 confirmed app-store revenue to date.** Pre-launch on the stores.

## Positioning (keep these in the product)
- FixIt is troubleshooting guidance software, **not a licensed professional** and not
  professional advice. The app disclaims professional-service claims; keep those
  disclaimers in place.
- Cost estimates are labeled estimates. Difficulty ratings never claim certainty
  (per spec §21: "never claim certainty").

## Fastest path to launch (buyer's checklist)
1. Connect a vision API key to `POST /api/diagnose`.
2. Grow the offline library past the 5 seeded articles.
3. Run the 6-screenshot shot list in `store/listing.md` and submit to both stores.
