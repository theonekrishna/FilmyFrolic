# End-to-End User Journeys — FilmyFrolic

## Core User Journey Verification

### 1. Guest Journey: Unauthenticated Public Exploration & Action Auth Gating

```mermaid
sequenceDiagram
    autonumber
    actor Guest as Guest User
    participant UI as Frontend App
    participant Gate as useAuthGate Hook
    participant API as Render Backend API
    participant TMDB as TMDB / Supabase

    Guest->>UI: Navigates to Home / Archive / Gossips
    UI->>API: GET /api/home/movies or GET /api/gossips
    API->>TMDB: Query Data
    TMDB-->>API: Data Payload
    API-->>UI: 200 OK Response
    UI-->>Guest: Render Full Page & Content Cards (Read Access)

    Guest->>UI: Clicks "Drop Gossip" or "Like Post" or "Join Room"
    UI->>Gate: Trigger requireAuth(actionHandler)
    Gate-->>UI: User Unauthenticated -> Open AuthPromptModal
    UI-->>Guest: Displays Login/Signup Modal with Action Context Saved
```

### 2. Gossip Creation Journey: Fan-Created Rumor Protection & Stance Staking

```mermaid
sequenceDiagram
    autonumber
    actor AuthUser as Authenticated User
    participant Form as Gossip Modal UI
    participant Mod as PII Pre-Screen Filter
    participant API as Backend API
    participant DB as Supabase DB

    AuthUser->>Form: Enters Rumor Title & Content
    AuthUser->>Form: Checks "I confirm this is unverified fan speculation"
    AuthUser->>Form: Submits Rumor
    Form->>Mod: Pre-screen for PII / Real Names / Harmful Defamation
    alt Contains Defamatory PII
        Mod-->>Form: Reject submission & show policy warning
    else Safe Speculation
        Mod->>API: POST /api/gossips
        API->>DB: Insert into gossips table with status='UNVERIFIED'
        DB-->>API: Insert Success (ID: g_102)
        API-->>Form: 201 Created
        Form-->>AuthUser: Render Gossip Card with "🚨 UNVERIFIED" Label & Stance Voting Bar
    end
```

### 3. Movie Discovery to Gossip & Community Integration Journey

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Search as Global Search Bar
    participant MoviePage as Archive Movie Detail Page
    participant Gossip as Related Gossip Section
    participant Author as Gossip Author Profile

    User->>Search: Types "Project K" or "Kalki"
    Search-->>User: Displays auto-complete results
    User->>MoviePage: Selects "Kalki 2898 AD"
    MoviePage-->>User: Renders Poster, Backdrop, Cast, Rating, Trailer, OTT links
    MoviePage->>Gossip: Fetches related fan theories & rumors for movie
    User->>Gossip: Clicks "Sequel Cast Speculation" Gossip
    Gossip->>Author: Clicks Author Username @CinematicMind
    Author-->>User: Navigates to @CinematicMind Public Profile (Posts, Activity, Follow button)
```
