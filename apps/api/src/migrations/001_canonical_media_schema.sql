-- ==============================================================================
-- FilmyFrolic Canonical Media Database Migration (TMDB Decoupling Schema)
-- Designed to seamlessly extend existing 53 Supabase application tables.
-- ==============================================================================

-- 1. Reference Lookup Tables
CREATE TABLE IF NOT EXISTS countries (
  code VARCHAR(2) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  native_name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS languages (
  code VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  english_name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS genres (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS production_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  logo_path TEXT,
  origin_country VARCHAR(2) REFERENCES countries(code)
);

-- 2. Canonical Movies
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

-- 3. Canonical TV Shows
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

-- 4. Canonical People (Actors, Directors, Crew)
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  biography TEXT,
  birthday DATE,
  deathday DATE,
  gender VARCHAR(20),
  place_of_birth VARCHAR(255),
  profile_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Cast & Crew Credits
CREATE TABLE IF NOT EXISTS credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  tv_show_id UUID REFERENCES tv_shows(id) ON DELETE CASCADE,
  department VARCHAR(100) NOT NULL,
  job VARCHAR(100),
  character_name VARCHAR(255),
  cast_order INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT credit_target_check CHECK (
    (movie_id IS NOT NULL AND tv_show_id IS NULL) OR
    (movie_id IS NULL AND tv_show_id IS NOT NULL)
  )
);

-- 6. External Provider Mappings (TMDB, IMDb, Letterboxd, Wikidata)
CREATE TABLE IF NOT EXISTS movie_external_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  external_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_movie_provider_id UNIQUE (movie_id, provider)
);

CREATE TABLE IF NOT EXISTS tv_show_external_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tv_show_id UUID NOT NULL REFERENCES tv_shows(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  external_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_tv_provider_id UNIQUE (tv_show_id, provider)
);

CREATE TABLE IF NOT EXISTS person_external_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  external_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_person_provider_id UNIQUE (person_id, provider)
);

-- 7. User Media Ratings & Reviews (References existing profiles table)
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  tv_show_id UUID REFERENCES tv_shows(id) ON DELETE CASCADE,
  score NUMERIC(3, 1) NOT NULL CHECK (score >= 0.5 AND score <= 10.0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT rating_target_check CHECK (
    (movie_id IS NOT NULL AND tv_show_id IS NULL) OR
    (movie_id IS NULL AND tv_show_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  tv_show_id UUID REFERENCES tv_shows(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_spoiler BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Media Assets (Posters, Backdrops, Trailers)
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  tv_show_id UUID REFERENCES tv_shows(id) ON DELETE CASCADE,
  media_type VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  width INT,
  height INT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Performance Indexing
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);
CREATE INDEX IF NOT EXISTS idx_movies_release_date ON movies(release_date);
CREATE INDEX IF NOT EXISTS idx_movie_ext_ids ON movie_external_ids(provider, external_id);
CREATE INDEX IF NOT EXISTS idx_tv_ext_ids ON tv_show_external_ids(provider, external_id);
CREATE INDEX IF NOT EXISTS idx_credits_movie ON credits(movie_id);
CREATE INDEX IF NOT EXISTS idx_credits_person ON credits(person_id);
