// ─── Feed Posts ─────────────────────────────────────────────────────────────
export const FEED_POSTS = [
  {
    id: "p1",
    user: "DarkCinema_Zara",
    initials: "DZ",
    gradient: "linear-gradient(135deg, #e91e8c, #9b59b6)",
    role: "Moderator",
    community: "Sakura Collective",
    timeAgo: "2h ago",
    content:
      "Just rewatched Sakura Protocol for the third time and I genuinely think the final act gets better with every viewing. The way the director threads those early visual motifs back into the climax is absolutely masterful.",
    reactions: [
      { emoji: "👍", count: 342, reacted: false },
      { emoji: "❤️", count: 218, reacted: true },
      { emoji: "🔥", count: 156, reacted: false },
      { emoji: "😱", count: 87, reacted: false },
    ],
    comments: 48,
    shares: 23,
    saved: false,
    isSpoiler: false,
  },
  {
    id: "p2",
    user: "FilmScholar_Dix",
    initials: "FD",
    gradient: "linear-gradient(135deg, #4d91ff, #9b59b6)",
    role: undefined,
    community: "Void & Stars",
    timeAgo: "5h ago",
    content:
      "Controversial take: Nexus Rising is the most thematically ambitious sci-fi film since Arrival. The third act twist doesn't just recontextualise the plot — it recontextualises the entire emotional logic of every scene before it.",
    attachedMovie: {
      title: "Nexus Rising",
      year: 2025,
      rating: 8.4,
      genre: ["Sci-Fi", "Adventure"],
      image:
        "https://images.unsplash.com/photo-1727672887892-875dd6e6534b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    },
    reactions: [
      { emoji: "👍", count: 891, reacted: false },
      { emoji: "❤️", count: 104, reacted: false },
      { emoji: "🔥", count: 445, reacted: false },
      { emoji: "😱", count: 201, reacted: false },
    ],
    comments: 156,
    shares: 67,
    saved: false,
    isSpoiler: true,
  },
  {
    id: "p3",
    user: "ReelTalk_Juno",
    initials: "RJ",
    gradient: "linear-gradient(135deg, #2ecc71, #1abc9c)",
    role: undefined,
    community: "Dark Frame Society",
    timeAgo: "1d ago",
    content:
      "Hot take: Realm of Ash has better world-building in its first 20 minutes than most fantasy trilogies manage across three films. The production design team deserves every award being floated.",
    reactions: [
      { emoji: "👍", count: 1203, reacted: true },
      { emoji: "❤️", count: 342, reacted: false },
      { emoji: "🔥", count: 789, reacted: false },
      { emoji: "😂", count: 8, reacted: false },
    ],
    comments: 214,
    shares: 89,
    saved: true,
    isSpoiler: false,
  },
  {
    id: "p4",
    user: "CineVault_Alex",
    initials: "AX",
    gradient: "linear-gradient(135deg, #f5c518, #e84545)",
    role: undefined,
    community: "Sakura Collective",
    timeAgo: "2d ago",
    content:
      "Finished the Director's Cut of Echoes of Ether last night. The 40 extra minutes of backstory completely change the weight of the ending. If you only saw the theatrical cut — you haven't actually seen this film.",
    reactions: [
      { emoji: "👍", count: 567, reacted: false },
      { emoji: "❤️", count: 234, reacted: false },
      { emoji: "🔥", count: 312, reacted: false },
      { emoji: "😱", count: 445, reacted: false },
    ],
    comments: 98,
    shares: 41,
    saved: false,
    isSpoiler: false,
  },
];

// ─── Online Friends ─────────────────────────────────────────────────────────
export const ONLINE_FRIENDS = [
  { initials: "DZ", gradient: "linear-gradient(135deg, #e91e8c, #9b59b6)", online: true },
  { initials: "FD", gradient: "linear-gradient(135deg, #4d91ff, #9b59b6)", online: true },
  { initials: "RJ", gradient: "linear-gradient(135deg, #2ecc71, #1abc9c)", online: false },
  { initials: "AX", gradient: "linear-gradient(135deg, #f5c518, #e84545)", online: true },
  { initials: "NR", gradient: "linear-gradient(135deg, #e84545, #9b59b6)", online: false },
  { initials: "PM", gradient: "linear-gradient(135deg, #9b59b6, #2ecc71)", online: true },
];

// ─── Threads ───────────────────────────────────────────────────────────────
export const THREADS = [
  {
    id: "t1",
    name: "DarkCinema_Zara",
    initials: "DZ",
    gradient: "linear-gradient(135deg, #e91e8c, #9b59b6)",
    isGroup: false,
    lastMessage: "The Sakura Protocol finale was unreal. Did you see the final frame??",
    timeAgo: "2m",
    unread: 3,
    online: true,
  },
  {
    id: "t2",
    name: "Anime Nerds 🎌",
    initials: "AN",
    gradient: "linear-gradient(135deg, #f5c518, #e91e8c)",
    isGroup: true,
    lastMessage: "FilmScholar_Dix: New ranking thread just dropped btw",
    timeAgo: "14m",
    unread: 12,
    online: false,
  },
  {
    id: "t3",
    name: "FilmScholar_Dix",
    initials: "FD",
    gradient: "linear-gradient(135deg, #4d91ff, #9b59b6)",
    isGroup: false,
    lastMessage: "Agreed — Villeneuve has redefined what blockbuster sci-fi can be.",
    timeAgo: "1h",
    unread: 0,
    online: true,
  },
  {
    id: "t4",
    name: "ReelTalk_Juno",
    initials: "RJ",
    gradient: "linear-gradient(135deg, #2ecc71, #1abc9c)",
    isGroup: false,
    lastMessage: "Did you finish Echoes of Ether yet? I need to talk about that ending.",
    timeAgo: "3h",
    unread: 1,
    online: false,
  },
  {
    id: "t5",
    name: "Frolic Watch Party 🎬",
    initials: "FW",
    gradient: "linear-gradient(135deg, #f5c518, #e84545)",
    isGroup: true,
    lastMessage: "CineVault_Alex: Everyone ready for Saturday? 9PM sharp!",
    timeAgo: "5h",
    unread: 0,
    online: false,
  },
  {
    id: "t6",
    name: "NightOwl_Remy",
    initials: "NR",
    gradient: "linear-gradient(135deg, #e84545, #9b59b6)",
    isGroup: false,
    lastMessage: "That horror list you sent was 🔥 Adding three of them this week.",
    timeAgo: "1d",
    unread: 0,
    online: false,
  },
];

// ─── Thread Messages ───────────────────────────────────────────────────────
export const THREAD_MESSAGES = {
  t1: [
    {
      id: "m1",
      from: "them",
      content:
        "okay so I FINALLY watched Sakura Protocol last night and I genuinely don't know how to process what I just experienced",
      timeAgo: "Yesterday 9:14 PM",
    },
    {
      id: "m2",
      from: "me",
      content:
        "I told you!! the final 20 minutes is unlike anything I've ever seen in an anime film. pure cinema.",
      timeAgo: "Yesterday 9:16 PM",
    },
    {
      id: "m3",
      from: "them",
      content:
        "The way the colour palette shifts from warm gold to cold blue as she crosses into the void — the director is operating on a completely different level",
      timeAgo: "Yesterday 9:19 PM",
      attachedMovie: "Sakura Protocol (2025) · 9.3 ★",
    },
    {
      id: "m4",
      from: "me",
      content: "have you posted your review yet? I'd love to upvote it",
      timeAgo: "Yesterday 9:21 PM",
    },
    {
      id: "m5",
      from: "them",
      content: "The Sakura Protocol finale was unreal. Did you see the final frame??",
      timeAgo: "2m ago",
    },
  ],
  t3: [
    {
      id: "m1",
      from: "them",
      content: "Thoughts on Villeneuve after Nexus Rising? Feels like his best work since Arrival.",
      timeAgo: "2h ago",
    },
    {
      id: "m2",
      from: "me",
      content:
        "Completely agree. The restraint he shows in the first two acts makes the third hit so much harder.",
      timeAgo: "1h 45m ago",
    },
    {
      id: "m3",
      from: "them",
      content: "Agreed — Villeneuve has redefined what blockbuster sci-fi can be.",
      timeAgo: "1h ago",
    },
  ],
};

// ─── Live Rooms ────────────────────────────────────────────────────────────
export const LIVE_ROOMS = [
  {
    id: "r1",
    topic: "Sakura Protocol — Final Battle Breakdown",
    viewers: "2.4k",
    backdrop:
      "https://images.unsplash.com/photo-1769321790929-17a20c565ead?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    hosts: ["DZ", "AM", "TK"],
    tags: ["Anime", "Live Analysis"],
  },
  {
    id: "r2",
    topic: "Nexus Rising Deep Dive — Sci-Fi Theory Podcast",
    viewers: "1.1k",
    backdrop:
      "https://images.unsplash.com/photo-1727672887892-875dd6e6534b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    hosts: ["FD", "RJ"],
    tags: ["Sci-Fi", "Podcast"],
  },
  {
    id: "r3",
    topic: "Weekly Watch Party — Realm of Ash",
    viewers: "847",
    backdrop:
      "https://images.unsplash.com/photo-1639986587553-1d994ffc66d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    hosts: ["AX", "PM"],
    tags: ["Fantasy", "Watch Party"],
  },
];

// ─── Communities ───────────────────────────────────────────────────────────
export const COMMUNITIES_DATA = [
  {
    id: "c1",
    name: "Sakura Collective",
    emoji: "⛩️",
    gradient: "linear-gradient(135deg, #f5c518, #e91e8c)",
    members: "84.2k",
    postsToday: 512,
    joined: true,
    isTrending: true,
  },
  {
    id: "c2",
    name: "Void & Stars",
    emoji: "🚀",
    gradient: "linear-gradient(135deg, #4d91ff, #9b59b6)",
    members: "61.8k",
    postsToday: 287,
    joined: false,
    isTrending: true,
  },
  {
    id: "c3",
    name: "Dark Frame Society",
    emoji: "🌙",
    gradient: "linear-gradient(135deg, #e84545, #9b59b6)",
    members: "38.9k",
    postsToday: 194,
    joined: true,
    isTrending: false,
  },
  {
    id: "c4",
    name: "Anime Critics Guild",
    emoji: "🎌",
    gradient: "linear-gradient(135deg, #f5c518, #2ecc71)",
    members: "22.3k",
    postsToday: 88,
    joined: false,
    isTrending: false,
  },
];
