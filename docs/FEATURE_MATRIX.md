# Feature Permission Matrix — FilmyFrolic

## Permission & Capability Matrix

| Module          | Feature                     | Guest Access  | Authenticated User |    Content Owner     | Admin / Moderator |    Status     | Priority |
| :-------------- | :-------------------------- | :-----------: | :----------------: | :------------------: | :---------------: | :-----------: | :------: |
| **Home**        | View Trending Movies        |    ✅ Read    |      ✅ Read       |       ✅ Read        |      ✅ Read      | `IMPLEMENTED` |    P0    |
| **Home**        | View Gossip Highlights      |    ✅ Read    |      ✅ Read       |       ✅ Read        |      ✅ Read      | `IMPLEMENTED` |    P0    |
| **Feed**        | Read Feed Posts             |    ✅ Read    |      ✅ Read       |       ✅ Read        |      ✅ Read      | `IMPLEMENTED` |    P0    |
| **Feed**        | Create Post                 | 🔒 Auth Modal |     ✅ Create      |      ✅ Create       |     ✅ Create     | `IMPLEMENTED` |    P0    |
| **Feed**        | Edit / Delete Post          |   ❌ Denied   |     ❌ Denied      | ✅ Owner Edit/Delete |   🛡️ Mod Delete   | `IMPLEMENTED` |    P0    |
| **Feed**        | Like / Comment / Reply      | 🔒 Auth Modal |     ✅ Action      |      ✅ Action       |     ✅ Action     | `IMPLEMENTED` |    P0    |
| **Messages**    | View Conversations          |  🔒 Redirect  |      ✅ Read       |       ✅ Read        |  🛡️ Admin Audit   | `IMPLEMENTED` |    P1    |
| **Messages**    | Send Direct Message         |  🔒 Redirect  |      ✅ Send       |       ✅ Send        |  🛡️ Admin Audit   | `IMPLEMENTED` |    P1    |
| **Rooms**       | Browse Active Rooms         |    ✅ Read    |      ✅ Read       |       ✅ Read        |      ✅ Read      | `IMPLEMENTED` |    P0    |
| **Rooms**       | Host Room (Audio/Video)     | 🔒 Auth Modal |      ✅ Host       |   ✅ Host Control    |   🛡️ Mod Close    | `IMPLEMENTED` |    P0    |
| **Rooms**       | Join Room / Speak           | 🔒 Auth Modal |   ✅ Join/Speak    |   ✅ Host Control    |    🛡️ Mod Mute    | `IMPLEMENTED` |    P0    |
| **Communities** | View Communities            |    ✅ Read    |      ✅ Read       |       ✅ Read        |      ✅ Read      | `IMPLEMENTED` |    P0    |
| **Communities** | Join Community              | 🔒 Auth Modal |   ✅ Join/Leave    |    ✅ Join/Leave     |   🛡️ Mod Manage   | `IMPLEMENTED` |    P0    |
| **Communities** | Create Community            | 🔒 Auth Modal |     ✅ Create      |    ✅ Creator Mod    |  🛡️ Admin Delete  | `IMPLEMENTED` |    P1    |
| **Archive**     | Search / Browse Titles      |    ✅ Read    |      ✅ Read       |       ✅ Read        |      ✅ Read      | `IMPLEMENTED` |    P0    |
| **Archive**     | View Details & OTT Links    |    ✅ Read    |      ✅ Read       |       ✅ Read        |      ✅ Read      | `IMPLEMENTED` |    P0    |
| **Archive**     | Add to Watchlist            | 🔒 Auth Modal |   ✅ Add/Remove    |      ✅ Manage       |     ✅ Manage     | `IMPLEMENTED` |    P1    |
| **Articles**    | Read Articles               |    ✅ Read    |      ✅ Read       |       ✅ Read        |      ✅ Read      | `IMPLEMENTED` |    P0    |
| **Articles**    | Write Article               | 🔒 Auth Modal |  ✅ Submit Draft   |    ✅ Edit/Delete    | 🛡️ Publish/Delete | `IMPLEMENTED` |    P1    |
| **Gossips**     | Read Rumors & Stance        |    ✅ Read    |      ✅ Read       |       ✅ Read        |      ✅ Read      | `IMPLEMENTED` |    P0    |
| **Gossips**     | Drop Gossip (Rumor)         | 🔒 Auth Modal |     ✅ Create      |      ✅ Delete       |   🛡️ Mod Delete   | `IMPLEMENTED` |    P0    |
| **Gossips**     | Vote Stance (Believe/Doubt) | 🔒 Auth Modal |      ✅ Vote       |       ✅ Vote        |      ✅ Vote      | `IMPLEMENTED` |    P0    |
| **Games**       | View Games & Scores         |    ✅ Read    |      ✅ Read       |       ✅ Read        |      ✅ Read      | `IMPLEMENTED` |    P1    |
| **Games**       | Play & Submit Score         | 🔒 Auth Modal |     ✅ Submit      |   ✅ Personal Best   |  🛡️ Reset Score   | `IMPLEMENTED` |    P1    |
| **Memes**       | Browse Meme Feed            |    ✅ Read    |      ✅ Read       |       ✅ Read        |      ✅ Read      | `IMPLEMENTED` |    P0    |
| **Memes**       | Upload Meme                 | 🔒 Auth Modal |     ✅ Create      |      ✅ Delete       |   🛡️ Mod Delete   | `IMPLEMENTED` |    P0    |
| **Settings**    | Update Account & Password   |  🔒 Redirect  |   ✅ Manage Own    |    ✅ Manage Own     |  🛡️ Admin Reset   | `IMPLEMENTED` |    P0    |
| **Profiles**    | View Public Profile         |    ✅ Read    |      ✅ Read       |       ✅ Read        |      ✅ Read      | `IMPLEMENTED` |    P0    |
| **Profiles**    | Edit Own Profile            |   ❌ Denied   |     ❌ Denied      |     ✅ Edit Own      |   🛡️ Admin Ban    | `IMPLEMENTED` |    P0    |
| **Admin**       | Moderation Dashboard        |   ❌ Denied   |     ❌ Denied      |      ❌ Denied       |  🛡️ Staff Access  | `IMPLEMENTED` |    P1    |
