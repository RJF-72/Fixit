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
1. **The AI diagnosis engine is a labeled stub.** `backend/src/api/diagnose.js` returns a
   hardcoded example diagnosis. The provider interface (`AIProvider`) is built and the code
   comments say "stub — connect vision model" / "Never fake analysis". The buyer connects
   their own vision API key (OpenAI / Anthropic / Google). The pipeline is ready for it;
   the model call itself is not wired.
2. **The offline knowledge library is seeded with 5 articles.** The spec calls for a fuller
   library — the buyer grows it.
3. **v1.1 / v2 features are spec'd, not built:** video diagnosis, voice-out, Windows version
   (see `FIXIT-SPEC.md` §50).
4. **Not published to the App Store or Play Store.** The $7.99 lifetime purchase flow
   (`fixit_lifetime_799`) was never tested against the live stores.
5. **$0 revenue to date.** Pre-revenue, pre-launch. Priced as structured, documented
   software with a clear path to launch — not as a finished business.

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
