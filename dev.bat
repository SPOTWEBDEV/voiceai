@echo off
echo Starting VoiceAI dev server with 4GB memory limit...
set NODE_OPTIONS=--max-old-space-size=4096
npx next dev
