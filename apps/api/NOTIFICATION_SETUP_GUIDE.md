# 🔔 Notification System — Setup Guide

> Complete guide for configuring the Filmy Frolic notification system.
> Covers database migration, backend service, Supabase Realtime, RLS, and testing.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Migration](#database-migration)
3. [Backend Changes Summary](#backend-changes-summary)
4. [Supabase Realtime Configuration](#supabase-realtime-configuration)
5. [Row Level Security (RLS)](#row-level-security-rls)
6. [Notification Types Reference](#notification-types-reference)
7. [API Reference](#api-reference)
8. [Frontend Integration Guide](#frontend-integration-guide)
9. [Cleanup & Data Retention](#cleanup--data-retention)
10. [Testing Checklist](#testing-checklist)

---

## Architecture Overview

```
┌──────────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│   Module Layer   │────▶│  NotificationService  │────▶│  Supabase DB     │
│  (Controllers)   │     │  (src/services/       │     │  (notifications  │
│                  │     │   notification.       │     │   table)         │
│  follow, feeds,  │     │   service.js)         │     │                  │
│  memes, gossips, │     │                      │     └────────┬─────────┘
│  rooms, games,   │     │  • Preference check  │              │
│  messages, admin │     │  • Deduplication     │              ▼
│                  │     │  • Self-notify guard │     ┌──────────────────┐
└──────────────────┘     │  • Bulk insert       │     │ Supabase Realtime│
                         └──────────────────────┘     │  (auto-push to   │
                                                      │   subscribed     │
                                                      │   clients)       │
                                                      └──────────────────┘
```

**Key design decisions:**

- **Best-effort**: Notification failures never block the primary action
- **Centralized**: All modules call `NotificationService.createNotification()`
- **Self-notify guard**: Users never receive notifications for their own actions
- **Preference-gated**: Respects user `preferences.notifications` toggles
- **Deduplicated**: Same `(user_id, actor_id, group_key)` within 60 seconds is suppressed
- **Soft-delete lifecycle**: Read notifications are soft-deleted after 45 days, purged after 90

---

## Database Migration

### Step 1: Run the migration

Open the **Supabase SQL Editor** and execute the contents of:

```
src/migrations/001_enhance_notifications_table.sql
```

This migration:

- Adds columns: `actor_id`, `entity_type`, `entity_id`, `action_url`, `group_key`, `priority`, `deleted_at`, `read_at`, `metadata`
- Creates performance indexes
- Enables RLS with 4 policies
- Adds the table to `supabase_realtime` publication
- Creates lifecycle functions (`soft_delete_old_notifications`, `purge_deleted_notifications`)
- Creates a welcome notification trigger on profile creation

### Step 2: Verify

```sql
-- Check new columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'notifications';

-- Check RLS is enabled
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'notifications';

-- Check Realtime publication
SELECT * FROM pg_publication_tables WHERE tablename = 'notifications';
```

### Step 3: (Optional) Enable pg_cron for automated cleanup

If pg_cron is available on your Supabase plan:

```sql
-- Soft-delete read notifications older than 45 days (daily at 3 AM UTC)
SELECT cron.schedule(
  'soft-delete-old-notifications',
  '0 3 * * *',
  $$SELECT soft_delete_old_notifications(45)$$
);

-- Hard-delete soft-deleted notifications older than 90 days (weekly)
SELECT cron.schedule(
  'purge-deleted-notifications',
  '0 4 * * 0',
  $$SELECT purge_deleted_notifications(90)$$
);
```

---

## Backend Changes Summary

### New Files

| File                                                 | Purpose                                                                 |
| ---------------------------------------------------- | ----------------------------------------------------------------------- |
| `src/services/notification.service.js`               | Central notification service with preference gating, dedup, bulk insert |
| `src/migrations/001_enhance_notifications_table.sql` | Database migration                                                      |

### Modified Files

| File                                                               | Changes                                                                       |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `src/utils/notifications.js`                                       | Fixed ES→CJS syntax; now delegates to NotificationService                     |
| `src/modules/notifications/notifications.model.js`                 | Full data access layer (paginated list, unread count, mark read, soft delete) |
| `src/modules/notifications/notifications.controller.js`            | Complete API controller (6 endpoints)                                         |
| `src/modules/notifications/notifications.routes.js`                | All notification routes                                                       |
| `src/modules/follow/follow.model.js`                               | Follow notification via NotificationService                                   |
| `src/modules/feeds/feed.controller.js`                             | Feed reaction, comment, reply notifications                                   |
| `src/modules/memes/memes.controller.js`                            | Meme upvote, reaction, comment, reply notifications                           |
| `src/modules/gossips/gossip.controller.js`                         | Gossip reaction, comment, reply notifications                                 |
| `src/modules/communities/communities.controller.js`                | Community join, post reaction notifications                                   |
| `src/modules/rooms/room.controller.js`                             | Room join, hand raise, role change notifications                              |
| `src/modules/games/game.controller.js`                             | Game achievement notification (≥80% score)                                    |
| `src/modules/messages/messages.controller.js`                      | New message notification                                                      |
| `src/modules/admin/moderation/admin.moderation.controllers.js`     | Warning and content removal notifications                                     |
| `src/modules/admin/notification/admin.notification.controllers.js` | Admin broadcast → user notifications table                                    |

---

## Supabase Realtime Configuration

### What's already done (via migration)

The migration adds the `notifications` table to the `supabase_realtime` publication:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

### Supabase Dashboard Configuration

1. Go to **Database → Replication** in your Supabase dashboard
2. Ensure the `notifications` table shows a ✅ under the `supabase_realtime` publication
3. Under **Source**, ensure `INSERT`, `UPDATE`, and `DELETE` events are enabled

### Frontend Realtime Subscription (Next.js / React)

```javascript
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // your client-side supabase client

function useNotifications(userId) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to INSERT events on notifications where user_id matches
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // New notification received in real time!
          setUnreadCount((prev) => prev + 1);

          // Optional: show a toast, play a sound, update the notification list
          console.log("New notification:", payload.new);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Notification marked as read or soft-deleted
          if (payload.new.is_read && !payload.old.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { unreadCount };
}
```

> **Important**: RLS policies ensure that each user only receives Realtime events for their own notifications. A user subscribing with `filter: user_id=eq.${userId}` will only see their own rows.

---

## Row Level Security (RLS)

The migration creates 4 RLS policies:

| Policy                         | Operation | Rule                                            |
| ------------------------------ | --------- | ----------------------------------------------- |
| `notifications_select_own`     | SELECT    | `auth.uid() = user_id`                          |
| `notifications_update_own`     | UPDATE    | `auth.uid() = user_id`                          |
| `notifications_insert_service` | INSERT    | `WITH CHECK (true)` — Backend uses service role |
| `notifications_delete_own`     | DELETE    | `auth.uid() = user_id`                          |

**Security guarantees:**

- A user can never read, update, or delete another user's notifications
- Inserts are done server-side via `supabaseAdmin` (service role key), which bypasses RLS
- Realtime subscriptions respect RLS — even if someone subscribes to another user's filter, they get 0 events

---

## Notification Types Reference

| Type                 | Trigger                    | Recipient         | Priority | Icon          | Preference Gate |
| -------------------- | -------------------------- | ----------------- | -------- | ------------- | --------------- |
| `follow`             | User follows another       | Followed user     | normal   | UserPlus      | —               |
| `feed_reaction`      | Reaction on a feed post    | Feed author       | normal   | Heart         | —               |
| `feed_comment`       | Comment on a feed post     | Feed author       | normal   | MessageCircle | `discussions`   |
| `feed_reply`         | Reply to a feed comment    | Comment author    | normal   | Reply         | `discussions`   |
| `meme_upvote`        | Meme upvoted               | Meme creator      | normal   | ThumbsUp      | —               |
| `meme_reaction`      | Reaction on a meme         | Meme creator      | low      | Smile         | —               |
| `meme_comment`       | Comment on a meme          | Meme creator      | normal   | MessageCircle | `discussions`   |
| `meme_reply`         | Reply to a meme comment    | Comment author    | normal   | Reply         | `discussions`   |
| `gossip_reaction`    | Reaction on a gossip       | Gossip author     | normal   | Flame         | —               |
| `gossip_comment`     | Comment on a gossip        | Gossip author     | normal   | MessageCircle | `discussions`   |
| `gossip_reply`       | Reply to a gossip comment  | Comment author    | normal   | Reply         | `discussions`   |
| `community_join`     | User joins a community     | Community creator | normal   | Users         | —               |
| `post_reaction`      | Reaction on community post | Post author       | normal   | Heart         | —               |
| `room_join`          | User joins a room          | Room owner        | normal   | Radio         | `liveRooms`     |
| `room_hand_raised`   | Hand raised in room        | Room host         | normal   | Hand          | `liveRooms`     |
| `room_role_changed`  | Role changed in room       | Target user       | high     | Shield        | `liveRooms`     |
| `game_achievement`   | Score ≥ 80% on a quiz      | Player (self)     | low      | Trophy        | —               |
| `new_message`        | New direct message         | Receiver          | normal   | MessageSquare | —               |
| `moderation_warning` | Admin issues warning       | Warned user       | critical | AlertTriangle | —               |
| `content_removed`    | Admin removes content      | Content owner     | critical | Trash2        | —               |
| `admin_broadcast`    | Admin sends broadcast      | All target users  | high     | Megaphone     | —               |
| `system`             | Profile creation           | New user          | normal   | Sparkles      | —               |

---

## API Reference

All endpoints require authentication via `Authorization: Bearer <token>`.

Base URL: `/api/notifications`

### GET `/api/notifications`

Paginated notification list.

**Query Parameters:**

| Param         | Type    | Default | Description                      |
| ------------- | ------- | ------- | -------------------------------- |
| `page`        | integer | 1       | Page number                      |
| `limit`       | integer | 20      | Items per page (max 100)         |
| `type`        | string  | null    | Filter by notification type      |
| `unread_only` | boolean | false   | Only return unread notifications |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "actor_id": "uuid",
      "title": "New Follower",
      "message": "JohnDoe started following you",
      "type": "follow",
      "icon": "UserPlus",
      "accent": "#3b82f6",
      "entity_type": "profile",
      "entity_id": "uuid",
      "action_url": "/profile/uuid",
      "group_key": "follow:uuid",
      "priority": "normal",
      "is_read": false,
      "read_at": null,
      "metadata": {},
      "created_at": "2024-01-01T00:00:00Z",
      "actor": {
        "id": "uuid",
        "username": "johndoe",
        "display_name": "John Doe",
        "avatar_url": "https://...",
        ...
      }
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

### GET `/api/notifications/unread-count`

```json
{ "success": true, "count": 7 }
```

### PATCH `/api/notifications/:id/read`

Mark a single notification as read.

### PATCH `/api/notifications/read-all`

Mark all notifications as read.

### DELETE `/api/notifications/:id`

Soft-delete a single notification.

### DELETE `/api/notifications/all`

Soft-delete all notifications.

---

## Cleanup & Data Retention

| Stage            | Timing                     | Action                           | Function                            |
| ---------------- | -------------------------- | -------------------------------- | ----------------------------------- |
| **Active**       | 0–45 days                  | Visible in notification list     | —                                   |
| **Soft-deleted** | 45+ days (if read)         | Hidden from queries, recoverable | `soft_delete_old_notifications(45)` |
| **Purged**       | 90+ days after soft-delete | Permanently removed              | `purge_deleted_notifications(90)`   |

- Unread notifications are **never** automatically soft-deleted
- Users can manually soft-delete notifications at any time via the API
- Critical notifications (warnings, content removal) are never automatically deleted

---

## Testing Checklist

### Database

- [ ] Migration runs without errors
- [ ] All new columns exist on `notifications` table
- [ ] Indexes are created
- [ ] RLS is enabled with 4 policies
- [ ] `notifications` is in `supabase_realtime` publication
- [ ] Welcome notification trigger fires on new profile creation
- [ ] `soft_delete_old_notifications(0)` runs successfully
- [ ] `purge_deleted_notifications(0)` runs successfully

### API Endpoints

- [ ] `GET /api/notifications` returns paginated results
- [ ] `GET /api/notifications?unread_only=true` filters correctly
- [ ] `GET /api/notifications?type=follow` filters by type
- [ ] `GET /api/notifications/unread-count` returns correct count
- [ ] `PATCH /api/notifications/:id/read` marks as read
- [ ] `PATCH /api/notifications/read-all` marks all as read
- [ ] `DELETE /api/notifications/:id` soft-deletes (sets `deleted_at`)
- [ ] `DELETE /api/notifications/all` soft-deletes all

### Notification Triggers

- [ ] Following a user creates a notification for the followed user
- [ ] Reacting to a feed post notifies the author
- [ ] Commenting on a feed notifies the author
- [ ] Replying to a feed comment notifies the comment author
- [ ] Upvoting a meme notifies the creator
- [ ] Commenting on a meme notifies the creator
- [ ] Reacting to a gossip notifies the author
- [ ] Commenting on a gossip notifies the author
- [ ] Joining a community notifies the creator
- [ ] Reacting to a community post notifies the author
- [ ] Joining a room notifies the host
- [ ] Raising a hand notifies the host
- [ ] Changing a user's role notifies the target user
- [ ] Scoring ≥80% on a quiz creates an achievement notification
- [ ] Sending a message notifies the receiver
- [ ] Admin warning notifies the warned user (priority: critical)
- [ ] Admin content removal notifies the content owner (priority: critical)
- [ ] Admin broadcast creates notifications for all target users

### Security

- [ ] User A cannot see User B's notifications via API
- [ ] User A cannot mark User B's notifications as read
- [ ] User A cannot delete User B's notifications
- [ ] Realtime subscription only delivers events for the authenticated user
- [ ] Self-notifications are suppressed (e.g., commenting on your own post)

### Preference Gating

- [ ] Setting `preferences.notifications.discussions = false` suppresses comment notifications
- [ ] Setting `preferences.notifications.liveRooms = false` suppresses room notifications
- [ ] Critical notifications (warnings, content removal) are never suppressed

### Deduplication

- [ ] Same user reacting twice within 60s creates only 1 notification
- [ ] Different users reacting create separate notifications
