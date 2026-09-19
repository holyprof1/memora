# MEMORA

A mobile-first digital memory / guestbook system powered by permanent QR identities printed on clothing.

## Stack

Next.js 16.3.5, React 19.3, TypeScript, SQLite (via `better-sqlite3`), Prisma 7.10, and the `qrcode` package.

Next.js 16.3.5 is an Active LTS release as of September 2026. Prisma 7.10 is the production-supported Prisma line used here rather than the Prisma 8 release candidate.

Local development uses a file-based SQLite database (`prisma/dev.db`) so there is nothing to install or run in the background — no Docker, no Postgres server. For production, swap to a managed PostgreSQL provider (see "Production deployment" below).

## Core behavior

Each shirt gets a permanent ID such as `001`, `002`, or `027`.

The QR points to:

`https://YOUR-DOMAIN/m/027`

The visitor never types the ID. The route loads the shirt record from PostgreSQL and the visitor's memory is saved against that shirt's `shirtId`.

Changing the display name or department does not change the `shirtId`, `pageUrl`, or stored QR SVG.

## Local setup

1. Copy `.env.example` to `.env`. `DATABASE_URL="file:./prisma/dev.db"` needs no server running.

2. Install dependencies and generate an admin password hash:

```bash
npm install
npm run admin:hash -- "your-strong-password"
```

Put the returned `scrypt:...` string into `ADMIN_PASSWORD_HASH`.

3. Set `NEXT_PUBLIC_APP_URL` to `http://localhost:3000` for local testing.

4. Create the schema:

```bash
npm run db:migrate
```

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000/admin/login` to sign in.

## Production deployment

SQLite is for local development only. For production, switch to a managed PostgreSQL database such as Neon or Supabase:

1. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"` and delete `prisma/migrations` (then re-run `npm run db:migrate` once against the Postgres database to create a fresh Postgres-flavored migration).
2. In `lib/prisma.ts`, swap the `better-sqlite3` adapter for `@prisma/adapter-pg` (`npm install @prisma/adapter-pg pg`), pointing it at `process.env.DATABASE_URL` directly (a Postgres connection string).
3. Set these environment variables in production:

`DATABASE_URL` — your Postgres connection string

`NEXT_PUBLIC_APP_URL` — the public HTTPS URL of MEMORA, for example `https://memora.ng`

`ADMIN_EMAIL`

`ADMIN_PASSWORD_HASH`

`SESSION_SECRET` — a random secret of at least 32 characters

Then run:

```bash
npm ci
npm run db:migrate:deploy
npm run build
npm start
```

`docker-compose.yml` is included if you'd rather run Postgres locally instead of SQLite (e.g. to test the production path); it's optional and not required for local development.

## Scaling notes

There are no per-shirt pages to create. `/m/[shirtId]` is a single dynamic route backed by the database.

The admin shirt list is paginated. Memories are loaded per shirt rather than loading every memory for every shirt at once.

Shirt IDs are generated from a database counter, so multiple admin requests can safely create unique IDs. Gaps are acceptable if a creation fails after the counter advances.

QR codes are stored as SVG in PostgreSQL, so the admin can display or download the exact QR generated when the shirt was created.
