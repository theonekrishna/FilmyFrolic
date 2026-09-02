import apiClient from "./apiClient";
import type { Movie } from "@filmyfrolic/types";

export const MOCK_MOVIES: Movie[] = [
  {
    id: "m1",
    title: "Realm of Ash & Fire",
    genre: ["Sci-Fi", "Action", "Drama"],
    rating: 9.1,
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800",
    backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200",
    releaseYear: 2025,
    duration: "2h 45m",
    director: "Christopher Nolan",
    synopsis:
      "In a ruined post-apocalyptic biosphere, a lone team of archivists races against time to unlock the lost cinematic records of humanity.",
    status: "published",
    viewsCount: 284000,
    cast: ["Cillian Murphy", "Florence Pugh", "Tom Hardy"],
  },
  {
    id: "m2",
    title: "The Obsidian Protocol",
    genre: ["Thriller", "Mystery"],
    rating: 8.7,
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800",
    backdropUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200",
    releaseYear: 2025,
    duration: "2h 12m",
    director: "Denis Villeneuve",
    synopsis:
      "A rogue cybernetic detective uncovers a covert conspiracy spanning planetary neural nodes.",
    status: "published",
    viewsCount: 192000,
    cast: ["Timothée Chalamet", "Zendaya", "Javier Bardem"],
  },
  {
    id: "m3",
    title: "Echoes of Eternity",
    genre: ["Romance", "Fantasy"],
    rating: 8.4,
    poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800",
    releaseYear: 2024,
    duration: "1h 58m",
    director: "Greta Gerwig",
    synopsis:
      "Two souls across distinct centuries communicate through a mysterious glowing theater projection.",
    status: "published",
    viewsCount: 145000,
    cast: ["Saoirse Ronan", "Paul Mescal"],
  },
  {
    id: "m4",
    title: "Vanguard Zero",
    genre: ["Action", "Sci-Fi"],
    rating: 7.9,
    poster: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800",
    releaseYear: 2025,
    duration: "2h 05m",
    director: "Joseph Kosinski",
    synopsis: "Aerial aces pilot experimental hypersonic starfighters beyond the exosphere.",
    status: "published",
    viewsCount: 98000,
    cast: ["Glen Powell", "Miles Teller"],
  },
];

export const movieService = {
  async getTrendingMovies(): Promise<Movie[]> {
    try {
      const res = await apiClient.get("/api/movie/trending");
      return res.data.movies || MOCK_MOVIES;
    } catch {
      return MOCK_MOVIES;
    }
  },

  async getMovieDetails(id: string): Promise<Movie | null> {
    try {
      const res = await apiClient.get(`/api/movie/${id}`);
      return res.data.movie || MOCK_MOVIES.find((m) => m.id === id) || MOCK_MOVIES[0];
    } catch {
      return MOCK_MOVIES.find((m) => m.id === id) || MOCK_MOVIES[0];
    }
  },
};
