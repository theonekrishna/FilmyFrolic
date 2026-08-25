// Shared constants & utilities for FilmyFrolic

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const TMDB_POSTER_SIZES = {
  THUMB: `${TMDB_IMAGE_BASE_URL}/w185`,
  MEDIUM: `${TMDB_IMAGE_BASE_URL}/w500`,
  ORIGINAL: `${TMDB_IMAGE_BASE_URL}/original`,
};

const TMDB_BACKDROP_SIZES = {
  MEDIUM: `${TMDB_IMAGE_BASE_URL}/w780`,
  ORIGINAL: `${TMDB_IMAGE_BASE_URL}/original`,
};

const MOVIE_GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

module.exports = {
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZES,
  TMDB_BACKDROP_SIZES,
  MOVIE_GENRES,
};
