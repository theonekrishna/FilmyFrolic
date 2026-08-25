# 🎬 FilmyFrolic Monorepo

FilmyFrolic is a modern, high-performance entertainment platform built as a production-ready monorepo using **PNPM Workspaces**, **Turborepo**, **React 18 + Vite**, **Express 5 + Supabase**, and **Zod validation**.

---

## 🏗️ Monorepo Workspace Layout

```
filmyfrolic/
├── apps/
│   ├── web/                    # React 18 + Vite Frontend Application (Port 5173)
│   ├── api/                    # Express 5 + Supabase Backend API Server (Port 5000)
│   └── worker/                 # Background Worker (Ingestion/AI/Sync/Jobs)
├── packages/
│   ├── shared/                 # Business logic constants & TMDB image helpers
│   ├── config/                 # Shared ESLint 9 & TypeScript configurations
│   ├── types/                  # Shared TypeScript models & DTOs
│   └── validation/             # Shared Zod validation schemas
├── docs/                       # Monorepo architecture & tech stack documentation
└── pnpm-workspace.yaml         # PNPM workspace definition
```

---

## 📋 Prerequisites & Tools

Before getting started, ensure your environment meets the following requirements:

- **Node.js**: `>=20.0.0` (LTS recommended)
- **PNPM**: `^9.15.0` (`npm install -g pnpm@9.15.0`)
- **Git**: `>=2.30.0`

---

## 🚀 Quick Start Guide

Developer setup in 4 simple commands:

```bash
# 1. Clone the repository
git clone https://github.com/your-org/filmyfrolic.git
cd filmyfrolic

# 2. Install workspace dependencies
pnpm install

# 3. Copy environment templates
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
cp apps/worker/.env.example apps/worker/.env

# 4. Launch all applications concurrently
pnpm dev
```

After running `pnpm dev`:

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Express API**: [http://localhost:5000](http://localhost:5000)
- **Worker**: Running background job scheduler & task processor.

---

## 🔐 Environment Configuration

Each application requires its own `.env` file copied from `.env.example`:

### 1. `apps/web/.env` (Public Browser Scope)

```ini
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_AGORA_APP_ID=your_agora_app_id
```

### 2. `apps/api/.env` (Server-Only Secret Scope)

```ini
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
TMDB_API_KEY=your_tmdb_api_key
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate
RESEND_API_KEY=your_resend_api_key
```

### 3. `apps/worker/.env` (Server-Only Secret Scope)

```ini
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
TMDB_API_KEY=your_tmdb_api_key
RESEND_API_KEY=your_resend_api_key
```

> ⚠️ **Security Warning**: Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, `AGORA_APP_CERTIFICATE`, `RESEND_API_KEY`) **must never use `VITE_` prefixes** and must never be committed to source control.

---

## 🛠️ Developer Tooling & Scripts

All scripts are executed from the monorepo root:

| Command             | Action                                                        |
| :------------------ | :------------------------------------------------------------ |
| `pnpm dev`          | Launch all apps concurrently in development mode              |
| `pnpm build`        | Build all workspace applications & packages via Turborepo     |
| `pnpm lint`         | Run ESLint 9 flat config checks across all packages           |
| `pnpm typecheck`    | Run TypeScript type checks (`tsc --noEmit`)                   |
| `pnpm format`       | Automatically format codebase with Prettier                   |
| `pnpm format:check` | Check code formatting compliance                              |
| `pnpm test`         | Run test suite across workspace packages                      |
| `pnpm clean`        | Clean all build outputs (`dist/`, `.turbo/`, `node_modules/`) |

---

## 🗄️ Database Setup & Migrations

FilmyFrolic uses **Supabase PostgreSQL** as its primary database.

1. Create a project at [supabase.com](https://supabase.com).
2. Execute the canonical database schema migration in the Supabase SQL Editor:
   - SQL Migration File: [`apps/api/src/migrations/001_canonical_media_schema.sql`](file:///c:/Users/saikr/projects/filmyfrolic/apps/api/src/migrations/001_canonical_media_schema.sql)
3. Copy your project URL, anon key, and service role key into `apps/api/.env` and `apps/web/.env`.

---

## 🚀 Deployment Guidelines

- **Frontend (`apps/web`)**: Deploy on **Vercel** or **Netlify** (Build command: `pnpm --filter @filmyfrolic/web build`, Output directory: `dist`).
- **Backend API (`apps/api`)**: Deploy on **Render**, **Railway**, or **DigitalOcean** (Start command: `pnpm --filter @filmyfrolic/api start`).
- **Worker (`apps/worker`)**: Deploy as a background service process (Start command: `pnpm --filter @filmyfrolic/worker start`).

---

## ❓ Troubleshooting & FAQ

### Port 5000 or 5173 Already in Use

Kill any rogue processes or change `PORT` in `apps/api/.env` and `VITE_API_URL` in `apps/web/.env`.

### Clearing Build Caches & Reinstalling Dependencies

If encountering resolution issues or cached state errors:

```bash
pnpm clean
rm -rf node_modules
pnpm install
```

---

## 📚 Technical Documentation

- [`docs/TECH_STACK.md`](file:///c:/Users/saikr/projects/filmyfrolic/docs/TECH_STACK.md) — Tech stack & package versions baseline.
- [`docs/ARCHITECTURE.md`](file:///c:/Users/saikr/projects/filmyfrolic/docs/ARCHITECTURE.md) — Architectural decision records & system blueprints.
- [`docs/MIGRATION_NOTES.md`](file:///c:/Users/saikr/projects/filmyfrolic/docs/MIGRATION_NOTES.md) — Audit and migration history.
