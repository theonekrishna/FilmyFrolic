# Module Audit Report — FilmyFrolic

## Executive Summary
This document presents the product-level and code-level audit across all 11 user-facing modules and system subsystems in FilmyFrolic. Each module is evaluated against Guest vs Authenticated capabilities, CUD (Create, Update, Delete) operations, state management, search/filter capabilities, edge cases, and cross-module connectivity.

---

## 1. Core Module Analysis

### 1.1 Home Module (`/`)
- **Status**: `PARTIALLY_IMPLEMENTED` (Completion: 85%)
- **Description**: Central portal showcasing trending movies, top rumors, latest articles, community buzz, and entertainment highlights.
- **Capabilities**:
  - **Guest User**: Can view trending carousels, movie rankings, gossip highlights, article highlights, and memes.
  - **Authenticated User**: Same read access; can bookmark, like, or jump straight to community creation.
  - **Search & Filtering**: Search bar filters trending content dynamically.
- **Backend Service**: `GET /api/home/movies` powered by `tmdb.service.js` with `FALLBACK_MOVIES` resilience.
- **Gaps / Blockers**:
  - P2: Needs personalized "Continue Watching / Recents" section for authenticated users.

### 1.2 Feed Module (`/social/feed`)
- **Status**: `IMPLEMENTED` (Completion: 92%)
- **Description**: Main social media feed containing user posts, images, discussions, likes, comments, and bookmarks.
- **Capabilities**:
  - **Guest User**: Public read access to all post cards, media, and comments. Interactive actions trigger `AuthPromptModal`.
  - **Authenticated User**: Create post with images/media, react (Fire, Shocked), add comments, reply, bookmark, delete own post.
- **Backend Service**: `apps/api/src/modules/feeds/` (`feed.routes.js`, `feed.controller.js`, `feed.service.js`).
- **Gaps / Blockers**:
  - P1: Video upload preview needs file size validation.

### 1.3 Messages Module (`/social/messages`)
- **Status**: `PARTIALLY_IMPLEMENTED` (Completion: 70%)
- **Description**: Direct messaging system for 1-on-1 user conversations.
- **Capabilities**:
  - **Guest User**: Private page gated by `<ProtectedRoute />` (requires login).
  - **Authenticated User**: View conversation list, send text messages, search users.
- **Backend Service**: `apps/api/src/modules/messages/` (`messages.routes.js`, `messages.model.js`).
- **Gaps / Blockers**:
  - P1: Real-time Supabase websocket subscription needs auto-reconnect on network loss.
  - P2: Media attachments in direct messages.

### 1.4 Rooms Module (`/social/rooms`)
- **Status**: `IMPLEMENTED` (Completion: 88%)
- **Description**: Live audio/video watch party & discussion rooms powered by Agora SDK & Supabase.
- **Capabilities**:
  - **Guest User**: Can view active rooms list, member counts, and room details. Hosting/joining gates with `AuthPromptModal`.
  - **Authenticated User**: Host room (watch party, discussion), toggle mic/camera via Agora RTC, leave room, mute members (Host).
- **Backend Service**: `apps/api/src/modules/rooms/` (`room.routes.js`, `room.controller.js`, `room.service.js`).
- **Gaps / Blockers**:
  - P2: Screen sharing capability in desktop watch parties.

### 1.5 Communities Module (`/social/communities`)
- **Status**: `IMPLEMENTED` (Completion: 90%)
- **Description**: Topic-focused interest groups (e.g. Marvel Fans, Tollywood Club, Anime Crossover).
- **Capabilities**:
  - **Guest User**: Browse communities, view community detail pages, read community posts.
  - **Authenticated User**: Join/Leave community, create community post, create new community modal.
- **Backend Service**: `apps/api/src/modules/communities/` (`communities.routes.js`, `communities.model.js`).
- **Gaps / Blockers**:
  - P2: Community rules & pinned moderator announcements.

