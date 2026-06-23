# VoiceAI — AI Voice Outreach Platform

A full-stack SaaS app that lets you upload contacts, create AI voice campaigns, and have GPT-4o call your contacts via Twilio — with live transcripts, AI summaries, and analytics.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Prisma ORM (PostgreSQL / MySQL / SQLite) |
| Auth | NextAuth v5 (JWT) |
| Telephony | Twilio Voice |
| AI | OpenAI GPT-4o + Whisper |

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
# Fill in all values — minimum required: DATABASE_URL, DB_PROVIDER, NEXTAUTH_SECRET
```

### 3. Set up database
```bash
npx prisma generate
npx prisma db push
```

### 4. Start development server
```bash
npm run dev
```

→ Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DB_PROVIDER` | ✅ | `postgresql`, `mysql`, or `sqlite` |
| `DATABASE_URL` | ✅ | Database connection string |
| `NEXTAUTH_SECRET` | ✅ | Random secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | ✅ | App URL e.g. `http://localhost:3000` |
| `OPENAI_API_KEY` | ✅ | OpenAI API key (GPT-4o + Whisper) |
| `TWILIO_ACCOUNT_SID` | ✅ | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | ✅ | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | ✅ | Twilio phone number e.g. `+12025551234` |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public URL for Twilio webhooks |

---

## Making Yourself an Admin

After registering, run this in your terminal:

```bash
npx prisma studio
# Open User table → find your user → change role from USER to ADMIN
```

Or with a direct SQL query:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

---

## Local Twilio Webhooks (ngrok)

Twilio needs a public URL to send call events to your local server:

```bash
# Install ngrok: https://ngrok.com
ngrok http 3000

# Copy the https URL, e.g. https://abc123.ngrok.io
# Set in .env.local:
NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
```

---

## CSV Import Format

Only `phone` is required. Supported column names are case-insensitive:

```csv
name,phone,email,company,notes
John Smith,+12025551234,john@co.com,Acme Inc,Met at conference
Jane Doe,+12025559876,jane@co.com,,
```

---

## Routes

### User Dashboard
| Route | Description |
|---|---|
| `/dashboard` | Overview stats + recent calls |
| `/contacts` | Upload & manage contacts |
| `/campaigns` | Create & launch campaigns |
| `/campaigns/new` | New campaign form |
| `/campaigns/[id]` | Campaign detail & call list |
| `/calls` | All calls with transcripts |
| `/analytics` | Call outcomes & summaries |
| `/settings` | Profile settings |

### Admin Panel (`/admin`)
| Route | Description |
|---|---|
| `/admin` | Platform-wide stats |
| `/admin/users` | All users + role management |
| `/admin/campaigns` | All campaigns |
| `/admin/calls` | All calls across users |
| `/admin/settings` | Platform API credentials |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Register, Forgot/Reset password
│   ├── (dashboard)/     # User dashboard routes
│   ├── (admin)/         # Admin panel routes
│   └── api/             # All API endpoints
├── components/
│   ├── landing/         # Public landing page sections
│   ├── layout/          # Sidebar, header
│   ├── admin/           # Admin-specific components
│   ├── campaigns/       # Campaign form + buttons
│   ├── calls/           # Calls table + transcript modal
│   ├── contacts/        # Upload + table
│   ├── settings/        # Settings form
│   └── ui/              # Base UI components
├── lib/
│   ├── auth.ts          # NextAuth config
│   ├── prisma.ts        # Prisma singleton
│   ├── twilio.ts        # Twilio helpers
│   └── openai.ts        # OpenAI helpers
└── prisma/
    └── schema.prisma    # All DB models
```
