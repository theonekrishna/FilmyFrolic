import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SearchBar({ posts, communities }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(false);
  const [results, setResults] = useState({ posts: [], communities: [], users: [] });
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActive(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function performSearch(searchQuery) {
    if (!searchQuery.trim()) {
      setResults({ posts: [], communities: [], users: [] });
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();

    // Search posts
    const matchedPosts = posts.filter(
      (post) =>
        post.content?.toLowerCase().includes(lowerQuery) ||
        post.user?.toLowerCase().includes(lowerQuery)
    );

    // Search communities
    const matchedCommunities = communities.filter((comm) =>
      comm.name?.toLowerCase().includes(lowerQuery)
    );

    // Search users (extract unique users from posts)
    const uniqueUsers = new Map();
    posts.forEach((post) => {
      if (post.userId && !uniqueUsers.has(post.userId)) {
        if (post.user?.toLowerCase().includes(lowerQuery)) {
          uniqueUsers.set(post.userId, {
            id: post.userId,
            name: post.user,
            avatarUrl: post.avatarUrl,
            gradient: post.gradient,
            initials: post.initials,
          });
        }
      }
    });

    setResults({
      posts: matchedPosts.slice(0, 5),
      communities: matchedCommunities.slice(0, 5),
      users: Array.from(uniqueUsers.values()).slice(0, 5),
    });
  }

  function clearSearch() {
    setQuery("");
    setActive(false);
    setResults({ posts: [], communities: [], users: [] });
  }

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value);
    setActive(true);
    performSearch(value);
  }

  const hasResults =
    results.users.length > 0 || results.communities.length > 0 || results.posts.length > 0;

  return (
    <div ref={containerRef} className="relative">
      {/* Search Input */}
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
        <Search size={16} className="text-white/40 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search posts, users, communities..."
          value={query}
          onChange={handleChange}
          onFocus={() => setActive(true)}
          className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-white/40 font-['Outfit']"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={14} className="text-white/50" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {active && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#12121e] border border-white/10 rounded-xl shadow-xl max-h-[70vh] overflow-y-auto z-50">
          {/* Users Section */}
          {results.users.length > 0 && (
            <div className="p-3 border-b border-white/5">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2 font-['Outfit']">
                Users
              </p>
              {results.users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 rounded-lg opacity-70"
                  title="User profile view not available"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: user.gradient }}
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      user.initials
                    )}
                  </div>
                  <span className="text-sm text-white font-medium font-['Outfit'] truncate">
                    {user.name}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Communities Section */}
          {results.communities.length > 0 && (
            <div className="p-3 border-b border-white/5">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2 font-['Outfit']">
                Communities
              </p>
              {results.communities.map((comm) => (
                <div
                  key={comm.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => {
                    clearSearch();
                    navigate(`/social/communities/${comm.id}`);
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{
                      background: comm.gradient || "linear-gradient(135deg, #3b82f6, #9b59b6)",
                    }}
                  >
                    {comm.emoji || "🎬"}
                  </div>
                  <span className="text-sm text-white font-medium font-['Outfit'] truncate">
                    {comm.name}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Posts Section */}
          {results.posts.length > 0 && (
            <div className="p-3">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2 font-['Outfit']">
                Posts
              </p>
              {results.posts.map((post) => (
                <div
                  key={post.id}
                  className="p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => {
                    clearSearch();
                    navigate(`/social/feed/post/${post.id}`);
                  }}
                >
                  <p className="text-sm text-white/80 font-['Outfit'] line-clamp-2">
                    {post.content}
                  </p>
                  <p className="text-xs text-white/40 font-['Outfit'] mt-1">by {post.user}</p>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!hasResults && (
            <div className="p-6 text-center">
              <p className="text-sm text-white/50 font-['Outfit']">No results found</p>
              <p className="text-xs text-white/30 font-['Outfit'] mt-1">
                Try a different search term
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
