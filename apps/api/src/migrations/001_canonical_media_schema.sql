-- ==============================================================================
-- FilmyFrolic Canonical Media Database Schema
-- Architecture Goal: TMDB Provider Independence
-- ==============================================================================

-- 1. Languages & Countries Lookup Tables
CREATE TABLE IF NOT EXISTS languages (
  code VARCHAR(10) PRIMARY KEY, -- e.g. 'en', 'hi', 'te', 'es'
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS countries (
  code VARCHAR(2) PRIMARY KEY, -- e.g. 'US', 'IN', 'GB'
  name VARCHAR(100) NOT NULL
);

-- 2. Genres & Production Companies
CREATE TABLE IF NOT EXISTS genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS production_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  logo_path TEXT,
  origin_country VARCHAR(2) REFERENCES countries(code)
);

-- 3. Canonical Movies
CREATE TABLE IF NOT EXISTS movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  original_title VARCHAR(255),
  overview TEXT,
  release_date DATE,
  runtime_minutes INT,
  status VARCHAR(50) DEFAULT 'Released',
  poster_path TEXT,
  backdrop_path TEXT,
  original_language VARCHAR(10) REFERENCES languages(code),
  vote_average NUMERIC(3, 1) DEFAULT 0.0,
  vote_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Canonical TV Shows
CREATE TABLE IF NOT EXISTS tv_shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  overview TEXT,
  first_air_date DATE,
  last_air_date DATE,
  number_of_seasons INT DEFAULT 1,
  number_of_episodes INT DEFAULT 1,
  status VARCHAR(50) DEFAULT 'Ended',
  poster_path TEXT,
  backdrop_path TEXT,
  original_language VARCHAR(10) REFERENCES languages(code),
  vote_average NUMERIC(3, 1) DEFAULT 0.0,
  vote_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Canonical Persons (Actors, Directors, Writers)
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  biography TEXT,
  birthday DATE,
  deathday DATE,
  gender SMALLINT DEFAULT 0, -- 0: Unspecified, 1: Female, 2: Male, 3: Non-Binary
  place_of_birth VARCHAR(255),
  profile_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. External Provider Identifiers (Decoupling TMDB / IMDb / TVDB / Letterboxd)
CREATE TABLE IF NOT EXISTS movie_external_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'tmdb', 'imdb', 'wikidata', 'letterboxd'
  external_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_movie_provider UNIQUE (movie_id, provider)
);

CREATE TABLE IF NOT EXISTS tv_show_external_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tv_show_id UUID NOT NULL REFERENCES tv_shows(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'tmdb', 'imdb', 'tvdb', 'wikidata'
  external_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_tv_provider UNIQUE (tv_show_id, provider)
);

CREATE TABLE IF NOT EXISTS person_external_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'tmdb', 'imdb', 'wikidata'
  external_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_person_provider UNIQUE (person_id, provider)
);

-- 7. Media Credits (Cast & Crew Junction)
CREATE TABLE IF NOT EXISTS credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('movie', 'tv_show')),
  media_id UUID NOT NULL,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  credit_type VARCHAR(10) NOT NULL CHECK (credit_type IN ('cast', 'crew')),
  role VARCHAR(255) NOT NULL, -- Character name or job title (e.g. 'Director')
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Media Attachments (Trailers, Backdrops, Stills)
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_media_type VARCHAR(20) NOT NULL CHECK (parent_media_type IN ('movie', 'tv_show', 'person')),
  parent_media_id UUID NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'poster', 'backdrop', 'trailer', 'still'
  url TEXT NOT NULL,
  site VARCHAR(50) DEFAULT 'YouTube',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Canonical User Ratings & Reviews
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- References auth.users / profiles
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('movie', 'tv_show')),
  media_id UUID NOT NULL,
  score NUMERIC(3, 1) NOT NULL CHECK (score >= 0.0 AND score <= 10.0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_media_rating UNIQUE (user_id, media_type, media_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('movie', 'tv_show')),
  media_id UUID NOT NULL,
  rating_id UUID REFERENCES ratings(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_spoiler BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. User Watchlist
CREATE TABLE IF NOT EXISTS watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('movie', 'tv_show')),
  media_id UUID NOT NULL,
  status VARCHAR(50) DEFAULT 'planned', -- 'planned', 'watching', 'completed', 'dropped'
  added_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_watchlist_item UNIQUE (user_id, media_type, media_id)
);

-- ── Indexing for High-Performance Queries ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_movies_release_date ON movies(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_movie_ext_provider_id ON movie_external_ids(provider, external_id);
CREATE INDEX IF NOT EXISTS idx_tv_ext_provider_id ON tv_show_external_ids(provider, external_id);
CREATE INDEX IF NOT EXISTS idx_credits_media ON credits(media_type, media_id);
CREATE INDEX IF NOT EXISTS idx_ratings_media ON ratings(media_type, media_id);
