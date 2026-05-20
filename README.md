# 🚀 Prowider — Mini Lead Distribution System

<div align="center">

### Fair • Reliable • Real-Time Lead Distribution Engine

A production-inspired full-stack lead distribution system that automatically routes customer leads using **mandatory assignment rules**, **persistent round-robin allocation**, **quota management**, **real-time updates**, and **safe concurrency handling**.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript\&logoColor=white)]()
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql\&logoColor=white)]()
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase\&logoColor=white)]()

</div>

---

## 🌐 Live Demo

🔗 **Application:** https://prowider-system-sigma.vercel.app/

🔗 **Provider Dashboard:** https://prowider-system-sigma.vercel.app/dashboard

🔗 **Testing Panel:** https://prowider-system-sigma.vercel.app/test-tools

---

# 📸 Screenshots

## Landing Page

![Landing](https://i.postimg.cc/RFLN64bg/Screenshot-2026-05-19-193712.png)

---

## Customer Request Form

![Request Service](https://i.postimg.cc/Rhc5VZsv/Screenshot-2026-05-19-211104.png)

---

## Provider Dashboard

![Dashboard](https://i.postimg.cc/63WGh8Zn/Screenshot-2026-05-19-211318.png)

---

## Internal Testing Panel

![Testing](https://i.postimg.cc/3x245XCs/Screenshot-2026-05-19-211506.png)

---

# ✨ Features

### Public Customer Request Flow

* Submit service enquiry
* Input validation
* Duplicate prevention
* Automatic lead allocation

---

### Intelligent Lead Distribution

* Exactly **3 providers per lead**
* Mandatory provider assignment rules
* Persistent round-robin distribution
* Fair allocation logic
* Provider quota enforcement

---

### Real-Time Dashboard

* Live provider updates
* No page refresh required
* Server Sent Events (SSE)

---

### Concurrency Safe

* Database transactions
* Row-level locking
* Race condition prevention

---

### Webhook & Idempotency

* Quota reset through webhook only
* Duplicate webhook prevention
* Safe repeated execution

---

# 🧠 System Workflow

```text
Customer Form
      ↓
Lead Created
      ↓
Business Rules Engine
      ↓
Mandatory Providers Added
      ↓
Round Robin Provider Selection
      ↓
Quota Validation
      ↓
Lead Assignments Stored
      ↓
Dashboard Updated (SSE)
```

---

# 📁 Project Structure

```bash
prowider-system/
│
├── app/
│   ├── api/
│   │   ├── leads/
│   │   ├── dashboard/
│   │   ├── dashboard/stream/
│   │   └── webhooks/
│   │
│   ├── dashboard/
│   ├── request-service/
│   ├── test-tools/
│   └── page.tsx
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── lib/
│   └── prisma.ts
│
├── public/
│
└── README.md
```

---

# ⚙️ Database Schema

## Services

| Field | Type   |
| ----- | ------ |
| id    | int    |
| name  | string |

---

## Providers

| Field                | Type   |
| -------------------- | ------ |
| id                   | int    |
| name                 | string |
| monthly_quota        | int    |
| leads_received_count | int    |

---

## Leads

| Field         | Type   |
| ------------- | ------ |
| id            | uuid   |
| customer_name | string |
| phone_number  | string |
| city          | string |
| service_id    | int    |
| description   | string |

Constraint:

```ts
(phone_number, service_id)
```

---

## Lead Assignments

Constraint:

```ts
(lead_id, provider_id)
```

---

## Round Robin State

Stores persistent allocation state.

---

## Webhook Events

Stores processed webhook IDs for idempotency.

---

# 🎯 Business Rules

### Mandatory Provider Assignment

| Service   | Providers               |
| --------- | ----------------------- |
| Service 1 | Provider 1              |
| Service 2 | Provider 5              |
| Service 3 | Provider 1 + Provider 4 |

---

### Fair Allocation Pools

| Service   | Pool        |
| --------- | ----------- |
| Service 1 | 2,3,4       |
| Service 2 | 6,7,8       |
| Service 3 | 2,3,5,6,7,8 |

---

Rules:

✅ Exactly 3 providers assigned

✅ Skip exhausted quota

✅ Persistent round-robin

✅ No duplicate provider assignments

---

# 🔄 Concurrency Handling

To prevent race conditions:

```ts
prisma.$transaction()
```

with:

```sql
SELECT ... FOR UPDATE
```

Used on:

```text
round_robin_state
```

Benefits:

* Safe simultaneous lead creation
* Consistent allocation
* No duplicate assignments
* Fair provider rotation

---

# 📡 Real-Time Updates

Dashboard updates automatically using:

```text
Server Sent Events (SSE)
```

Flow:

```text
Lead Created
      ↓
Event Triggered
      ↓
SSE Broadcast
      ↓
Dashboard Refresh
```

---

# 🧪 Testing Panel

Route:

```text
/test-tools
```

Available tools:

* Reset provider quota
* Webhook idempotency testing
* Generate concurrent requests

---

# 🛠️ Local Setup

Clone repository:

```bash
git clone https://github.com/abhiho11a/Prowider-system.git
```

Move into project:

```bash
cd prowider-system
```

Install dependencies:

```bash
npm install
```

Setup environment variables:

Create:

```env
.env
```

Add:

```env
DATABASE_URL=your_database_url

DIRECT_URL=your_direct_database_url
```

Generate Prisma:

```bash
npx prisma generate
```

Push schema:

```bash
npx prisma db push
```

Seed database:

```bash
npx tsx prisma/seed.ts
```

Run app:

```bash
npm run dev
```

---

# 🔍 Evaluation Focus

Priority:

1. Correct provider allocation
2. Concurrency safety
3. Webhook idempotency
4. Real-time updates
5. Database quality
6. Code clarity

---

# 👨‍💻 Tech Stack

Frontend:

* Next.js 14
* TypeScript
* TailwindCSS
* Lucide Icons

Backend:

* Next.js API Routes
* Prisma ORM

Database:

* PostgreSQL
* Supabase

Real-Time:

* Server Sent Events (SSE)

Deployment:

* Vercel

---

<div align="center">


</div>