### 1.6 Archive Module (`/content/archive`)
- **Status**: `IMPLEMENTED` (Completion: 95%)
- **Description**: TMDB-backed comprehensive database of movies, series, cast, crew, trailers, and streaming provider availability.
- **Capabilities**:
  - **Guest User**: Search titles, filter by genre/year/type (movies vs series), view detailed backdrop, poster, rating, runtime, director, cast list, and OTT streaming links.
- **Backend Service**: `GET /api/archive` & `GET /api/archive/movies/:id` backed by `tmdb.service.js`.
- **Gaps / Blockers**:
  - None (P0/P1 resolved).

### 1.7 Articles Module (`/content/articles`)
- **Status**: `IMPLEMENTED` (Completion: 90%)
- **Description**: Editorial long-form articles, film reviews, box office breakdowns, and industry insights.
- **Capabilities**:
  - **Guest User**: Read featured article, filter by category (Editorial, Review, Analysis), search articles.
  - **Authenticated User**: Gate "Write Article" button with `AuthPromptModal`, publish review.
- **Backend Service**: `apps/api/src/modules/search/` and static editorial datasets.
- **Gaps / Blockers**:
  - P2: Rich-text WYSIWYG editor for community editorial submissions.

### 1.8 Gossips Module (`/content/gossip`)
- **Status**: `IMPLEMENTED` (Completion: 95%)
- **Description**: Fan-created rumors, speculation, fan theories, and discussions platform.
- **Capabilities**:
  - **Guest User**: Read rumors with prominent unverified labels (`🚨 UNVERIFIED — FAN RUMOR`, `🔮 SPECULATION`), view community plausibility stance bar.
  - **Authenticated User**: Drop Gossip with mandatory unverified declaration checkbox, source URL, automated PII pre-screening, stance voting (Believe/Doubt/Need Source).
- **Backend Service**: `apps/api/src/modules/gossips/` (`gossip.route.js`, `gossip.controller.js`, `gossip.moderation.js`).
- **Gaps / Blockers**:
  - None. Includes `IndiaLegalChecklist.md` legal review compliance checklist.

### 1.9 Games Module (`/entertain/games`)
- **Status**: `IMPLEMENTED` (Completion: 85%)
- **Description**: Movie trivia, actor guessing games, poster quizzes, and daily challenges.
- **Capabilities**:
  - **Guest User**: View game list, daily challenge banner, leaderboard stats.
  - **Authenticated User**: Play trivia, submit high scores, track daily streak.
- **Backend Service**: `apps/api/src/modules/games/` (`game.route.js`, `game.service.js`).
- **Gaps / Blockers**:
  - P2: Anti-cheat score submission timestamp validation.

### 1.10 Memes Module (`/entertain/memes`)
- **Status**: `IMPLEMENTED` (Completion: 90%)
- **Description**: User-generated film memes, funny clips, reaction GIFs, and meme of the week rankings.
- **Capabilities**:
  - **Guest User**: Read meme feed (Hot, New, Top), view Meme of the Week.
  - **Authenticated User**: Submit Meme modal, upvote, comment, share, bookmark.
- **Backend Service**: `apps/api/src/modules/memes/` (`memes.routes.js`, `memes.controller.js`, `memes.model.js`).
- **Gaps / Blockers**:
  - P2: Automated NSFW image detection on meme uploads.

### 1.11 Settings & Profile Subsystems (`/settings`, `/user/profile`)
- **Status**: `IMPLEMENTED` (Completion: 92%)
- **Description**: User profile, avatar management, account security, privacy settings, blocked users, and session management.
- **Capabilities**:
  - **Guest User**: View public user profile (avatar, bio, created posts).
  - **Authenticated User**: Edit profile, update password, manage sessions, export data, block/unblock users.
- **Backend Service**: `apps/api/src/modules/editProfile/`, `apps/api/src/modules/settings/`.
