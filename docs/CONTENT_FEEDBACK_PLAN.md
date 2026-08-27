# Admin Dashboard: External Content & Feedback System Plan

## Overview

Movies, Articles, and Cast & Crew data come from external sources and cannot be edited directly. Admins can moderate visibility and collect feedback for content corrections.

---

## 1. Content Management Section Changes

### Movies Tab (Read-Only with Moderation)

**Keep:**

- ✅ Search functionality
- ✅ Status toggle (Published/Hidden) - for moderation
- ✅ Featured toggle - to promote content
- ✅ View details button

**Remove:**

- ❌ Edit button (content is external)
- ❌ Delete button (content is external)
- ❌ "Add Movie" button

**Add:**

- ✨ "Report Issue" button - opens feedback modal
- ✨ Feedback count badge - shows pending issues
- ✨ "Sync Content" button - refresh from external source

### Articles Tab (Read-Only with Moderation)

**Keep:**

- ✅ Search functionality
- ✅ Status toggle (Published/Hidden)
- ✅ View details

**Remove:**

- ❌ Edit/Delete buttons
- ❌ "Add Article" button

**Add:**

- ✨ "Report Issue" button
- ✨ Feedback count badge
- ✨ "Sync Content" button

### Cast & Crew Tab (NEW)

**Features:**

- Display cast and crew members
- Search by name, role, movie
- View filmography/credits
- "Report Issue" button for incorrect info
- Cannot add/edit/delete (external data)

---

## 2. New Section: Content Feedback

**Purpose:** Manage all feedback/issues reported about external content

**Location:** New sidebar item between "Content" and "Social"

**Features:**

- **Feedback Queue:**
  - List all pending feedback submissions
  - Filter by: Type (Movie/Article/Cast), Status (Pending/Reviewed/Forwarded)
  - Priority system (High/Medium/Low)

- **Feedback Types:**
  - Incorrect Information
  - Missing Data
  - Image Quality Issues
  - Rating/Review Disputes
  - Duplicate Entries
  - Other

- **Actions:**
  - Mark as Reviewed
  - Forward to Content Provider
  - Dismiss (with reason)
  - Add admin notes

- **Feedback Details:**
  - Submitted by (user)
  - Content item (movie/article/cast)
  - Issue category
  - Description
  - Suggested correction
  - Timestamp
  - Status

---

## 3. Data Structure Changes

### New Types (AdminData.ts)

```typescript
export type ContentFeedbackType = "movie" | "article" | "cast";
export type FeedbackCategory =
  "incorrect_info" | "missing_data" | "image_quality" | "duplicate" | "rating_dispute" | "other";
export type FeedbackStatus = "pending" | "reviewed" | "forwarded" | "dismissed";
export type FeedbackPriority = "high" | "medium" | "low";

export interface ContentFeedback {
  id: string;
  type: ContentFeedbackType;
  contentId: string; // ID of movie/article/cast
  contentTitle: string; // Name/title for display
  category: FeedbackCategory;
  description: string;
  suggestedCorrection?: string;
  submittedBy: string; // username
  submittedAt: string;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface CastCrewMember {
  id: string;
  name: string;
  role: "actor" | "director" | "producer" | "writer" | "cinematographer" | "other";
  image: string;
  bio: string;
  credits: number; // Number of movies/shows
  featured: boolean;
  popularMovies: string[]; // Movie titles
}
```

---

## 4. UI/UX Flow

### Reporting Feedback (User Side - Not in this admin panel, but good to know)

1. Users see "Report Issue" button on content
2. Modal opens with:
   - Issue category dropdown
   - Description textarea
   - Optional: Suggested correction field
3. Submission creates ContentFeedback entry

### Managing Feedback (Admin Side)

1. Admin sees "Content Feedback" in sidebar with badge count
2. Opens to see all pending feedback
3. Can filter/search feedback
4. Reviews each item:
   - Views original content
   - Reads user's report
   - Decides action: Review/Forward/Dismiss
   - Adds admin notes
5. Dashboard shows metrics:
   - Pending feedback count
   - Resolved this week
   - Most reported items
   - Average resolution time

---

## 5. Implementation Steps

### Phase 1: Data Layer

- [ ] Add new types to AdminData.ts
- [ ] Create mock ContentFeedback data
- [ ] Create mock CastCrewMember data
- [ ] Update existing movie/article data to include feedback counts

### Phase 2: Content Section Updates

- [ ] Update Movies tab (remove edit/delete, add report issue badge)
- [ ] Update Articles tab (same changes)
- [ ] Add Cast & Crew tab with new UI
- [ ] Add "Sync Content" button to each tab
- [ ] Update Gossip tab (keep as-is since it's user-generated)

### Phase 3: Content Feedback Section

- [ ] Create ContentFeedbackSection component
- [ ] Build feedback queue UI
- [ ] Add filtering and search
- [ ] Create feedback detail modal/panel
- [ ] Add admin action buttons
- [ ] Add metrics dashboard

### Phase 4: Integration

- [ ] Add Content Feedback to sidebar navigation
- [ ] Add badge counts to show pending feedback
- [ ] Update routing
- [ ] Test all flows

---

## 6. Visual Mockup Ideas

### Movie Row (Updated)

```
[Image] Title | Year | Genre | Rating | Status | Featured | [3 Issues] | [👁️ View] [🚫 Hide] [⭐ Feature] [📝 Report Issue]
```

### Content Feedback Item

```
┌─────────────────────────────────────────────────────┐
│ 🎬 MOVIE: The Obsidian Protocol                     │
│ Category: Incorrect Information | Priority: High    │
│ Submitted by: @johndoe | 2h ago                     │
│                                                      │
│ "The release year is listed as 2025 but it was      │
│  actually released in 2024."                        │
│                                                      │
│ Suggested: Change year from 2025 to 2024           │
│                                                      │
│ [✓ Mark Reviewed] [➡️ Forward] [✗ Dismiss] [View Content]
└─────────────────────────────────────────────────────┘
```

---

## 7. Confirmed Requirements

1. **External Source:** FilyDock API (movie database)
2. **Sync Method:** Admin manually syncs after modifying data in FilyDock source
3. **Feedback Workflow:** User suggests → Admin reviews → Admin modifies in FilyDock → Sync button updates local data
4. **Cast & Crew Scope:** Includes ALL roles (actors, directors, producers, writers, cinematographers, composers, editors, etc.)
5. **Gossip Content:** Internal/user-generated content (remains fully editable - keep current functionality)

---

## 8. Benefits

✅ Clear separation between external (read-only) and user-generated (editable) content
✅ Centralized feedback management
✅ Admins can still moderate visibility and featuring
✅ Reduces data inconsistency from manual edits
✅ Provides channel for content improvement
✅ Maintains clean audit trail of reported issues
