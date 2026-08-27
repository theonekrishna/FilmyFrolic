// Shared DTO and Entity Types for FilmyFrolic

export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at?: string;
  role?: string;
  status?: string;
}

export interface Movie {
  id: string | number;
  title: string;
  overview?: string;
  synopsis?: string;
  poster?: string;
  poster_path?: string | null;
  backdropUrl?: string;
  backdrop_path?: string | null;
  releaseYear?: number;
  release_date?: string;
  rating?: number;
  vote_average?: number;
  duration?: string;
  director?: string;
  status?: string;
  viewsCount?: number;
  genre?: string[];
  cast?: string[];
}

export interface Gossip {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  publishedAt: string;
  likesCount: number;
  commentsCount: number;
  imageUrl?: string;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  membersCount?: number;
  category?: string;
  bannerUrl?: string;
  isJoined?: boolean;
  created_at?: string;
}

export interface Room {
  id: string;
  title: string;
  host: string;
  activeViewers: number;
  status: "live" | "scheduled" | "ended";
  currentMovie?: string;
}

export interface Quiz {
  id: string;
  title: string;
  category: string;
  questionsCount: number;
  playsCount: number;
  avgScore: number;
  imageUrl?: string;
}

export interface Meme {
  id: string;
  title: string;
  imageUrl?: string;
  author: string;
  upvotes: number;
  submittedAt: string;
}
