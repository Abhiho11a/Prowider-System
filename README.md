# Prowider

Mini lead distribution system that assigns each customer request to exactly three providers using mandatory rules and fair round-robin rotation.

## Tech stack

- Next.js 14 (App Router)
- PostgreSQL
- Prisma ORM
- Tailwind CSS
- Server-Sent Events (SSE)
- TypeScript

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL`
3. `npx prisma migrate dev --name init` (or `npm run db:push`)
4. `npx prisma db seed`
5. `npm run dev`

## Pages

| Route | Description |
|-------|-------------|
| `/request-service` | Customer lead submission form |
| `/dashboard` | Provider dashboard with live SSE updates |
| `/test-tools` | Internal quota, idempotency, and concurrency tests |

## API routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/leads` | Create lead and assign 3 providers |
| GET | `/api/dashboard` | All providers with assigned leads |
| GET | `/api/dashboard/stream` | SSE stream for live updates |
| POST | `/api/webhook/quota-reset` | Reset quotas (idempotent webhook) |

## Business logic

- Every lead is assigned to **exactly 3 providers**
- **Mandatory** assignments per service, then **round-robin** from the fair pool for remaining slots
- `monthly_quota` tracks remaining capacity per provider (starts at 10)
- Quotas reset only via the idempotent webhook (`/api/webhook/quota-reset`)
- Duplicate submissions (same phone + service) return HTTP 409
