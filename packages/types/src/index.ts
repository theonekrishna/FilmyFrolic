// Shared DTO and Entity Types for FilmyFrolic

export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}
