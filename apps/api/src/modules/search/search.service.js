const axios = require("axios");
const { supabase } = require("../../configs/supabase");
const tmdbService = require("../tmdb/tmdb.service");

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY || "84b706f97f7481283d5a499a0937a09d";

const globalSearch = async (query) => {
  if (!query || !query.trim()) {
    return [];
  }

  const cleanQuery = query.trim().replace(/^#/, "");
  const isHashtagSearch = query.startsWith("#");

  const [tmdbMoviesRes, tmdbPeopleRes, usersRes, communitiesRes] = await Promise.allSettled([
    // 1. TMDB Movies & TV Shows
    tmdbService.searchMovies(cleanQuery, 1),

    // 2. TMDB Cast & Crew People
    axios
      .get(`${TMDB_BASE_URL}/search/person`, {
        params: { api_key: TMDB_API_KEY, query: cleanQuery },
        timeout: 3000,
      })
      .then((res) => res.data?.results || [])
      .catch(() => []),

    // 3. Registered Platform Users
    supabase
      .from("profiles")
      .select("id, username, display_name, name, avatar_url")
      .or(
        `username.ilike.%${cleanQuery}%,display_name.ilike.%${cleanQuery}%,name.ilike.%${cleanQuery}%`
      )
      .limit(5),

    // 4. Platform Communities
    supabase
      .from("communities")
      .select("id, name, description, avatar_url, icon, members_count")
      .or(`name.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`)
      .limit(5),
  ]);

  const results = [];

  // Hashtags (if user typed # or keyword)
  if (isHashtagSearch || cleanQuery.length > 2) {
    results.push({
      id: `tag-${cleanQuery.toLowerCase()}`,
      type: "hashtag",
      title: `#${cleanQuery.toLowerCase()}`,
      subtitle: "Hashtag · View posts & discussions",
      link: `/social/feed?tag=${encodeURIComponent(cleanQuery.toLowerCase())}`,
    });
  }

  // 1. Process Movies & Shows
  if (tmdbMoviesRes.status === "fulfilled" && tmdbMoviesRes.value?.results) {
    const movieItems = tmdbMoviesRes.value.results.slice(0, 5).map((m) => {
      const isShow = m.type === "Series" || m.first_air_date;
      return {
        id: String(m.id),
        type: isShow ? "show" : "movie",
        title: m.title || m.name,
        subtitle: `${m.year || "2024"} · ${m.genres?.[0] || (isShow ? "Series" : "Movie")}`,
        rating: m.rating ? Number(m.rating) : undefined,
        image: m.poster_url || m.image || null,
        link: `/content/movie/${m.id}`,
      };
    });
    results.push(...movieItems);
  }

  // 2. Process Users (People on FilmyFrolic)
  if (usersRes.status === "fulfilled" && usersRes.value?.data) {
    const userItems = usersRes.value.data.map((u) => ({
      id: u.id,
      type: "user",
      title: u.display_name || u.name || u.username,
      subtitle: `@${u.username || "user"} · Member`,
      image: u.avatar_url || null,
      link: `/user/profile?id=${u.id}`,
    }));
    results.push(...userItems);
  }

  // 3. Process Communities
  if (communitiesRes.status === "fulfilled" && communitiesRes.value?.data) {
    const communityItems = communitiesRes.value.data.map((c) => ({
      id: c.id,
      type: "community",
      title: c.name,
      subtitle: `Community · ${c.members_count || 0} members`,
      image: c.avatar_url || c.icon || null,
      link: `/social/communities/${c.id}`,
    }));
    results.push(...communityItems);
  }

  // 4. Process TMDB Cast & Crew People
  if (tmdbPeopleRes.status === "fulfilled" && Array.isArray(tmdbPeopleRes.value)) {
    const peopleItems = tmdbPeopleRes.value.slice(0, 4).map((p) => {
      const knownFor = p.known_for?.[0]?.title || p.known_for_department || "Actor";
      const profilePhoto = p.profile_path
        ? `https://image.tmdb.org/t/p/w185${p.profile_path}`
        : null;
      return {
        id: `person-${p.id}`,
        type: "actor",
        title: p.name,
        subtitle: `Actor / Crew · Known for ${knownFor}`,
        image: profilePhoto,
        link: `/content/archive?search=${encodeURIComponent(p.name)}`,
      };
    });
    results.push(...peopleItems);
  }

  return results;
};

module.exports = {
  globalSearch,
};
