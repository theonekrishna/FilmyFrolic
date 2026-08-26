# Prioritized Feature Gap Catalog — FilmyFrolic

## Prioritized Work & Improvement Inventory

### P0 — Critical Launch Blockers (0 Remaining)
All P0 launch blockers (Production 500 errors, TMDB credential handling, CORS wildcard matching, Public Read access, Auth Gating) have been fixed and verified.

---

### P1 — Essential Product Enhancements (High Priority)
1. **Direct Messaging Realtime Auto-Reconnect**:
   - *Module*: Messages (`/social/messages`)
   - *Scope*: Add exponential backoff reconnect handler to Supabase WebSocket channel in `messages.model.js`.
2. **Video Upload Size & Duration Pre-Validation**:
   - *Module*: Feed (`/social/feed`) & Memes (`/entertain/memes`)
   - *Scope*: Enforce 50MB max file size limit client-side before S3/Supabase storage upload.
3. **Community Moderator Announcements Banner**:
   - *Module*: Communities (`/social/communities`)
   - *Scope*: Allow community creator/moderator to pin important notice posts to top of community feed.

---

### P2 — Useful UX & Engagement Features (Medium Priority)
1. **Rich Text Editor for Articles**:
   - *Module*: Articles (`/content/articles`)
   - *Scope*: Integrate Quill / Tiptap WYSIWYG editor for editorial contributors.
2. **Watch Party Desktop Screen Sharing**:
   - *Module*: Rooms (`/social/rooms`)
   - *Scope*: Add Agora screen-sharing track option in `UserActionBar.jsx` for desktop browsers.
3. **Automated Meme NSFW Image Scanning**:
   - *Module*: Memes (`/entertain/memes`)
   - *Scope*: Integrate client canvas edge-detection/Cloudinary moderation pre-filter.

---

### P3 — Future Strategic Enhancements (Low Priority)
1. **AI Fan Theory Generator**:
   - *Module*: Gossips (`/content/gossip`)
   - *Scope*: Provide AI prompt assistant to format fan rumors cleanly into structured bullet points.
2. **Cross-Platform Achievement Badges**:
   - *Module*: Games & Profile (`/entertain/games`, `/user/profile`)
   - *Scope*: Award badges (e.g. "Trivia Master", "Top Rumor Detective", "Watch Party Host") on profile.
