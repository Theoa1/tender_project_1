# Tender Child Care — Booking Site

Modern, Material UI booking site for **Tender Loving Parenting Support**. Next.js 14 App Router + MUI v5 + Prisma + Postgres + JWT auth + email/SMS verification + notifications.

## Features

### Public
- ⚡ Fast Next.js App Router with **static-cached** marketing pages
- 🎨 Material UI v5 design with brand colors from the logo, `next/font` bundled Inter (no FOUT, no CLS)
- 📅 Booking form at `/contact` with **inline email + SMS verification** — both 6-digit codes required before the booking is created
- 👤 Passwordless client login at `/account/login` — email a code, see all past / upcoming bookings

### Owner
- 🔐 Owner-only `/admin` (JWT cookie, middleware-protected)
- 🗂 Dashboard with search, tabs by status, badge counts
- ✅ One-click **Accept**, **Cancel**, **Mark done** on every card
- ✏️ Full **Edit dialog** for status / service / date / time / notes
- 📧 Clients are auto-notified by **email + SMS** when you confirm or cancel

### Infra
- 🗄 **Cloud Postgres** via Prisma (Neon, Supabase, Vercel Postgres, Railway — all work)
- 📨 SMTP (Nodemailer) for email, Twilio for SMS — gracefully degrade if not configured
- 🛡 Verification codes are bcrypt-hashed, expire in 10 min, max 5 attempts, invalidated on reissue

## Setup (~10 min)

### 1. Database — Neon (free)
1. Sign up at **https://neon.tech**
2. Create a project, pick a region close to your users (e.g. `AWS us-east-1`)
3. Click **"Connection string"** → toggle **"Pooled connection"** → copy
4. Looks like: `postgresql://USER:PASS@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`

Any other provider works the same — just paste their connection string.

### 2. Local env
```powershell
cd 'C:\Users\tarthur28\Desktop\New folder'
Copy-Item .env.example .env
```

Edit `.env`:

| Key | What to put |
|---|---|
| `DATABASE_URL` | Neon pooled URL from step 1 |
| `OWNER_EMAIL` | Email you'll log in with |
| `OWNER_PASSWORD_HASH` | `node -e "console.log(require('bcryptjs').hashSync('YourStrongPassword',10))"` |
| `AUTH_SECRET` | `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"` |
| `SMTP_*` | SMTP creds (Gmail App Password works) |
| `TWILIO_*` | Twilio SID, Auth Token, verified sending number |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` for dev |

### 3. Initialize DB
```powershell
npx prisma migrate dev --name init
```

### 4. Run
```powershell
npm run dev
```
Open http://localhost:3000

## Routes

| Route | Purpose |
|---|---|
| `/` | Marketing home |
| `/about`, `/services`, `/resources` | Static marketing pages |
| `/contact` | Booking form (with inline email + SMS verification) |
| `/account/login` | Passwordless client login |
| `/account` | Client's past / upcoming bookings |
| `/admin/login` | Owner login |
| `/admin` | Owner dashboard |

## API

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/api/verify/send` | public | `{ email?, phone?, purpose: 'booking'\|'login' }` |
| POST | `/api/bookings` | public | form + `emailCode` + `phoneCode` |
| GET | `/api/bookings` | owner | list all |
| PATCH | `/api/bookings/:id` | owner | partial update; auto-notifies client on status change |
| DELETE | `/api/bookings/:id` | owner | hard delete |
| POST | `/api/account/login` | public | `{ email, code }` → 30-day client cookie |
| POST | `/api/account/logout` | client | — |
| POST | `/api/auth/login` | public | owner credentials |
| POST | `/api/auth/logout` | owner | — |

## Latency notes
- Marketing pages are `force-static` with `revalidate=3600` → served from edge cache
- Fonts via `next/font/google` (no extra HTTP round-trip, zero CLS)
- `optimizePackageImports` for `@mui/material` + `@mui/icons-material` (tree-shaken)
- Notifications fire **after** the API responds (`Promise.allSettled`) so users never wait on SMTP/Twilio
- Use a **pooled** Neon URL — sub-50ms instead of 800ms cold starts
- Deploy on Vercel in the **same region** as Neon for sub-50ms DB latency

## Production
```powershell
npm run build
npm start
```
The `build` script runs `prisma generate` + `prisma migrate deploy` for you.
