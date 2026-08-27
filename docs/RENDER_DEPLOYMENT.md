# Deployment Guide: Deploying FilmyFrolic Monorepo on Render

This guide explains step-by-step how to deploy all three applications of the **FilmyFrolic Monorepo** on [Render](https://render.com/).

---

## Architecture Overview

| Application | Render Service Type | Build Command | Publish / Start Command | Environment Variables Needed |
| :--- | :--- | :--- | :--- | :--- |
| **`apps/api`** | **Web Service** (Node.js) | `pnpm install` | `pnpm --filter @filmyfrolic/api start` | `PORT`, `NODE_ENV`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TMDB_API_KEY`, `ALLOWED_ORIGINS` |
| **`apps/admin`** | **Static Site** (Vite + React) | `pnpm install && pnpm --filter @filmyfrolic/admin build` | `apps/admin/dist` | `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| **`apps/web`** | **Static Site** (Vite + React) | `pnpm install && pnpm --filter @filmyfrolic/web build` | `apps/web/dist` | `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

---

## Step 1: Deploy the Backend API (`apps/api`)

1. Go to your [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your Git repository (`FilmyFrolic`).
3. Configure the Web Service settings:
   - **Name**: `filmyfrolic-backend` (or `filmyfrolic-api`)
   - **Environment**: `Node`
   - **Region**: Select your preferred region (e.g., Oregon / Singapore)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (uses repository root)
   - **Build Command**: `pnpm install`
   - **Start Command**: `pnpm --filter @filmyfrolic/api start`
4. Add **Environment Variables**:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (or leave default assigned by Render)
   - `SUPABASE_URL` = `your-supabase-project-url`
   - `SUPABASE_SERVICE_ROLE_KEY` = `your-supabase-service-role-key`
   - `TMDB_API_KEY` = `your-tmdb-api-key`
   - `ALLOWED_ORIGINS` = `https://filmyfrolic-admin.onrender.com,https://filmyfrolic-web.onrender.com`
5. Click **Create Web Service**. Save your deployed Backend URL (e.g., `https://filmyfrolic-api.onrender.com`).

---

## Step 2: Deploy the Admin Console (`apps/admin`)

1. In Render Dashboard, click **New +** -> **Static Site**.
2. Connect your Git repository (`FilmyFrolic`).
3. Configure the Static Site settings:
   - **Name**: `filmyfrolic-admin`
   - **Branch**: `main`
   - **Root Directory**: Leave blank
   - **Build Command**: `pnpm install && pnpm --filter @filmyfrolic/admin build`
   - **Publish Directory**: `apps/admin/dist`
4. Add **Environment Variables**:
   - `VITE_API_URL` = `https://filmyfrolic-api.onrender.com/api`
   - `VITE_SUPABASE_URL` = `your-supabase-project-url`
   - `VITE_SUPABASE_ANON_KEY` = `your-supabase-anon-key`
5. Click **Advanced** -> Add **Rewrite Rule**:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite` (This ensures React Router client-side routing works for `/login`, `/`, `/writer`).
6. Click **Create Static Site**.

---

## Step 3: Deploy the Customer Web App (`apps/web`)

1. Click **New +** -> **Static Site**.
2. Connect your Git repository (`FilmyFrolic`).
3. Configure settings:
   - **Name**: `filmyfrolic-web`
   - **Branch**: `main`
   - **Build Command**: `pnpm install && pnpm --filter @filmyfrolic/web build`
   - **Publish Directory**: `apps/web/dist`
4. Add **Environment Variables**:
   - `VITE_API_URL` = `https://filmyfrolic-api.onrender.com/api`
   - `VITE_SUPABASE_URL` = `your-supabase-project-url`
   - `VITE_SUPABASE_ANON_KEY` = `your-supabase-anon-key`
5. Add SPA Rewrite Rule (`/*` -> `/index.html`).
6. Click **Create Static Site**.

---

## Step 4: Configure CORS on Backend API

Make sure the backend API `ALLOWED_ORIGINS` variable includes both frontend domains:
```env
ALLOWED_ORIGINS=https://filmyfrolic-admin.onrender.com,https://filmyfrolic-web.onrender.com
```

---

## Step 5: Render Blueprint (`render.yaml`)

You can also deploy all 3 services automatically at once using Render Blueprints. The project includes a root [`render.yaml`](file:///c:/Users/saikr/projects/filmyfrolic/render.yaml) blueprint!
