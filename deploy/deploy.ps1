# deploy/deploy.ps1 — one entry point for every FixIt release.
# Usage:
#   pwsh deploy/deploy.ps1 -Check                 # readiness gate (all stores)
#   pwsh deploy/deploy.ps1 -Version patch         # bump version + versionCode/buildNumber
#   pwsh deploy/deploy.ps1 -BackendDocker         # docker build + run backend locally
#   pwsh deploy/deploy.ps1 -WebExport             # expo web export -> mobile/dist (PWA, Microsoft Store input)
#   pwsh deploy/deploy.ps1 -BuildAndroid          # EAS cloud build (.aab for Play)
#   pwsh deploy/deploy.ps1 -BuildIos              # EAS cloud build (.ipa for App Store)
#   pwsh deploy/deploy.ps1 -SubmitAndroid         # EAS submit to Play (internal track, draft)
#   pwsh deploy/deploy.ps1 -SubmitIos             # EAS submit to App Store Connect
param(
  [switch]$Check,
  [string]$Version,
  [switch]$BackendDocker,
  [switch]$WebExport,
  [switch]$BuildAndroid,
  [switch]$BuildIos,
  [switch]$SubmitAndroid,
  [switch]$SubmitIos
)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
function Run([string]$cmd, [string]$dir) {
  Write-Output "> $cmd"
  if ($dir) { & pwsh -NoProfile -Command $cmd -Workdir $dir } else { Invoke-Expression $cmd }
}
if ($Check -or (-not ($Version -or $BackendDocker -or $WebExport -or $BuildAndroid -or $BuildIos -or $SubmitAndroid -or $SubmitIos))) {
  node "$Root\deploy\check.js"
  return
}
if ($Version) { node "$Root\deploy\version.js" --bump=$Version; return }
if ($BackendDocker) {
  docker build -t fixit-api "$Root\backend"
  docker run --rm -p 8080:8080 --env-file "$Root\backend\.env.example" fixit-api
  return
}
if ($WebExport) {
  # Produces mobile/dist — host it anywhere, then point PWABuilder at the URL for the Microsoft Store package.
  Run "npx expo export --platform web --output-dir dist" "$Root\mobile"
  Write-Output "Exported to mobile/dist. Host it (Vercel/Netlify/Azure SWA), then package at https://www.pwabuilder.com"
  return
}
if ($BuildAndroid) { Run "eas build --platform android --profile production" "$Root\mobile"; return }
if ($BuildIos) { Run "eas build --platform ios --profile production" "$Root\mobile"; return }
if ($SubmitAndroid) { Run "eas submit --platform android --profile production" "$Root\mobile"; return }
if ($SubmitIos) { Run "eas submit --platform ios --profile production" "$Root\mobile"; return }
