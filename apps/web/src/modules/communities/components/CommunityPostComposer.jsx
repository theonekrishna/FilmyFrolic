import React, { useState, useEffect } from "react";
import { X, Loader2, EyeOff, Eye, Image as ImageIcon, Film, Search } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import {
  createCommunityPost,
  searchMoviesOMDB,
  getMovieSuggestions,
} from "../services/communityService";

const ACCENT = "#3b82f6";

export default function CommunityPostComposer({ community, onClose, onPostCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState(null);

  // Media URL (image/video link)
  const [mediaUrl, setMediaUrl] = useState("");
  const [showMediaInput, setShowMediaInput] = useState(false);

  // Attached movie - TASTEDIVE
  const [attachedMovie, setAttachedMovie] = useState(null);
  const [showMovieSearch, setShowMovieSearch] = useState(false);
  const [movieSearchQuery, setMovieSearchQuery] = useState("");
  const [movieResults, setMovieResults] = useState([]);
  const [movieSuggestions, setMovieSuggestions] = useState([]);
  const [isSearchingMovies, setIsSearchingMovies] = useState(false);

  // Auto-focus the textarea
  const textareaRef = React.useRef(null);
  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
  }, []);

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

  // Static Movie Data (no TMDB API needed)
  const STATIC_MOVIES = [
    {
      id: 1,
      title: "Inception",
      year: "2010",
      genre: ["Sci-Fi", "Action"],
      rating: "8.8",
      image: "https://image.tmdb.org/t/p/w92/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    },
    {
      id: 2,
      title: "The Dark Knight",
      year: "2008",
      genre: ["Action", "Drama"],
      rating: "9.0",
      image: "https://image.tmdb.org/t/p/w92/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    },
    {
      id: 3,
      title: "Forrest Gump",
      year: "1994",
      genre: ["Drama", "Romance"],
      rating: "8.8",
      image: "https://image.tmdb.org/t/p/w92/arw2vcBveWOVZr6pxc9S17n7F9.jpg",
      poster_path: "/arw2vcBveWOVZr6pxc9S17n7F9.jpg",
    },
    {
      id: 4,
      title: "The Matrix",
      year: "1999",
      genre: ["Sci-Fi", "Action"],
      rating: "8.7",
      image: "https://image.tmdb.org/t/p/w92/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
      poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    },
    {
      id: 5,
      title: "Pulp Fiction",
      year: "1994",
      genre: ["Crime", "Drama"],
      rating: "8.9",
      image: "https://image.tmdb.org/t/p/w92/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
      poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    },
    {
      id: 6,
      title: "Interstellar",
      year: "2014",
      genre: ["Sci-Fi", "Adventure"],
      rating: "8.6",
      image: "https://image.tmdb.org/t/p/w92/gEU2QniL6C8z19uVOtYnZ5UYj7d.jpg",
      poster_path: "/gEU2QniL6C8z19uVOtYnZ5UYj7d.jpg",
    },
  ];

  async function handleSubmit() {
    if (!content.trim()) return;

    setIsPosting(true);
    setError(null);

    // Guard against posting to static/demo communities (which have short IDs like "c1")
    if (community.id.length < 20) {
      setError("Cannot post to demonstration communities. Please join a real one.");
      setIsPosting(false);
      return;
    }

    try {
      // Format attachedMovie for API (text only - no image)
      const movieTagData = attachedMovie
        ? {
            title: attachedMovie.title,
            year: attachedMovie.year,
            rating: attachedMovie.rating,
          }
        : null;

      const payload = {
        content: content.trim(),
        mediaUrl: mediaUrl.trim(),
        isSpoiler: isSpoiler,
        attachedMovie: movieTagData, // API expects attachedMovie (not movieTag like feed)
        // userId removed - auto-injected from JWT token per API docs
      };

      const responseData = await createCommunityPost(community.id, payload);

      // Merge backend response with complete frontend post structure
      const newPost = {
        id: responseData?.id || `new-${Date.now()}`,
        user: responseData?.user || user?.displayName || user?.username || "You",
        username: responseData?.username || user?.username || user?.displayName || "You",
        initials: user?.initials || user?.displayName?.substring(0, 2).toUpperCase() || "ME",
        gradient: user?.gradient || "linear-gradient(135deg, #f5c518, #e84545)",
        userAvatar: user?.avatarUrl || user?.avatar_url || null,
        role: user?.role || null,
        timeAgo: "Just now",
        content: content.trim(),
        isSpoiler: isSpoiler,
        is_owner: true, // User just created this post
        isOwner: true,
        created_by: user?.id,
        reactions: [
          { emoji: "👍", count: 0, reacted: false },
          { emoji: "❤️", count: 0, reacted: false },
          { emoji: "🔥", count: 0, reacted: false },
        ],
        commentCount: 0,
        shareCount: 0,
        attachedMovie: attachedMovie
          ? {
              title: attachedMovie.title,
              year: attachedMovie.year,
              rating: attachedMovie.rating || null,
            }
          : null,
        images: mediaUrl ? [mediaUrl] : [],
        mediaUrl: mediaUrl || null,
      };

      onPostCreated(newPost);
      onClose();
    } catch (err) {
      console.error("Error creating post:", err);
      setError(err.message || "Failed to share post.");
    } finally {
      setIsPosting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[rgba(8,8,16,0.92)] backdrop-blur-[12px] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[600px] bg-[#0d0d18] rounded-3xl border border-white/[0.1] overflow-hidden shadow-[0_32px_100px_rgba(0,0,0,0.8)] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-base"
              style={{
                background: community.avatarGradient || "linear-gradient(135deg, #3b82f6, #9b59b6)",
              }}
            >
              {community.avatarEmoji || "🎬"}
            </div>
            <div>
              <div className="font-[Outfit] text-[13px] font-bold text-[#f0f0f8]">New Post</div>
              <div className="font-[Outfit] text-[11px] text-[rgba(240,240,248,0.4)]">
                Posting in {community.name}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] border-none flex items-center justify-center cursor-pointer"
          >
            <X size={14} color="rgba(240,240,248,0.6)" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 flex gap-4">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center font-[Outfit] font-extrabold text-sm text-[#080810] shrink-0"
            style={{ background: user?.gradient || "linear-gradient(135deg, #f5c518, #e84545)" }}
          >
            {user?.initials || "JD"}
          </div>
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your cinematic mind?"
              rows={6}
              className="w-full bg-transparent border-none outline-none resize-none font-[Outfit] text-lg text-[#f0f0f8] p-0 leading-normal font-light caret-[#3b82f6]"
            />

            {/* Media URL Input */}
            {showMediaInput && (
              <div className="mt-3 p-3 bg-white/[0.03] border border-white/[0.08] rounded-lg">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="Paste image/video URL..."
                    className="flex-1 bg-transparent border-none outline-none font-[Outfit] text-[13px] text-[#f0f0f8] placeholder:text-[rgba(240,240,248,0.3)]"
                  />
                  {mediaUrl && (
                    <button
                      onClick={() => setMediaUrl("")}
                      className="p-1 rounded-full hover:bg-white/[0.08]"
                    >
                      <X size={14} color="rgba(240,240,248,0.5)" />
                    </button>
                  )}
                </div>
                {mediaUrl && (
                  <div className="mt-2 relative">
                    <img
                      src={mediaUrl}
                      alt="Preview"
                      className="max-h-[120px] rounded-lg object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                    <p className="hidden text-[11px] text-[rgba(240,240,248,0.4)] mt-1">
                      URL preview not available
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Movie Attachment - TASTEDIVE */}
            {attachedMovie ? (
              <div className="mt-3 flex items-center gap-2 bg-[#f5c518]/10 border border-[#f5c518]/30 rounded-xl p-3">
                <Film size={18} className="text-[#f5c518]" />
                <div className="flex-1">
                  <span className="font-[Outfit] text-sm font-bold text-[#f5c518]">
                    {attachedMovie.title}
                  </span>
                  {attachedMovie.year && (
                    <span className="font-[Outfit] text-xs text-[rgba(240,240,248,0.5)] ml-2">
                      ({attachedMovie.year})
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setAttachedMovie(null)}
                  className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <X size={14} className="text-white/60" />
                </button>
              </div>
            ) : (
              <div className="mt-3">
                <button
                  onClick={() => setShowMovieSearch(!showMovieSearch)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[rgba(240,240,248,0.6)] hover:text-[#f0f0f8] hover:bg-white/10 transition-all font-[Outfit] text-sm"
                >
                  <Film size={16} />
                  Tag a movie
                </button>

                {showMovieSearch && (
                  <div className="mt-2 bg-[#12121e] border border-white/10 rounded-xl p-3">
                    {/* Search Input */}
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
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 font-[Outfit] text-sm text-[#f0f0f8] placeholder-white/30 outline-none focus:border-[#3b82f6]"
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
                                setAttachedMovie(movie);
                                setShowMovieSearch(false);
                                setMovieSearchQuery("");
                              }}
                              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                            >
                              <span className="font-[Outfit] text-sm text-[#f0f0f8]">
                                {movie.title}
                              </span>
                              <span className="font-[Outfit] text-xs text-[rgba(240,240,248,0.4)]">
                                OMDb
                              </span>
                            </button>
                          ))
                        ) : isSearchingMovies ? null : (
                          <div className="text-center py-3">
                            <span className="font-[Outfit] text-xs text-[rgba(240,240,248,0.4)]">
                              No results found
                            </span>
                          </div>
                        )
                      ) : (
                        // Suggestions (no search query)
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-[Outfit] text-xs text-[rgba(240,240,248,0.5)]">
                              Suggestions for you
                            </span>
                            <button
                              onClick={fetchMovieSuggestions}
                              className="font-[Outfit] text-xs text-[#3b82f6] hover:underline"
                            >
                              Refresh
                            </button>
                          </div>
                          {movieSuggestions.length > 0 ? (
                            movieSuggestions.map((movie) => (
                              <button
                                key={movie.id}
                                onClick={() => {
                                  setAttachedMovie(movie);
                                  setShowMovieSearch(false);
                                  setMovieSearchQuery("");
                                }}
                                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                              >
                                <span className="font-[Outfit] text-sm text-[#f0f0f8]">
                                  {movie.title}
                                </span>
                                <span className="font-[Outfit] text-xs text-[rgba(240,240,248,0.4)]">
                                  ↻
                                </span>
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
                              setAttachedMovie({
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
                            <span className="font-[Outfit] text-sm text-[#3b82f6]">
                              Use "{movieSearchQuery}"
                            </span>
                          </button>
                        )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-4 bg-white/[0.02] border-t border-white/[0.04] flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setIsSpoiler(!isSpoiler)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full cursor-pointer transition-all duration-200 border ${
                isSpoiler
                  ? "bg-[rgba(232,69,69,0.1)] border-[rgba(232,69,69,0.3)]"
                  : "bg-transparent border-white/[0.1]"
              }`}
            >
              {isSpoiler ? (
                <Eye size={14} color="#e84545" />
              ) : (
                <EyeOff size={14} color="rgba(240,240,248,0.4)" />
              )}
              <span
                className={`font-[Outfit] text-xs font-semibold ${
                  isSpoiler ? "text-[#e84545]" : "text-[rgba(240,240,248,0.5)]"
                }`}
              >
                Spoiler
              </span>
            </button>
            <button
              onClick={() => setShowMediaInput(!showMediaInput)}
              className={`w-[38px] h-[38px] rounded-full border flex items-center justify-center transition-all duration-200 ${
                showMediaInput || mediaUrl
                  ? "bg-[#3b82f6]/[0.15] border-[#3b82f6]/[0.4] text-[#3b82f6]"
                  : "bg-transparent border-white/[0.1] text-[rgba(240,240,248,0.4)] hover:bg-white/[0.05]"
              }`}
              title={mediaUrl ? "Image added" : "Add Image URL"}
            >
              <ImageIcon size={16} />
            </button>
            <button
              onClick={() => setShowMovieSearch(!showMovieSearch)}
              className={`w-[38px] h-[38px] rounded-full border flex items-center justify-center transition-all duration-200 ${
                attachedMovie
                  ? "bg-[#f5c518]/[0.15] border-[#f5c518]/[0.4] text-[#f5c518]"
                  : "bg-transparent border-white/[0.1] text-[rgba(240,240,248,0.4)] hover:bg-white/[0.05]"
              }`}
              title={attachedMovie ? `Movie: ${attachedMovie.title}` : "Tag Movie"}
            >
              <Film size={16} />
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isPosting}
            className={`h-11 px-7 rounded-full border-none font-[Outfit] text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
              content.trim() && !isPosting
                ? "bg-[#3b82f6] text-white cursor-pointer shadow-[0_4px_16px_rgba(59,130,246,0.25)]"
                : "bg-white/[0.06] text-[rgba(240,240,248,0.3)] cursor-default"
            }`}
          >
            {isPosting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Posting...
              </>
            ) : (
              "Share Taking 🚀"
            )}
          </button>
        </div>

        {error && (
          <div className="px-5 py-2.5 bg-[rgba(232,69,69,0.1)] border-t border-[rgba(232,69,69,0.2)] text-[#e84545] text-xs font-[Outfit] text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
