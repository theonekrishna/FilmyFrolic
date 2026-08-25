# 📝 FilmyFrolic — Monorepo Migration Notes & Audit Log

## Migration Summary

- **Date**: August 2026
- **Role**: Senior Staff Software Architect
- **Objective**: Standardize monorepo architecture, normalize dependency versions, establish root scripts, eliminate dead code & lockfiles, and set up shared workspace packages (`@filmyfrolic/config`, `@filmyfrolic/types`, `@filmyfrolic/shared`, `@filmyfrolic/validation`, `apps/worker`).

---

## 🔍 Codebase Audit Log

### 1. Unused Dependencies Removed

- **`jsonwebtoken`**: Removed from `apps/api/package.json`. Superseded by Supabase Auth token issuance and verification.
- **`express-validator`**: Removed from `apps/api/package.json`. Superseded by `@filmyfrolic/validation` Zod schemas.

### 2. Dead Code & Duplicate Configs Removed

- **`apps/api/src/utils/token.js`**: Deleted dead/empty file.
- **`package-lock.json`**: Removed isolated subproject npm lockfiles (`apps/web/package-lock.json`, `apps/api/package-lock.json`) in favor of root `pnpm-lock.yaml`.
- **ESLint Configs**: Standardized on ESLint 9 Flat Configs (`eslint.config.js` for React, `eslint.config.mjs` for Node).

### 3. Obsolete Environment Variables Cleaned

- **`VITE_OMDB_*`**: Removed dead OMDB API variables from frontend environment templates.
- **Prefix Standard**: Ensured all server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, `AGORA_APP_CERTIFICATE`, `RESEND_API_KEY`) do NOT use `VITE_` prefixes.

### 4. Code & Type Consolidation (Shared Packages)

- **`@filmyfrolic/config`**: Modular shared ESLint 9 flat configs (`base.js`, `react.js`, `node.js`) and TSConfigs (`base.json`, `browser.json`, `node.json`, `library.json`).
- **`@filmyfrolic/types`**: Shared TypeScript models (`User`, `Movie`, `Community`, DTOs).
- **`@filmyfrolic/shared`**: Shared TMDB image helpers & constants.
- **`@filmyfrolic/validation`**: Shared Zod schemas (`signupSchema`, `loginSchema`, `createGossipSchema`, `createPostSchema`, `createCommunitySchema`).

---

## 📌 Items Logged for Future Monitoring

The following items are functional and preserved, but logged for future maintenance:

1. **`agora-access-token` Deprecation Warning**:
   - `agora-access-token@2.0.4` triggers an npm deprecation warning. It currently works cleanly for RTC token generation in [`apps/api/src/modules/rooms/agora.service.js`](file:///c:/Users/saikr/projects/filmyfrolic/apps/api/src/modules/rooms/agora.service.js). Plan to migrate to `agora-token` package when updating Agora SDK.
2. **`filmydock` External API Legacy Proxying**:
   - `apps/api/src/modules/home/home.filmydock.service.js` and `archive.filmydock.service.js` call external Render services. Controllers now have TMDB fallbacks and should eventually consume [`apps/api/src/modules/tmdb/tmdb.service.js`](file:///c:/Users/saikr/projects/filmyfrolic/apps/api/src/modules/tmdb/tmdb.service.js) directly to eliminate cold starts.
