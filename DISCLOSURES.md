# FixIt — Disclosures for Buyers

Read this before buying. Everything below is stated plainly so there are no surprises.

## What is working
- Mobile app (Expo React Native + TypeScript, iOS + Android): Home, Take-Picture,
  Walkthrough and Unlock screens, navigation, camera/upload flow (up to 6 photos,
  base64-encoded to the backend), projects, favorites, offline-first library search.
  The diagnosis path is wired end-to-end in code: photo → `POST /api/diagnose` →
  GPT-4o vision (or the labeled demo stub), with the demo notice rendered in the UI.
- Node/Express backend: `/api/diagnose`, RevenueCat-backed purchase verification
  (`/api/purchases/verify` — an unconfigured or unverified purchase is never
  entitled), library search, quota/rate limiting (monthly caps settable via
  `FIXIT_PREVIEW_MONTHLY_LIMIT` / `FIXIT_FULL_MONTHLY_LIMIT`), parts lookup,
  account/data deletion.
- Safety filter is real and tested: category-aware warnings plus emergency STOP banners
  for electrical/gas/fire scenarios. Test suite: `npm test` runs smoke, economics,
  diagnosis, billing, and HTTP end-to-end tests (all passing, Oct 26, 2026).
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
   (`fixit_lifetime_799`) is now implemented in code — RevenueCat SDK in the app
   (buy/restore) plus server-side verification against RevenueCat — but it has
   **never been tested against the live stores**: it still needs a RevenueCat
   account + public SDK keys in `mobile/app.json`, the product created in Play
   Console / App Store Connect, the backend's `REVENUECAT_API_KEY`, and an
   EAS build uploaded through the developer account. (A Payhip $7.99 buy
   button exists on the marketing landing page.)
5. **$0 confirmed app-store revenue to date.** Pre-launch on the stores.

## Positioning (keep these in the product)
- FixIt is troubleshooting guidance software, **not a licensed professional** and not
  professional advice. The app disclaims professional-service claims; keep those
  disclaimers in place.
- Cost estimates are labeled estimates. Difficulty ratings never claim certainty
  (per spec §21: "never claim certainty").

## Fastest path to launch (buyer's checklist)
1. Deploy the backend and connect a vision API key (`OPENAI_API_KEY`) for live diagnosis.
2. Create the RevenueCat account + store product, put the public SDK keys in
   `mobile/app.json` and the secret key in the backend env.
3. Run the 6-screenshot shot list in `store/listing.md` and submit to both stores.
