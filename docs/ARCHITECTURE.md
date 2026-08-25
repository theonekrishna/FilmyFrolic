# 🏛️ FilmyFrolic — Architectural Blueprint

## Overview

FilmyFrolic is organized as a **Modular Monolith + Background Worker** monorepo structure using PNPM Workspaces and Turborepo.

---

## 📐 Monorepo Layout

```
filmyfrolic/
├── apps/
│   ├── web/                    # React 18 + Vite Frontend Client
│   ├── api/                    # Express 5 REST API Server
│   └── worker/                 # Background Processing Worker (Ingestion/Crawling/AI)
├── packages/
│   ├── shared/                 # Business logic constants & TMDB utilities
│   ├── config/                 # Centralized ESLint & TSConfig bases
│   └── types/                  # Shared TypeScript interfaces & DTO models
├── docs/                       # Technical architecture & version documentation
└── turbo.json                  # Turborepo task pipeline configuration
```

---

## 🔐 1. Unified Authentication Architecture Strategy

- **Single Source of Truth**: **Supabase Auth** serves as the single authority for user identity and token issuance across the entire application.
- **Unified Client Flow**:
  - Email/Password sign up & login requests invoke `supabase.auth.signUp()` and `supabase.auth.signInWithPassword()`.
  - Google OAuth sign-in routes through Supabase Auth OAuth provider (`supabase.auth.signInWithOAuth({ provider: 'google' })`).
  - Session refresh delegates to `supabase.auth.refreshSession()`.
- **Server-Side Token Validation**:
  - All protected Express routes ([`apps/api/src/middlewares/auth.js`](file:///c:/Users/saikr/projects/filmyfrolic/apps/api/src/middlewares/auth.js)) extract the Bearer token (`Authorization: Bearer <access_token>`) and validate it via `supabase.auth.getUser(token)`.
  - Attaches authenticated Supabase `user` object to `req.user`.
- **Cleanup Completed**:
  - Deprecated obsolete standalone `jsonwebtoken` package and deleted dead utility `apps/api/src/utils/token.js`.

---

## 🗄️ 3. Canonical Database & TMDB Independence Blueprint

FilmyFrolic is designed to become **fully independent from third-party media providers** (such as TMDB).

### Decoupling Strategy:

- **Canonical Models**: FilmyFrolic owns its native media entities:
  - `movies`, `tv_shows`, `people`, `genres`, `production_companies`, `countries`, `languages`, `ratings`, `reviews`, `watchlists`, `credits`, `media`.
- **External Identifier Mapping**:
  - Provider IDs (TMDB, IMDb, TVDB, Letterboxd, Wikidata) are stored in decoupled mapping tables:
    - `movie_external_ids` (`movie_id`, `provider`, `external_id`)
    - `tv_show_external_ids` (`tv_show_id`, `provider`, `external_id`)
    - `person_external_ids` (`person_id`, `provider`, `external_id`)
- **Fallback & Proxy Architecture**:
  - The API service ([`apps/api/src/modules/tmdb/tmdb.service.js`](file:///c:/Users/saikr/projects/filmyfrolic/apps/api/src/modules/tmdb/tmdb.service.js)) acts as an external ingestion proxy. Ingested movies/shows populate canonical entities and register external ID mappings seamlessly.
- **Migration Blueprint**:
  - SQL Schema migration: [`apps/api/src/migrations/001_canonical_media_schema.sql`](file:///c:/Users/saikr/projects/filmyfrolic/apps/api/src/migrations/001_canonical_media_schema.sql).)

---

## ⚙️ 4. Background Worker Architecture Strategy (`apps/worker`)

The worker service ([`apps/worker`](file:///c:/Users/saikr/projects/filmyfrolic/apps/worker)) handles background processing, periodic jobs, and heavy async tasks without blocking API response times:

```
apps/worker/src/
├── jobs/
│   └── scheduler.js           # Periodic interval & database-backed scheduler
├── tasks/
│   ├── ingestion.task.js       # Provider metadata ingestion (TMDB / IMDb)
│   ├── normalization.task.js   # DTO normalization into canonical entities
│   ├── deduplication.task.js   # Duplicate entry detection
│   ├── imageProcessing.task.js # Poster & backdrop optimization
│   ├── aiEnrichment.task.js    # AI summary generation & sentiment analysis
│   ├── recommendation.task.js # Personalized user recommendation vectors
│   └── notifications.task.js  # Async push & email notification dispatching
└── index.js                    # Worker entry point
```

### Redis / Queue Policy:

- **No Premature Complexity**: Worker uses PostgreSQL/Supabase-backed queue tables (`worker_jobs`) or Node.js background intervals (`scheduler.js`) instead of requiring a separate Redis cluster.
- **Scaling Threshold**: Redis/BullMQ will only be introduced if background job throughput exceeds 10,000 tasks/min.
- Notification batch dispatches.
- Recommendation generation algorithms.
