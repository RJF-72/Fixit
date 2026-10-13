# FixIt — Deploy guide (all stores, one flow)

Source of truth for listing copy: `store/listing.md`. Readiness gate: `node deploy/check.js`
(or `pwsh deploy/deploy.ps1 -Check`). Fix every FAIL before submitting anything.

## One-time setup (15 min, do once)
1. `npm i -g eas-cli && eas login && eas init` inside `mobile/` — this fills
   `extra.eas.projectId` in `mobile/app.json`.
2. Google Play: create app `com.fixit.app`, create a service account, download the
   JSON key to `mobile/secrets/play-service-account.json` (gitignored, never commit).
3. App Store: ensure bundle id `com.fixit.app` in App Store Connect; set the three
   `SET_*` values in `mobile/eas.json` submit.ios.
4. Backend: set `API_URL` — `extra.apiUrl` in `app.json` must point at the deployed
   API (e.g. `https://api.fixit.app`), not localhost.

## Release (every version)
1. `pwsh deploy/deploy.ps1 -Version patch` — bumps version everywhere + Play
   `versionCode` + App Store `buildNumber` (both stores reject re-uploaded numbers).
2. `pwsh deploy/deploy.ps1 -Check` — must print READY.

## A. Google Play (Android)
1. `pwsh deploy/deploy.ps1 -BuildAndroid` — cloud build produces an `.aab`.
2. `pwsh deploy/deploy.ps1 -SubmitAndroid` — uploads to the **internal** track as draft.
3. In Play Console: internal → promote to production when happy. Listing copy comes
   from `store/listing.md`; privacy policy URL from `store/privacy-policy.md`
   (host it at `https://fixit.app/privacy` first — Play blocks submission without it).

## B. Apple App Store (iPhone/iPad)
1. `pwsh deploy/deploy.ps1 -BuildIos` — cloud build produces an `.ipa`.
2. `pwsh deploy/deploy.ps1 -SubmitIos` — uploads to App Store Connect.
3. In App Store Connect: fill listing from `store/listing.md`, submit for review.

## C. Microsoft Store (Windows, via PWA)
No separate codebase. The same app ships as an installable PWA:
1. `pwsh deploy/deploy.ps1 -WebExport` — outputs `mobile/dist`.
2. Host `mobile/dist` as plain HTTPS static hosting (Vercel, Netlify, or Azure
   Static Web Apps all work; any static host works).
3. Go to https://www.pwabuilder.com, enter the hosted URL, download the Windows
   package (MSIX), submit it in Partner Center. `app.json → web` already sets the
   PWA name, theme color, and display mode PWABuilder reads.

## D. Web / PWA (anywhere else)
`mobile/dist` from step C is a static site — deploy the folder to any static host.
Point `extra.apiUrl` at the production backend first so the PWA talks to real data.

## E. Backend (Render, Fly, Azure, any Docker host)
- Easy: connect the repo on Render — `render.yaml` already declares the `fixit-api`
  service with `/health` checks. Set `AI_PROVIDER` + `OPENAI_API_KEY` in the dashboard.
- Anywhere else: `pwsh deploy/deploy.ps1 -BackendDocker` builds/runs the image;
  push the same image to Fly/Azure App Service/AWS/GCP. Only the backend holds AI
  keys — the mobile app never does (spec §28/40).

## Pre-submission checklist
- [ ] `-Check` prints READY
- [ ] Real 512px icon + screenshots from `store/listing.md` § Screenshots
- [ ] Privacy policy + support URLs live
- [ ] `$7.99` lifetime IAP product created in Play Console + App Store Connect with
      SKU `fixit_lifetime_799`, verified via `/api/purchases/verify`
- [ ] Safety/emergency flows tested (fire/gas/electrical prompts)
