# AGI Aeronautics — AITC Platform

The marketing site + web app for **AGI Aeronautics**, home of **AITC**, a futuristic,
AI-augmented, web-based air traffic control simulator.

Stack: **Next.js 14 (App Router, TypeScript)** · **Tailwind CSS** · **Prisma + PostgreSQL** ·
**OpenAI** (embeddings + chat) · deployed on **Railway**.

## What's included

- Futuristic dark/HUD-style marketing site (radar animation, glowing panels, HUD grid).
- Email/password auth (JWT in an httpOnly cookie) with two roles:
  - `USER` — registers via `/register`, gets a personal (currently blank/"coming soon")
    dashboard at `/dashboard`.
  - `ADMIN` — a single account, bootstrapped automatically from environment variables
    (see below). The `/admin` section is invisible/inaccessible to regular users
    (enforced both in middleware and on every admin API route).
- **Admin → Knowledge Base**: upload a `.txt`, `.md`, `.pdf`, or `.docx` file. The
  document is parsed, split into overlapping chunks, embedded with OpenAI
  (`text-embedding-3-small`), and stored in Postgres.
- **AI chat widget** (bottom-right, on every page): answers visitor questions using
  only the uploaded knowledge base (retrieval-augmented generation over the stored
  embeddings, cosine similarity computed in the app). If nothing relevant is found, it
  asks the visitor for their name + email and stores that as an **inquiry** for the
  team to follow up on by email.
- **Contact page** (`/contact`): name, organization, email, message → stored as an
  inquiry.
- **Admin → Inquiries**: view/manage every inquiry (from the contact form and from the
  chatbot fallback), with status (`New` / `Answered` / `Archived`).

## Project structure

```
prisma/schema.prisma      Database models (User, Document, KnowledgeChunk, Inquiry)
prisma/seed.ts            Creates/updates the Admin user from env vars on every deploy
src/app/                  Pages (App Router) + API routes (src/app/api/**)
src/components/           UI components (Navbar, ChatWidget, RadarBackground, ...)
src/lib/                  auth, session, db (Prisma client), OpenAI, chunking, similarity
src/middleware.ts         Protects /admin (ADMIN only) and /dashboard (logged-in users)
public/logo/agi-logo.png  Company logo (used in navbar, footer, favicon)
```

## Environment variables

Create these locally in a `.env` file (see `.env.example`) and as **Variables** on your
Railway service. Suggested exact names (the app expects these exact keys):

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. On Railway, add a **Postgres** database plugin to the project, then set this to `${{Postgres.DATABASE_URL}}` so it's wired automatically. |
| `OPENAI_API_KEY` | Your OpenAI API key, used for embeddings + chat completions. |
| `JWT_SECRET` | Long random string used to sign session cookies. Generate one with `openssl rand -base64 48`. |
| `ADMIN_NAME` | Display name for the admin account (e.g. `AGI Administrator`). |
| `ADMIN_EMAIL` | Email/username for the one Admin account. This is what you log in with at `/login`. |
| `ADMIN_PASSWORD` | Password for the Admin account. Change this in Railway any time to rotate the password — it's re-applied on every deploy. |
| `NEXT_PUBLIC_SITE_URL` | (Optional) Public URL of the site, e.g. `https://agiaeronautics.com`. |

The admin account is **not** created through the public `/register` form — it is
created/updated automatically from `ADMIN_EMAIL` / `ADMIN_PASSWORD` every time the app
deploys (via `prisma/seed.ts`, run as a Railway `preDeployCommand`). Regular visitors who
sign up through `/register` always get the `USER` role and never see `/admin`.

## Local development

```bash
npm install
cp .env.example .env      # then fill in real values
npm run db:migrate:dev    # creates tables in your local/dev Postgres
npm run db:seed           # creates the admin user from ADMIN_EMAIL/ADMIN_PASSWORD
npm run dev
```

Visit `http://localhost:3000`. Log in at `/login` with your `ADMIN_EMAIL` /
`ADMIN_PASSWORD` to reach `/admin`.

## Deploying on Railway

1. **Create a new Railway project** and deploy this repo (GitHub repo or `railway up`).
2. **Add a PostgreSQL database** to the project (Railway → New → Database → PostgreSQL).
   Standard Railway Postgres is fine — the app stores embeddings as native Postgres
   `float[]` arrays and computes similarity in the app, so no special `pgvector`
   extension/template is required.
3. On your web service, open **Variables** and add:
   - `DATABASE_URL` → reference the Postgres plugin: `${{Postgres.DATABASE_URL}}`
   - `OPENAI_API_KEY` → your OpenAI key
   - `JWT_SECRET` → a long random string
   - `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` → your admin login
   - `NEXT_PUBLIC_SITE_URL` → your Railway/custom domain, once known
4. Railway will detect Node via Nixpacks and use `railway.json` in this repo, which:
   - Builds with `npm run build` (`prisma generate && next build`)
   - Runs `npx prisma migrate deploy` and `npm run db:seed` before each deploy
   - Starts with `npm run start` (binds to Railway's `$PORT` automatically)
5. Once live, generate a public domain under **Settings → Networking**.
6. Log in at `/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`, go to `/admin/knowledge`,
   and upload your first knowledge-base document.

## Knowledge base notes

- Uploaded files are **not** stored as files — they're parsed to text immediately,
  chunked (~1,200 characters with 200 character overlap), embedded, and only the text
  + embedding vectors are kept in Postgres. This keeps things simple on Railway's
  ephemeral filesystem (no volume required).
- The chatbot only answers from what's been uploaded. If a question isn't covered by
  the knowledge base (similarity below threshold, or the model says it can't answer
  from context), it prompts the visitor to leave their name + email, which is saved as
  an `Inquiry` with `source = CHATBOT` and the full conversation attached as context.

## Content still to come

The landing page copy (features, stats, simulator details) is placeholder content
reflecting the AITC concept — swap it out in `src/app/page.tsx` once you finalize
messaging. The `/dashboard` page is intentionally blank/"coming soon" until the
aviation-specific user experience is defined.
