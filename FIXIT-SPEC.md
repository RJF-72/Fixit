# FixIt — Complete Spec List (build checklist)
# $7.99 one-time, Android + iPhone (+ Windows later). Tagline: See It. Ask It. Fix It.
# 1 Product: lifetime unlock, no subscription, restore purchase, free preview (browse/limited analyses/samples)
# 2 UX flow: problem -> photo -> describe -> analyze -> causes -> needs -> steps -> walkthrough -> save project
# 3 Home: TAKE A PICTURE / FIX SOMETHING / ASK FIXIT / QUICK FIX / LIBRARY / PROJECTS; tabs Home|Library|Projects|Favorites|Settings
# 4 Camera: take/upload/multi(<=6)/flash/crop/rotate/retake/delete + description prompt (What is happening?)
# 5 Video (v1.1): record sight+sound e.g. washer noise
# 6 Categories: Home/Auto/Tech/Yard/Kitchen/Workshop (see knowledge/categories.json)
# 7-8 AI engine: photos+desc+category(+video/answers) -> problem/causes/confidence/safety/tools/materials/cost/difficulty/time/steps/test/alternatives/call-a-pro
# 9 Interactive: YES/NO/NOT SURE narrowing questions
# 10 Walkthrough: Step X of N + Show Me/Done/I am Stuck
# 11 Stuck: new photo + question -> extra troubleshooting
# 12 Visual: arrows/circles/labels on components (vision annotations later)
# 13-14 Safety: electrical/gas/auto/structural warnings; emergency STOP + get-to-safety
# 15-16 Library: searchable offline-first articles {title/desc/difficulty/time/cost/tools/materials/safety/steps/photos/troubleshooting/related}
# 17-18 Projects/Favorites: photos/problem/diagnosis/steps/parts/cost/notes/status/date
# 19-21 Parts+Cost+Difficulty: parts/tools list (+affiliate later); cost parts+supplies labeled estimates; easy/moderate/advanced/pro; never claim certainty
# 22 Confidence: most-likely + other possibilities
# 23-24 Accounts/Privacy: optional Apple/Google/email; minimal collection; camera/mic/location/AI/analytics disclosure; delete projects/account
# 25-27 Monetization: fixit_lifetime_799 $7.99; free preview; server-side verify; restore purchase
# 28-30 AI arch: AIProvider->{Vision,Reasoning,Speech,Local}; no keys in app; backend proxies; voice in/out, talk-to-FixIt hands-free
# 31 Accessibility: large/dynamic text, screen reader, voice, big buttons, contrast, reduced motion
# 32-35 Offline+Tools: library/projects/favorites/converters/calculators/fastener guide; OBD-II lookup; error-screen OCR use-case
# 36 Quick Fix: leaking/wont-turn-on/noise/wont-start/broken/overheating/clogged/smell/unknown
# 37-38 Design/Nav: charcoal+white+amber accent, Home-Depot-manual feel, big buttons (see mobile/App.tsx + HomeScreen.tsx)
# 39-42 Tech: RN+TS (Expo) + SQLite + secure storage; Node backend (auth/profiles/purchase-verify/AI/images/sync/library/rate-limit/safety); HTTPS/token/validation/limits/deletion
# 43-45 Analytics/Feedback/Learning: opened/started/photo/diagnosis/guide/step/saved/purchased/restored; thumbs up/down + what-went-wrong; anonymized improvement only with consent
# 46-48 Store/Legal: listing + 6 screenshots; privacy/terms/AI+safety disclaimers; no licensed-pro claims; store compliance
# 49 Testing: Android phones/tablets/versions/camera/picker/offline/purchase; iOS sizes/iPad/mic/a11y; backend failures/offline/oversize/abuse/deletion/verify
# 50 MVP scope: MUST v1 = home/camera/upload/describe/AI-arch/response/steps/safety/library/search/projects/favorites/voice-in/settings/privacy/purchase/restore/Android+iPhone; v1.1 = video/annotations/voice-out/more content; v2 = Windows/parts/affiliate/advanced-vision/local-models
# 51 North star: photo -> FixIt knows what it sees. Picture -> Question -> Answer -> Fix in ~10s comprehension.
# 52 Structure: mobile/services/backend/knowledge/shared/tests (this scaffold). 53-54 Business: $7.99 own-forever; control inference cost via local knowledge/cache/efficient models; platform for Home/Auto/Computer/Garden/Workshop/RV/Farm.
