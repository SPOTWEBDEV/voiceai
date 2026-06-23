$env:NODE_OPTIONS="--max-old-space-size=4096"
Write-Host "Starting VoiceAI dev server with 4GB memory limit..." -ForegroundColor Green
npx next dev
