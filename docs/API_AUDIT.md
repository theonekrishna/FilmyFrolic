# API Inventory & Endpoint Audit — FilmyFrolic

## REST & WebSockets Endpoint Inventory

| HTTP Method | Endpoint | Module | Auth Requirement | Purpose | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/home/movies` | Home | Public | Fetch trending home movie carousels | `WORKING (200)` |
| `GET` | `/api/archive` | Archive | Public | Search/filter TMDB movie database | `WORKING (200)` |
| `GET` | `/api/archive/movies/:id` | Archive | Public | Get single movie details with cast/crew/OTT | `WORKING (200)` |
| `GET` | `/api/tmdb/trending` | TMDB | Public | Get raw TMDB trending feed | `WORKING (200)` |
| `GET` | `/api/tmdb/search` | TMDB | Public | Search TMDB titles by query | `WORKING (200)` |
| `GET` | `/api/feeds` | Feed | Public | Get main social posts feed | `WORKING (200)` |
| `POST` | `/api/feeds` | Feed | Authenticated | Create a new social post with image | `WORKING (201)` |
| `DELETE`| `/api/feeds/:id` | Feed | Owner / Admin | Delete user's social post | `WORKING (200)` |
| `POST` | `/api/feeds/:id/like` | Feed | Authenticated | Like/React to a post | `WORKING (200)` |
| `GET` | `/api/gossips` | Gossips | Public | Fetch fan rumors feed with stance counts | `WORKING (200)` |
| `POST` | `/api/gossips` | Gossips | Authenticated | Drop new gossip with unverified flag | `WORKING (201)` |
| `POST` | `/api/gossips/:id/vote` | Gossips | Authenticated | Vote stance on rumor (Believe/Doubt) | `WORKING (200)` |
| `GET` | `/api/messages/conversations`| Messages | Authenticated | List user's direct messaging threads | `WORKING (200)` |
| `GET` | `/api/messages/:id` | Messages | Authenticated | Fetch chat messages in a thread | `WORKING (200)` |
| `POST` | `/api/messages` | Messages | Authenticated | Send direct message to user | `WORKING (201)` |
| `GET` | `/api/rooms` | Rooms | Public | List active watch party & discussion rooms | `WORKING (200)` |
| `POST` | `/api/rooms` | Rooms | Authenticated | Create a new Agora audio/video room | `WORKING (201)` |
| `POST` | `/api/rooms/:id/join` | Rooms | Authenticated | Join room and retrieve RTC token | `WORKING (200)` |
| `GET` | `/api/communities` | Communities | Public | Browse all movie communities | `WORKING (200)` |
| `POST` | `/api/communities` | Communities | Authenticated | Create a new community | `WORKING (201)` |
| `POST` | `/api/communities/:id/join` | Communities | Authenticated | Join/Leave a community | `WORKING (200)` |
| `GET` | `/api/memes` | Memes | Public | Get meme feed (Hot/New/Top) | `WORKING (200)` |
| `POST` | `/api/memes` | Memes | Authenticated | Upload meme image and caption | `WORKING (201)` |
| `GET` | `/api/games` | Games | Public | Get list of trivia games and leaderboards | `WORKING (200)` |
| `POST` | `/api/games/submit` | Games | Authenticated | Submit game score | `WORKING (200)` |
| `GET` | `/api/profile/:id` | Profile | Public | Get public user profile info & posts | `WORKING (200)` |
| `PUT` | `/api/profile` | Profile | Authenticated | Update user bio, avatar, display name | `WORKING (200)` |
| `GET` | `/api/notifications` | Notifications | Authenticated | Get unread notification list | `WORKING (200)` |
| `POST` | `/api/notifications/read` | Notifications | Authenticated | Mark notifications as read | `WORKING (200)` |
| `POST` | `/api/reports` | Global | Authenticated | Report post/comment/user for moderation | `WORKING (201)` |
| `GET` | `/api/health/tmdb` | Health Probe | Public | Diagnostic check for TMDB reachability | `WORKING (200)` |
| `GET` | `/api/health/supabase` | Health Probe | Public | Diagnostic check for Supabase DB status | `WORKING (200)` |
