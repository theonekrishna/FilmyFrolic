import React, { useState, useEffect } from "react";
import { Loader2, Film, Search, X } from "lucide-react";
import { createPost, searchMoviesOMDB, getMovieSuggestions } from "../services/feedService";

// Fallback static movies for when TASTEDIVE API fails (CORS, etc.)
const STATIC_MOVIES = [
  { id: 1, title: "Inception", year: 2010, rating: 8.8 },
  { id: 2, title: "The Dark Knight", year: 2008, rating: 9.0 },
  { id: 3, title: "Interstellar", year: 2014, rating: 8.6 },
  { id: 4, title: "The Matrix", year: 1999, rating: 8.7 },
  { id: 5, title: "Pulp Fiction", year: 1994, rating: 8.9 },
  { id: 6, title: "The Shawshank Redemption", year: 1994, rating: 9.3 },
  { id: 7, title: "Dune: Part Two", year: 2024, rating: 8.5 },
  { id: 8, title: "Oppenheimer", year: 2023, rating: 8.4 },
];

export default function CreatePostModal({ isOpen, onClose, myProfile, onPostCreated }) {
  const [newPostText, setNewPostText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [movieTag, setMovieTag] = useState(null);
  const [showMovieSearch, setShowMovieSearch] = useState(false);
  const [movieSearchQuery, setMovieSearchQuery] = useState("");
  const [movieResults, setMovieResults] = useState([]);
  const [movieSuggestions, setMovieSuggestions] = useState([]);
  const [isSearchingMovies, setIsSearchingMovies] = useState(false);

  // Fetch movie suggestions when showing search
  useEffect(() => {
    if (showMovieSearch && movieSuggestions.length === 0 && !movieSearchQuery.trim()) {
      fetchMovieSuggestions();
    }
  }, [showMovieSearch]);

  // Search movies with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (movieSearchQuery.trim()) {
        searchMovies(movieSearchQuery);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [movieSearchQuery]);

  async function fetchMovieSuggestions() {
    try {
      const suggestions = await getMovieSuggestions();
      setMovieSuggestions(suggestions);
    } catch (err) {
      console.error("Failed to fetch movie suggestions:", err);
      // Fallback to static movies if API fails (CORS or other errors)
      setMovieSuggestions(STATIC_MOVIES.slice(0, 6));
    }
  }

  async function searchMovies(query) {
    setIsSearchingMovies(true);
    try {
      const result = await searchMoviesOMDB(query);
      setMovieResults(result.all || []);
    } catch (err) {
      console.error("Failed to search movies:", err);
      // Fallback: filter static movies
      const fallback = STATIC_MOVIES.filter((m) =>
        m.title.toLowerCase().includes(query.toLowerCase())
      );
      setMovieResults(fallback);
    } finally {
      setIsSearchingMovies(false);
    }
  }

  if (!isOpen) return null;

  function handleClose() {
    onClose();
    setNewPostText("");
    setMovieTag(null);
    setShowMovieSearch(false);
    setMovieSearchQuery("");
  }

  async function submitPost() {
    if (!newPostText.trim() || submitting) return;

    try {
      setSubmitting(true);
      const movieTagData = movieTag
        ? {
            title: movieTag.title,
            year: movieTag.year,
            rating: movieTag.rating,
          }
        : null;

      const response = await createPost(newPostText.trim(), movieTagData);
      const newPostData = response.data || response;

      if (onPostCreated) {
        onPostCreated(newPostData);
      }
      handleClose();
    } catch (err) {
      console.error("Failed to create post:", err);
      alert(err.message || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div onClick={handleClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-[#0d0d18] rounded-[20px] shadow-2xl ring-1 ring-white/10 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <button
            onClick={handleClose}
            className="text-[#f0f0f8]/60 hover:text-white font-['Outfit'] text-sm"
          >
            Cancel
          </button>
          <span className="font-['Outfit'] text-sm font-bold text-white">New Post</span>
          <button
            onClick={submitPost}
            disabled={!newPostText.trim() || submitting}
            className={`px-4 py-1.5 rounded-full font-['Outfit'] text-sm font-bold transition-all ${
              newPostText.trim() && !submitting
                ? "bg-[#3b82f6] text-white"
                : "bg-white/10 text-white/40 cursor-not-allowed"
            }`}
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {myProfile?.avatar_url ? (
                <img
                  src={myProfile.avatar_url}
                  alt={myProfile.username}
                  className="w-10 h-10 rounded-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-['Outfit'] font-extrabold text-sm text-white"
                  style={{
                    background:
                      myProfile?.avatar_color || "linear-gradient(135deg, #f5c518, #e84545)",
                  }}
                >
                  {myProfile?.username?.slice(0, 2).toUpperCase() ||
                    myProfile?.display_name?.slice(0, 2).toUpperCase() ||
                    "U"}
                </div>
              )}
            </div>
            <div className="flex-1">
              <span className="font-['Outfit'] text-sm font-bold text-white block">
                {myProfile?.username || myProfile?.display_name || "User"}
              </span>
            </div>
          </div>

          <textarea
            autoFocus
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="What's on your cinematic mind?"
            rows={5}
            className="w-full mt-4 bg-transparent border-none outline-none resize-none font-['Outfit'] text-lg text-[#f0f0f8] placeholder-white/30 leading-relaxed font-light caret-[#3b82f6]"
          />

          {/* Movie Tag Section */}
          <div className="mb-4">
            {movieTag ? (
              <div className="flex items-center gap-2 bg-[#f5c518]/10 border border-[#f5c518]/30 rounded-xl p-3">
                <Film size={18} className="text-[#f5c518]" />
                <div className="flex-1">
                  <span className="font-['Outfit'] text-sm font-bold text-[#f5c518]">
                    {movieTag.title}
                  </span>
                  {movieTag.year && (
                    <span className="font-['Outfit'] text-xs text-[#f0f0f8]/50 ml-2">
                      ({movieTag.year})
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setMovieTag(null)}
                  className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <X size={14} className="text-white/60" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowMovieSearch(!showMovieSearch)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[#f0f0f8]/60 hover:text-[#f0f0f8] hover:bg-white/10 transition-all font-['Outfit'] text-sm"
                >
                  <Film size={16} />
                  Tag a movie
                </button>

                {showMovieSearch && (
                  <div className="mt-2 bg-[#12121e] border border-white/10 rounded-xl p-3">
                    <div className="relative mb-3">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                      />
                      <input
                        type="text"
                        value={movieSearchQuery}
                        onChange={(e) => setMovieSearchQuery(e.target.value)}
                        placeholder="Search movies..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 font-['Outfit'] text-sm text-[#f0f0f8] placeholder-white/30 outline-none focus:border-[#3b82f6]"
                      />
                      {isSearchingMovies && (
                        <Loader2
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3b82f6] animate-spin"
                        />
                      )}
                    </div>

                    {/* Results or Suggestions */}
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {movieSearchQuery.trim() ? (
                        // Search Results
                        movieResults.length > 0 ? (
                          movieResults.map((movie) => (
                            <button
                              key={movie.id}
                              onClick={() => {
                                setMovieTag(movie);
                                setShowMovieSearch(false);
                                setMovieSearchQuery("");
                              }}
                              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                            >
                              <span className="font-['Outfit'] text-sm text-[#f0f0f8]">
                                {movie.title}
                              </span>
                              <span className="font-['Outfit'] text-xs text-[#f0f0f8]/40">
                                OMDb
                              </span>
                            </button>
                          ))
                        ) : isSearchingMovies ? null : (
                          <div className="text-center py-3">
                            <span className="font-['Outfit'] text-xs text-[#f0f0f8]/40">
                              No results found
                            </span>
                          </div>
                        )
                      ) : (
                        // Suggestions (no search query)
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-['Outfit'] text-xs text-[#f0f0f8]/50">
                              Suggestions for you
                            </span>
                            <button
                              onClick={fetchMovieSuggestions}
                              className="font-['Outfit'] text-xs text-[#3b82f6] hover:underline"
                            >
                              Refresh
                            </button>
                          </div>
                          {movieSuggestions.length > 0 ? (
                            movieSuggestions.map((movie) => (
                              <button
                                key={movie.id}
                                onClick={() => {
                                  setMovieTag(movie);
                                  setShowMovieSearch(false);
                                  setMovieSearchQuery("");
                                }}
                                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                              >
                                <span className="font-['Outfit'] text-sm text-[#f0f0f8]">
                                  {movie.title}
                                </span>
                                <span className="font-['Outfit'] text-xs text-[#f0f0f8]/40">↻</span>
                              </button>
                            ))
                          ) : (
                            <div className="flex justify-center py-2">
                              <Loader2 size={16} className="text-[#3b82f6] animate-spin" />
                            </div>
                          )}
                        </>
                      )}

                      {/* Add custom movie option when searching */}
                      {movieSearchQuery.trim() &&
                        !movieResults.some(
                          (m) => m.title.toLowerCase() === movieSearchQuery.toLowerCase()
                        ) && (
                          <button
                            onClick={() => {
                              setMovieTag({
                                id: Date.now(),
                                title: movieSearchQuery,
                                year: null,
                                genre: [],
                                rating: null,
                                image: null,
                              });
                              setShowMovieSearch(false);
                              setMovieSearchQuery("");
                            }}
                            className="w-full p-2 rounded-lg hover:bg-white/5 transition-colors text-left border-t border-white/5 mt-2 pt-2"
                          >
                            <span className="font-['Outfit'] text-sm text-[#3b82f6]">
                              Use "{movieSearchQuery}"
                            </span>
                          </button>
                        )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-[#12121e]/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMovieSearch(!showMovieSearch)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-['Outfit'] transition-all ${
                movieTag
                  ? "bg-[#f5c518]/20 text-[#f5c518]"
                  : "bg-white/5 text-[#f0f0f8]/60 hover:text-[#f0f0f8]"
              }`}
            >
              <Film size={14} />
              {movieTag ? movieTag.title : "Movie"}
            </button>
            <span className="font-['Outfit'] text-xs text-white/30">
              {500 - newPostText.length} left
            </span>
          </div>
          {submitting && <Loader2 size={18} className="text-[#3b82f6] animate-spin" />}
        </div>
      </div>
    </div>
  );
}
