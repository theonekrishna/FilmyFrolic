const ACCENT = "#3b82f6";

export const COMMUNITIES = [
  {
    id: "c1",
    name: "Sakura Collective",
    description:
      "The definitive home for anime film fans. From Ghibli classics to cutting-edge seasonal cinema — deep-dive analysis and weekly watch-alongs.",
    banner:
      "https://images.unsplash.com/photo-1769321790929-17a20c565ead?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    avatarEmoji: "⛩️",
    avatarGradient: "linear-gradient(135deg, #f5c518, #e91e8c)",
    members: "84.2k",
    postsToday: 512,
    genres: ["Anime", "Action"],
    joined: true,
    category: "Anime",
    isTrending: true,
  },
  {
    id: "c2",
    name: "Void & Stars",
    description:
      "Science fiction enthusiasts gathering to discuss everything from Kubrick to Villeneuve. Hard sci-fi, space opera, cyberpunk — if it's set in the future, we love it.",
    banner:
      "https://images.unsplash.com/photo-1727672887892-875dd6e6534b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    avatarEmoji: "🚀",
    avatarGradient: "linear-gradient(135deg, #4d91ff, #9b59b6)",
    members: "61.8k",
    postsToday: 287,
    genres: ["Sci-Fi", "Thriller"],
    joined: false,
    category: "Sci-Fi",
    isTrending: true,
  },
  {
    id: "c3",
    name: "Dark Frame Society",
    description:
      "Where horror and psychological thriller fans come to dissect their fears. Weekly film essays, director spotlights, and curated scream-worthy watchlists.",
    banner:
      "https://images.unsplash.com/photo-1639986587553-1d994ffc66d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    avatarEmoji: "👻",
    avatarGradient: "linear-gradient(135deg, #e84545, #1a0a0a)",
    members: "43.1k",
    postsToday: 198,
    genres: ["Horror", "Thriller"],
    joined: true,
    category: "Horror",
  },
  {
    id: "c4",
    name: "Epic Realms",
    description:
      "Fantasy and adventure cinema's biggest fan hub. From Lord of the Rings retrospectives to the latest sword-and-sorcery releases.",
    banner:
      "https://images.unsplash.com/photo-1767709879762-c7a6ce819aeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    avatarEmoji: "🐉",
    avatarGradient: "linear-gradient(135deg, #9b59b6, #2ecc71)",
    members: "37.4k",
    postsToday: 143,
    genres: ["Fantasy", "Adventure"],
    joined: false,
    category: "Fantasy",
    isNew: true,
  },
  {
    id: "c5",
    name: "Wild Lens Collective",
    description:
      "Documentary lovers sharing the films that changed how they see the world. Nature, politics, art, crime — the unscripted truth is stranger than fiction.",
    banner:
      "https://images.unsplash.com/photo-1703953788556-15e1dc3ebb32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    avatarEmoji: "🎙️",
    avatarGradient: "linear-gradient(135deg, #2ecc71, #1abc9c)",
    members: "22.9k",
    postsToday: 89,
    genres: ["Documentary"],
    joined: false,
    category: "Documentary",
    isNew: true,
  },
  {
    id: "c6",
    name: "Midnight Theatre",
    description:
      "Late night cinema appreciation club. Cult classics, midnight movies, grindhouse — everything the mainstream overlooks. Weird is wonderful here.",
    banner:
      "https://images.unsplash.com/photo-1561722798-9a732d141027?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    avatarEmoji: "🌙",
    avatarGradient: "linear-gradient(135deg, #f5c518, #e84545)",
    members: "18.3k",
    postsToday: 67,
    genres: ["Drama", "Comedy"],
    joined: true,
    category: "Cult",
  },
];

export const LIVE_ROOMS = [
  { id: "lr1", name: "Sakura Protocol Live Rewatch", viewers: "2.4k", accent: ACCENT },
  { id: "lr2", name: "Horror Deep Dive — Crimson Veil", viewers: "1.1k", accent: "#e84545" },
  { id: "lr3", name: "Sci-Fi Sunday: Nexus Rising Q&A", viewers: "843", accent: "#9b59b6" },
];

export const SUGGESTED = [
  {
    id: "s1",
    name: "Frolic Originals Fan Club",
    members: "14.2k",
    emoji: "🎬",
    gradient: "linear-gradient(135deg, #f5c518, #e84545)",
  },
  {
    id: "s2",
    name: "Korean Cinema Hub",
    members: "9.8k",
    emoji: "🇰🇷",
    gradient: "linear-gradient(135deg, #e84545, #9b59b6)",
  },
  {
    id: "s3",
    name: "Award Season Watchers",
    members: "6.1k",
    emoji: "🏆",
    gradient: "linear-gradient(135deg, #f5c518, #2ecc71)",
  },
];

