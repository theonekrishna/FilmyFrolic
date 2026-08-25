-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  post_id uuid,
  user_id uuid,
  content text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.communities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  banner_url text,
  created_by uuid,
  created_at timestamp without time zone DEFAULT now(),
  avatar_emoji text DEFAULT '🎬'::text,
  avatar_gradient text DEFAULT 'linear-gradient(135deg, #3b82f6, #9b59b6)'::text,
  genres ARRAY DEFAULT '{}'::text[],
  category text DEFAULT 'General'::text,
  is_trending boolean DEFAULT false,
  CONSTRAINT communities_pkey PRIMARY KEY (id),
  CONSTRAINT communities_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.community_members (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  community_id uuid,
  role text DEFAULT 'member'::text CHECK (role = ANY (ARRAY['admin'::text, 'member'::text])),
  joined_at timestamp without time zone DEFAULT now(),
  CONSTRAINT community_members_pkey PRIMARY KEY (id),
  CONSTRAINT community_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT community_members_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  community_id uuid,
  title text NOT NULL,
  event_date timestamp without time zone NOT NULL,
  attending_count integer DEFAULT 0,
  type text,
  color text,
  display_date text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id)
);
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  community_id uuid,
  user_id uuid,
  content text,
  media_url text,
  created_at timestamp without time zone DEFAULT now(),
  is_spoiler boolean DEFAULT false,
  attached_movie jsonb,
  share_count integer DEFAULT 0,
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id),
  CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  name text,
  avatar_url text,
  gradient text DEFAULT 'linear-gradient(135deg, #3b82f6, #9b59b6)'::text,
  initials text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.reactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  post_id uuid,
  emoji text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT reactions_pkey PRIMARY KEY (id),
  CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id)
);