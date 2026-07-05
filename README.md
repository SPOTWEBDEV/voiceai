# VoiceAI — AI Outreach Platform

A full-stack SaaS app for Voice Call, SMS, and Email campaigns with AI-powered conversations, real-time transcripts, and analytics.

---

## Channels Supported

| Channel | Powered By | Free? |
|---|---|---|
| Voice Call | Twilio + OpenRouter AI | OpenRouter free; Twilio has trial credit |
| SMS | Twilio | Twilio trial credit (~$15) |
| Email | SMTP (Gmail, Outlook, etc.) | Free with Gmail |

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env.local
# Fill in .env.local (see below)

# 3. Database
npx prisma db push

# 4. Run
npm run dev
```

Open http://localhost:3000

---

## Required Environment Variables

### Minimum (to run the app)
```env
DB_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### For Voice Calls
```env
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1..."
OPENROUTER_API_KEY="sk-or-v1-..."
OPENROUTER_MODEL="meta-llama/llama-3.1-8b-instruct:free"
```
> For local Twilio webhooks, use ngrok: https://ngrok.com  
> Set NEXT_PUBLIC_APP_URL to your ngrok URL

### For SMS
Same Twilio credentials as above.

### For Email
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="you@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="Your Name <you@gmail.com>"
```
> Gmail App Password: https://myaccount.google.com/apppasswords

---

## Making Yourself Admin

After registering, run in terminal:
```bash
npx prisma studio
# Users table → set your role to ADMIN → Save
```

---

## Campaign Types

### Voice Call
- AI calls each contact using Twilio
- GPT-quality conversation via OpenRouter (free models)
- Full transcript + AI summary generated after each call

### SMS
- Sends personalized SMS to each contact
- Supports {{name}}, {{email}}, {{company}}, {{phone}} variables
- Requires contacts to have phone numbers

### Email
- Sends HTML emails via your SMTP server
- Supports template variables
- Requires contacts to have email addresses

---

## Netlify Deployment

Set these environment variables in Netlify dashboard:
```
DB_PROVIDER, DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL,
NEXT_PUBLIC_APP_URL, OPENROUTER_API_KEY, OPENROUTER_MODEL,
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER,
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
```

---

## After Schema Changes

If you pull a new version, always run:
```bash
npx prisma db push
```
