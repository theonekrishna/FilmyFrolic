# Database Dependency Map — FilmyFrolic

## Subsystem & Data Source Mapping

| Subsystem / Module | Primary Data Source       | Secondary / Fallback Source   | Tables / Endpoints Used                               | Cache Mechanism          |
| :----------------- | :------------------------ | :---------------------------- | :---------------------------------------------------- | :----------------------- |
| **Home**           | TMDB API v3 / v4          | `FALLBACK_MOVIES` (In-Memory) | `/trending/all/day`                                   | In-memory `Map` (1h TTL) |
| **Archive**        | TMDB API v3 / v4          | Filmydock API                 | `/movie/{id}`, `/search/movie`                        | In-memory `Map` (1h TTL) |
| **Feed**           | Supabase PostgreSQL       | Local State                   | `posts`, `post_likes`, `comments`                     | React Component State    |
| **Gossips**        | Supabase PostgreSQL       | In-Memory Fallbacks           | `gossips`, `gossip_votes`, `gossip_comments`          | React Query Cache        |
| **Messages**       | Supabase Realtime         | Local Storage                 | `messages`, `conversations`                           | WebSocket Stream         |
| **Rooms**          | Supabase Realtime & Agora | -                             | `rooms`, `room_members`                               | RTC Stream Token         |
| **Communities**    | Supabase PostgreSQL       | In-Memory Defaults            | `communities`, `community_members`, `community_posts` | React Component State    |
| **Memes**          | Supabase Storage & DB     | Local Storage                 | `memes`, `meme_likes`, `meme_comments`                | CDN Image Links          |
| **Games**          | Supabase DB / Internal    | In-Memory Trivia Quiz         | `game_scores`, `leaderboards`                         | Local Storage Best       |
| **User Profile**   | Supabase Auth & DB        | Local Storage Session         | `profiles`, `followers`, `blocks`                     | Context API              |
| **Notifications**  | Supabase PostgreSQL       | -                             | `notifications`                                       | Context Polling          |
| **Reports**        | Supabase PostgreSQL       | -                             | `reports`, `moderation_queue`                         | Database State           |
