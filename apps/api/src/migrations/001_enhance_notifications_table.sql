-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: 001_enhance_notifications_table.sql
-- Purpose:   Upgrade the basic notifications table to a production-ready
--            notification system with actor tracking, entity linking,
--            soft deletion, Realtime support, RLS, and lifecycle management.
-- ═══════════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────────
-- 1. ADD MISSING COLUMNS
-- ──────────────────────────────────────────────────────────────────────────

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS actor_id    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS entity_type text,
  ADD COLUMN IF NOT EXISTS entity_id   uuid,
  ADD COLUMN IF NOT EXISTS action_url  text,
  ADD COLUMN IF NOT EXISTS group_key   text,
  ADD COLUMN IF NOT EXISTS priority    text DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  ADD COLUMN IF NOT EXISTS deleted_at  timestamptz,
  ADD COLUMN IF NOT EXISTS read_at     timestamptz,
  ADD COLUMN IF NOT EXISTS metadata    jsonb DEFAULT '{}'::jsonb;


-- ──────────────────────────────────────────────────────────────────────────
-- 2. PERFORMANCE INDEXES
-- ──────────────────────────────────────────────────────────────────────────

-- Primary query: user's active notifications, newest first
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications (user_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Unread count (fast head-only query)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications (user_id, is_read)
  WHERE deleted_at IS NULL AND is_read = false;

-- Frontend aggregation / dedup
CREATE INDEX IF NOT EXISTS idx_notifications_group_key
  ON public.notifications (user_id, group_key)
  WHERE deleted_at IS NULL;

-- Cleanup queries
CREATE INDEX IF NOT EXISTS idx_notifications_deleted_at
  ON public.notifications (deleted_at)
  WHERE deleted_at IS NOT NULL;

-- Entity look-ups (e.g. "all notifications about feed X")
CREATE INDEX IF NOT EXISTS idx_notifications_entity
  ON public.notifications (entity_type, entity_id);

-- Actor look-ups (e.g. "all notifications triggered by user Y")
CREATE INDEX IF NOT EXISTS idx_notifications_actor
  ON public.notifications (actor_id)
  WHERE actor_id IS NOT NULL;


-- ──────────────────────────────────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────────────────────────────

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS notifications_select_own ON public.notifications;
DROP POLICY IF EXISTS notifications_update_own ON public.notifications;
DROP POLICY IF EXISTS notifications_insert_service ON public.notifications;
DROP POLICY IF EXISTS notifications_delete_own ON public.notifications;

-- Users can only SELECT their own notifications
CREATE POLICY notifications_select_own
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can UPDATE (mark read / soft delete) their own notifications
CREATE POLICY notifications_update_own
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- INSERT is performed via service role key (backend), so allow all inserts.
-- The service role bypasses RLS anyway, but this makes it explicit.
CREATE POLICY notifications_insert_service
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Users can DELETE their own notifications (hard delete fallback)
CREATE POLICY notifications_delete_own
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────────────────
-- 4. SUPABASE REALTIME
-- ──────────────────────────────────────────────────────────────────────────

-- Add the notifications table to the Realtime publication.
-- This enables live INSERT/UPDATE/DELETE events via Supabase Realtime channels.
-- NOTE: If the table is already in the publication this will error —
--       wrap in a DO block for idempotency.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'notifications already in supabase_realtime publication';
END;
$$;


-- ──────────────────────────────────────────────────────────────────────────
-- 5. LIFECYCLE FUNCTIONS
-- ──────────────────────────────────────────────────────────────────────────

-- Soft-delete read notifications older than N days (default 45).
-- Call via pg_cron: SELECT soft_delete_old_notifications(45);
CREATE OR REPLACE FUNCTION soft_delete_old_notifications(
  retention_days integer DEFAULT 45
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected integer;
BEGIN
  UPDATE public.notifications
  SET deleted_at = now()
  WHERE deleted_at IS NULL
    AND is_read = true
    AND created_at < now() - make_interval(days => retention_days);

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

-- Hard-delete soft-deleted notifications older than N days (default 90).
-- Call via pg_cron: SELECT purge_deleted_notifications(90);
CREATE OR REPLACE FUNCTION purge_deleted_notifications(
  purge_after_days integer DEFAULT 90
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected integer;
BEGIN
  DELETE FROM public.notifications
  WHERE deleted_at IS NOT NULL
    AND deleted_at < now() - make_interval(days => purge_after_days);

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;


-- ──────────────────────────────────────────────────────────────────────────
-- 6. WELCOME NOTIFICATION TRIGGER
-- ──────────────────────────────────────────────────────────────────────────

-- Fires once when a new profile row is created (after user signup).
CREATE OR REPLACE FUNCTION create_welcome_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id, title, message, type, icon, accent, priority, entity_type
  )
  VALUES (
    NEW.id,
    'Welcome to Filmy Frolic! 🎬',
    'Start exploring communities, share your movie takes, and connect with fellow cinephiles.',
    'system',
    'Sparkles',
    '#F97316',
    'normal',
    'system'
  );
  RETURN NEW;
END;
$$;

-- Drop if exists for idempotency, then create
DROP TRIGGER IF EXISTS on_profile_created_welcome ON public.profiles;

CREATE TRIGGER on_profile_created_welcome
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_welcome_notification();


-- ──────────────────────────────────────────────────────────────────────────
-- 7. OPTIONAL: pg_cron SCHEDULES
--    Run these ONLY if pg_cron is enabled on your Supabase project.
--    You can execute them from the Supabase SQL Editor.
-- ──────────────────────────────────────────────────────────────────────────

-- SELECT cron.schedule(
--   'soft-delete-old-notifications',     -- job name
--   '0 3 * * *',                         -- daily at 3 AM UTC
--   $$SELECT soft_delete_old_notifications(45)$$
-- );

-- SELECT cron.schedule(
--   'purge-deleted-notifications',       -- job name
--   '0 4 * * 0',                         -- weekly on Sunday at 4 AM UTC
--   $$SELECT purge_deleted_notifications(90)$$
-- );
