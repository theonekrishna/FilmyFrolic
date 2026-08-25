export const FILTERS = [
  { value: "all", label: "All" },
  { value: "movies", label: "Movies" },
  { value: "series", label: "Series" },
];

// Mock "recently searched" and trending searches — no live endpoint for these yet
export const RECENT_SEARCHES = ["Sakura Protocol", "Obsidian Protocol", "Sci-Fi 2025"];
export const TRENDING_SEARCHES = [
  { q: "Best Anime 2025", count: "142k" },
  { q: "Top Thriller films", count: "89k" },
  { q: "Nexus Rising cast", count: "67k" },
  { q: "Award winners 2024", count: "54k" },
];

// NOTE: GENRE_SECTIONS and FEATURED_MOVIE used to be derived from the static
// MOVIES array. The live API has no genre field, so genre sections are now
// computed at runtime in Archive.jsx (and will simply be empty until the
// backend adds genre data). FEATURED_MOVIE is now just the highest-rated
// movie from the live fetched list, also computed in Archive.jsx.

// ── archive item detail data (still static — no live endpoint for these) ──

export const CAST_BY_MOVIE = {
  1: [
    { name: "Mara Solano", role: "Agent Lena Cross", initials: "MS" },
    { name: "Dirk Mayer", role: "Director Halversen", initials: "DM" },
    { name: "Yuki Tamori", role: "Commander Nao", initials: "YT" },
    { name: "Chris Elliot", role: "The Handler", initials: "CE" },
    { name: "Sofia Reyes", role: "Asset Kira", initials: "SR" },
    { name: "Paul Winters", role: "Chief Alcott", initials: "PW" },
  ],
  9: [
    { name: "Aoi Nakamura", role: "Kaede (lead pilot)", initials: "AN" },
    { name: "Ryo Tanaka", role: "Commander Haruto", initials: "RT" },
    { name: "Mei Lin", role: "Engineer Suki", initials: "ML" },
    { name: "Shin Watanabe", role: "General Ozawa", initials: "SW" },
    { name: "Yuki Harada", role: "Rebel Leader Rin", initials: "YH" },
    { name: "Kenji Mori", role: "The Oracle", initials: "KM" },
  ],
  5: [
    { name: "Elia Stone", role: "Kael the Chosen", initials: "ES" },
    { name: "Dax Morrow", role: "King Aldric", initials: "DX" },
    { name: "Vera Okafor", role: "Sorceress Mira", initials: "VO" },
    { name: "Finn Ashwood", role: "Theron", initials: "FA" },
    { name: "Lena Voss", role: "Oracle of Ash", initials: "LV" },
    { name: "Omar Kassel", role: "Warlord Draken", initials: "OK" },
  ],
};

export const TRIVIA_BY_MOVIE = {
  1: [
    "The opening chase sequence was filmed in a single 11-minute take across three city blocks.",
    "Director Ana Kovacs spent six months embedded with a real intelligence agency to research the script.",
    "The film's signature blue colour grading was inspired by 1970s Cold War spy photography.",
    "All fight choreography was performed by the lead actress with no stunt doubles.",
    "The film's score was composed entirely on analog synthesisers from the 1980s.",
  ],
  9: [
    "Sakura Protocol was produced over five years with a crew of 400+ animators.",
    "The final battle sequence contains over 24,000 individual hand-drawn frames.",
    "Director Kenji Mori has stated the film is a direct spiritual sequel to 1984's Nausicaä.",
    "The film's soundtrack spent 12 consecutive weeks at the top of the Japan Oricon chart.",
    "Every mech design in the film was inspired by traditional Japanese woodblock print aesthetics.",
  ],
};

export const COMMUNITY_POSTS = [
  {
    user: "DarkCinema_Zara",
    initials: "DZ",
    gradient: "linear-gradient(135deg,#e91e8c,#9b59b6)",
    content:
      "Third rewatch and I'm still finding new details in the background. The director is a genius.",
    time: "2h ago",
    reactions: 342,
  },
  {
    user: "FilmScholar_Dix",
    initials: "FD",
    gradient: "linear-gradient(135deg,#4d91ff,#9b59b6)",
    content:
      "The thematic parallels between the first and last scene are extraordinary. A masterclass in visual storytelling.",
    time: "5h ago",
    reactions: 891,
  },
  {
    user: "ReelTalk_Juno",
    initials: "RJ",
    gradient: "linear-gradient(135deg,#2ecc71,#1abc9c)",
    content:
      "Watched this with my whole family and we all had completely different interpretations.",
    time: "1d ago",
    reactions: 1203,
  },
];

export const PLATFORMS = [
  { name: "Netflix", color: "#e50914", bg: "rgba(229,9,20,0.12)" },
  { name: "Prime", color: "#00a8e0", bg: "rgba(0,168,224,0.12)" },
  { name: "Hotstar", color: "#1a6bc8", bg: "rgba(26,107,200,0.12)" },
];

export const TAGLINES = {
  Anime: "The revolution begins with one pilot.",
  Fantasy: "The last light stands against eternal darkness.",
  "Sci-Fi": "Beyond the edge of the known universe.",
  Thriller: "Some truths are worth dying for.",
  Action: "Every second counts. Every choice is final.",
  Documentary: "The world as you've never seen it.",
};

export const TABS = [
  { value: "overview", label: "Overview" },
  { value: "cast", label: "Cast" },
  { value: "trailers", label: "Trailers" },
  { value: "reviews", label: "Reviews" },
  { value: "awards", label: "Awards" },
  { value: "story", label: "Story" },
  { value: "collection", label: "Collection" },
  { value: "ott", label: "Where to Watch" },
];

export const ACTOR_GRADS = [
  "linear-gradient(135deg,#f5c518,#e84545)",
  "linear-gradient(135deg,#3b82f6,#7c5cfc)",
  "linear-gradient(135deg,#1fd1a8,#3b82f6)",
  "linear-gradient(135deg,#e84545,#7c5cfc)",
];
