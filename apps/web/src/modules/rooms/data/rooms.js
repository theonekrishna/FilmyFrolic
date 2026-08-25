export const LIVE_ROOMS = [
  {
    id: "r1",
    topic: "Sakura Protocol — Final Battle Breakdown",
    description:
      "Breaking down every frame of the legendary final battle sequence. Animation deep-dive with industry insiders.",
    backdrop:
      "https://images.unsplash.com/photo-1769321790929-17a20c565ead?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    viewers: "2.4k",
    hostAvatars: [
      { initials: "DZ", gradient: "linear-gradient(135deg, #e91e8c, #9b59b6)" },
      { initials: "AM", gradient: "linear-gradient(135deg, #f5c518, #e84545)" },
      { initials: "TK", gradient: "linear-gradient(135deg, #4d91ff, #2ecc71)" },
    ],
    extraHosts: 8,
    movie: "Sakura Protocol",
    tags: ["Anime", "Analysis"],
  },
  {
    id: "r2",
    topic: "Nexus Rising — Universe Lore Deep Dive",
    description:
      "Exploring all the hidden lore, Easter eggs, and connections to the wider Nexus universe that most viewers missed.",
    backdrop:
      "https://images.unsplash.com/photo-1727672887892-875dd6e6534b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    viewers: "1.1k",
    hostAvatars: [
      { initials: "FD", gradient: "linear-gradient(135deg, #4d91ff, #9b59b6)" },
      { initials: "RJ", gradient: "linear-gradient(135deg, #2ecc71, #1abc9c)" },
    ],
    extraHosts: 4,
    movie: "Nexus Rising",
    tags: ["Sci-Fi", "Lore"],
  },
  {
    id: "r3",
    topic: "Crimson Veil — Horror Dissection",
    description:
      "A psychological horror breakdown — symbolism, director intent, and the chilling ending explained.",
    backdrop:
      "https://images.unsplash.com/photo-1639986587553-1d994ffc66d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    viewers: "843",
    hostAvatars: [{ initials: "NR", gradient: "linear-gradient(135deg, #e84545, #1a0a0a)" }],
    extraHosts: 2,
    movie: "Crimson Veil",
    tags: ["Horror", "Spoilers"],
  },
];

export const SCHEDULED_ROOMS = [
  {
    id: "s1",
    title: "Realm of Ash — Community Watch",
    movie: "Realm of Ash",
    backdrop:
      "https://images.unsplash.com/photo-1767709879762-c7a6ce819aeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    scheduledAt: "Tonight, 9:00 PM",
    rsvpCount: 1240,
    host: {
      initials: "PM",
      name: "PixelFrame_Maya",
      gradient: "linear-gradient(135deg, #9b59b6, #2ecc71)",
    },
    tags: ["Fantasy", "Watch Party"],
  },
  {
    id: "s2",
    title: "Wild Chronicles — Documentary Night",
    movie: "Wild Chronicles",
    backdrop:
      "https://images.unsplash.com/photo-1703953788556-15e1dc3ebb32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    scheduledAt: "Tomorrow, 7:30 PM",
    rsvpCount: 387,
    host: {
      initials: "CX",
      name: "CinemaXpert",
      gradient: "linear-gradient(135deg, #2ecc71, #1abc9c)",
    },
    tags: ["Documentary", "Discussion"],
  },
  {
    id: "s3",
    title: "Frolic Originals Premiere Night",
    movie: "Neon Depths",
    backdrop:
      "https://images.unsplash.com/photo-1561722798-9a732d141027?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    scheduledAt: "Sat, Mar 14 • Midnight",
    rsvpCount: 5102,
    host: {
      initials: "FF",
      name: "Filmy Frolic",
      gradient: "linear-gradient(135deg, #f5c518, #e84545)",
    },
    tags: ["Original", "Premiere", "Exclusive"],
  },
];

export const WATCH_PARTIES = [
  {
    id: "w1",
    title: "Obsidian Protocol Rewatch",
    movie: "The Obsidian Protocol",
    backdrop:
      "https://images.unsplash.com/photo-1758410473735-c76baff30a79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    platform: "Netflix",
    platformColor: "#e50914",
    viewers: "312",
    syncStatus: "Synced • 1h 14m in",
    host: {
      initials: "AX",
      name: "CineVault_Alex",
      gradient: "linear-gradient(135deg, #f5c518, #e84545)",
    },
    progress: 62,
    duration: "2h 18m",
  },
  {
    id: "w2",
    title: "Echoes of Ether — Calm Night Watch",
    movie: "Echoes of Ether",
    backdrop:
      "https://images.unsplash.com/photo-1727672887892-875dd6e6534b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    platform: "Prime Video",
    platformColor: "#00a8e0",
    viewers: "78",
    syncStatus: "Synced • 48m in",
    host: {
      initials: "RJ",
      name: "ReelTalk_Juno",
      gradient: "linear-gradient(135deg, #4d91ff, #9b59b6)",
    },
    progress: 38,
    duration: "2h 5m",
  },
];

// ─── Host Room Modal ──────────────────────────────────────────────────────────

export const ROOM_TYPES = [
  {
    id: "watch_party",
    label: "🎬 Watch Party",
    desc: "Stream a film together in sync",
  },
  { id: "voice_room", label: "🎙️ Voice Room", desc: "Live audio discussion" },
  {
    id: "discussion",
    label: "💬 Discussion",
    desc: "Text-based watch-along chat",
  },
  {
    id: "video_room",
    label: "🎥 Video Room",
    desc: "Live video discussion (beta)",
  },
];

export const PRIVACY_OPTS = [
  { id: "public", label: "🌐 Public", desc: "Anyone can join" },
  { id: "friends_only", label: "👥 Friends Only", desc: "Only your followers" },
  { id: "invite_only", label: "📨 Invite Only", desc: "Invite link required" },
];

export const MOVIE_SUGGESTIONS = [
  "Realm of Ash",
  "Sakura Protocol",
  "Nexus Rising",
  "Ghost Frequency",
  "The Obsidian Protocol",
  "Echoes of Ether",
];

//tag colours
export const TAG_COLORS = {
  Anime: "#f5c518",
  "Sci-Fi": "#4d91ff",
  Horror: "#e84545",
  Fantasy: "#9b59b6",
  Analysis: "#4d91ff",
  Lore: "#1abc9c",
  Spoilers: "#e84545",
  Documentary: "#2ecc71",
  Discussion: "#3b82f6",
  "Watch Party": "#7c5cfc",
  Original: "#f5c518",
  Premiere: "#f5c518",
  Exclusive: "#e84545",
};
