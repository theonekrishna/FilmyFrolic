# 🛠️ FilmyFrolic — Official Technology Baseline & Version Strategy

## Overview

This document defines the standardized technology baseline for the FilmyFrolic monorepo.

---

## 🚀 1. Monorepo Infrastructure

- **Runtime Engine**: **Node.js 20 LTS** (`>=20.0.0`)
- **Package Manager**: **PNPM 9** (`pnpm@9.15.0`) with `pnpm-workspace.yaml`
- **Build Orchestrator**: **Turborepo 2** (`^2.3.0`)
- **Code Formatter**: **Prettier 3** (`^3.5.1`)

---

## 🌐 2. Frontend Application (`apps/web`)

- **UI Framework**: **React 18** (`^18.3.1`) & **React DOM** (`^18.3.1`)
- **Build Tool**: **Vite 6** (`^6.1.0`) with `@vitejs/plugin-react` (`^4.3.4`)
- **Routing**: **React Router DOM 7** (`^7.13.1`)
- **Styling**: **Tailwind CSS 3** (`^3.4.19`) + PostCSS + Autoprefixer
- **Iconography**: **Lucide React** (`^0.577.0`)
- **Database / Auth Client**: **@supabase/supabase-js** (`^2.48.0`)
- **Live Video / Streaming**: **Agora RTC SDK** (`agora-rtc-sdk-ng ^4.24.3`)
- **HTTP Client**: **Axios** (`^1.7.9`)

---

## ⚙️ 3. Backend API Application (`apps/api`)

- **Server Framework**: **Express 5** (`^5.0.1`)
- **Database Service**: **Supabase / PostgreSQL** (`@supabase/supabase-js ^2.48.0`)
- **Security & Limiting**: **express-rate-limit** (`^7.5.0`) & **cors** (`^2.8.5`)
- **Validation**: **express-validator** (`^7.2.1`)
- **JWT Handling**: **jsonwebtoken** (`^9.0.2`)
- **Agora Token Server**: **agora-access-token** (`^2.0.4`)
- **Email Service**: **Resend** (`^4.1.0`)

---

## 📦 4. Shared Workspace Packages

- **`@filmyfrolic/shared`**: Shared constants, TMDB image helper functions, genre definitions.
- **`@filmyfrolic/config`**: Centralized ESLint base config & TSConfig bases.
- **`@filmyfrolic/types`**: Shared TypeScript definitions and data interfaces.