export const GENRE_COLORS = {
  Anime: "#f5c518",
  "Sci-Fi": "#4d91ff",
  Horror: "#e84545",
  Fantasy: "#9b59b6",
  Adventure: "#2ecc71",
  Documentary: "#1abc9c",
  Drama: "#95a5a6",
  Comedy: "#f39c12",
  Thriller: "#1fd1a8",
};

export const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "mine", label: "Mine" },
  { value: "trending", label: "Trending" },
  { value: "genre", label: "Genre" },
  { value: "new", label: "New" },
];

export const ALL_GENRES_LIST = [
  "Anime",
  "Sci-Fi",
  "Horror",
  "Fantasy",
  "Drama",
  "Comedy",
  "Action",
  "Thriller",
  "Romance",
  "Documentary",
];

export const PRIVACY_OPTIONS = [
  { value: "public", label: "🌐 Public", desc: "Anyone can join and post" },
  { value: "private", label: "🔒 Private", desc: "Members must be approved" },
  { value: "invite", label: "📨 Invite Only", desc: "Only invited members can join" },
];

export const COMMUNITY_POSTS = [
  {
    id: "cp1",
    user: "DarkCinema_Zara",
    initials: "DZ",
    gradient: "linear-gradient(135deg,#e91e8c,#9b59b6)",
    timeAgo: "1h ago",
    content:
      "Just rewatched the opening sequence three times. The cinematography is next level. Anyone else notice the hidden symbolism in the colour grading?",
    reactions: 142,
    comments: 28,
  },
  {
    id: "cp2",
    user: "FilmScholar_Dix",
    initials: "FD",
    gradient: "linear-gradient(135deg,#4d91ff,#9b59b6)",
    timeAgo: "3h ago",
    content:
      "Weekly discussion thread: Rate your top 5 films of this genre and tell us why. I'll start: 1. The original... 2. The sequel that nobody asked for but was actually great...",
    reactions: 89,
    comments: 63,
  },
  {
    id: "cp3",
    user: "CineVault_Alex",
    initials: "AX",
    gradient: "linear-gradient(135deg,#f5c518,#e84545)",
    timeAgo: "6h ago",
    content:
      "WATCH PARTY TONIGHT at 9PM GMT — we're covering the director's cut. Link in bio. Bring your hottest takes!",
    reactions: 234,
    comments: 91,
  },
];

export const COMMUNITY_MEMBERS = [
  {
    id: "m1",
    name: "DarkCinema_Zara",
    initials: "DZ",
    gradient: "linear-gradient(135deg,#e91e8c,#9b59b6)",
    role: "Admin",
    joined: "Jan 2024",
  },
  {
    id: "m2",
    name: "FilmScholar_Dix",
    initials: "FD",
    gradient: "linear-gradient(135deg,#4d91ff,#9b59b6)",
    role: "Moderator",
    joined: "Feb 2024",
  },
  {
    id: "m3",
    name: "CineVault_Alex",
    initials: "AX",
    gradient: "linear-gradient(135deg,#f5c518,#e84545)",
    role: "Member",
    joined: "Mar 2024",
  },
  {
    id: "m4",
    name: "ReelTalk_Juno",
    initials: "RJ",
    gradient: "linear-gradient(135deg,#2ecc71,#1abc9c)",
    role: "Member",
    joined: "Mar 2024",
  },
  {
    id: "m5",
    name: "PixelFrame_Maya",
    initials: "PM",
    gradient: "linear-gradient(135deg,#9b59b6,#2ecc71)",
    role: "Member",
    joined: "Apr 2024",
  },
];

export const COMMUNITY_RULES = [
  {
    num: 1,
    title: "Be respectful",
    desc: "Treat every member with kindness. No personal attacks or hate speech.",
  },
  {
    num: 2,
    title: "No spoilers",
    desc: "Always use the spoiler tag when discussing plot points from recent releases.",
  },
  {
    num: 3,
    title: "Stay on topic",
    desc: "Keep posts relevant to the community's genre and theme.",
  },
  {
    num: 4,
    title: "No spam or ads",
    desc: "Self-promotion and advertising are not permitted without moderator approval.",
  },
  {
    num: 5,
    title: "Cite your sources",
    desc: "When sharing news or facts, link to reputable sources.",
  },
];

export const MEDIA_IMAGES = [
  "https://images.unsplash.com/photo-1761499930744-1d689014c9a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  "https://images.unsplash.com/photo-1740365009001-def910f5ed75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  "https://images.unsplash.com/photo-1730563756005-9b379b0512ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
];
