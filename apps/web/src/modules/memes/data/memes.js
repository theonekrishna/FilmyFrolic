//    data
export const MEMES = [
  {
    id: "m1",
    title: "Me explaining why Realm of Ash deserves every award vs. the Academy",
    image:
      "https://images.unsplash.com/photo-1767709879762-c7a6ce819aeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    movieRef: "Realm of Ash",
    upvotes: 14230,
    comments: 892,
    timeAgo: "2h ago",
    author: {
      initials: "AX",
      gradient: "linear-gradient(135deg,#f5c518,#e84545)",
      name: "CineVault_Alex",
    },
    tags: ["Realm of Ash", "Awards Season", "Fantasy"],
    format: "image",
    trending: true,
  },
  {
    id: "m2",
    title: "The Sakura Protocol final 20 minutes be like:",
    image:
      "https://images.unsplash.com/photo-1730563756005-9b379b0512ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    movieRef: "Sakura Protocol",
    upvotes: 9841,
    comments: 543,
    timeAgo: "4h ago",
    author: {
      initials: "DZ",
      gradient: "linear-gradient(135deg,#e91e8c,#9b59b6)",
      name: "DarkCinema_Zara",
    },
    tags: ["Sakura Protocol", "Anime", "Emotional Damage"],
    format: "image",
    trending: true,
  },
  {
    id: "m3",
    title: "Nexus Rising fans when someone calls it 'just a sci-fi movie'",
    image: null,
    movieRef: "Nexus Rising",
    upvotes: 7203,
    comments: 341,
    timeAgo: "6h ago",
    author: {
      initials: "FD",
      gradient: "linear-gradient(135deg,#4d91ff,#9b59b6)",
      name: "FilmScholar_Dix",
    },
    tags: ["Nexus Rising", "Sci-Fi", "Fandom"],
    format: "text",
    textContent:
      "Sci-fi fans: writes 4,000-word essay comparing Nexus Rising to Arrival, Stalker, and Solaris\n\nRandom person on Twitter: 'it's just a space movie'",
    trending: false,
  },
  {
    id: "m4",
    title: "Me at the start vs. end of Ghost Frequency",
    image:
      "https://images.unsplash.com/photo-1639986587553-1d994ffc66d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    movieRef: "Ghost Frequency",
    upvotes: 5892,
    comments: 218,
    timeAgo: "9h ago",
    author: {
      initials: "NR",
      gradient: "linear-gradient(135deg,#e84545,#9b59b6)",
      name: "NightOwl_Remy",
    },
    tags: ["Ghost Frequency", "Horror", "Dread"],
    format: "image",
    trending: false,
  },
  {
    id: "m5",
    title: "Obsidian Protocol choreography team after being told there's no CGI budget:",
    image:
      "https://images.unsplash.com/photo-1624079364152-be365e1631db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    movieRef: "The Obsidian Protocol",
    upvotes: 11402,
    comments: 671,
    timeAgo: "12h ago",
    author: {
      initials: "PM",
      gradient: "linear-gradient(135deg,#9b59b6,#2ecc71)",
      name: "PixelFrame_Maya",
    },
    tags: ["Obsidian Protocol", "Action", "Stunts"],
    format: "image",
    trending: true,
  },
  {
    id: "m6",
    title: "Film buffs when someone misidentifies the director's style",
    image: null,
    movieRef: undefined,
    upvotes: 4201,
    comments: 187,
    timeAgo: "1d ago",
    author: {
      initials: "RJ",
      gradient: "linear-gradient(135deg,#2ecc71,#1abc9c)",
      name: "ReelTalk_Juno",
    },
    tags: ["Film Discourse", "Directors", "Nerd Mode"],
    format: "text",
    textContent:
      "You: 'This film has very Kubrickian vibes'\n\nActually it was directed by someone who has never watched Kubrick and just likes symmetry\n\nYou: (loses all faith in humanity)",
    trending: false,
  },
  {
    id: "m7",
    title: "Wild Chronicles when it shows you a spider in 4K",
    image:
      "https://images.unsplash.com/photo-1703953788556-15e1dc3ebb32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    movieRef: "Wild Chronicles",
    upvotes: 6781,
    comments: 302,
    timeAgo: "1d ago",
    author: {
      initials: "AX",
      gradient: "linear-gradient(135deg,#f5c518,#e84545)",
      name: "CineVault_Alex",
    },
    tags: ["Wild Chronicles", "Documentary", "Nature"],
    format: "image",
    trending: false,
  },
  {
    id: "m8",
    title: "Echoes of Ether ending, 3am, watching alone:",
    image: null,
    movieRef: "Echoes of Ether",
    upvotes: 8932,
    comments: 421,
    timeAgo: "2d ago",
    author: {
      initials: "DZ",
      gradient: "linear-gradient(135deg,#e91e8c,#9b59b6)",
      name: "DarkCinema_Zara",
    },
    tags: ["Echoes of Ether", "Drama", "3AM Feels"],
    format: "text",
    textContent:
      "Grieving musician: *hears late husband's composition on radio*\n\nMe: I'm totally fine\n\n*2 minutes later*\n\nMe: 🚿💧💧💧💧💧",
    trending: true,
  },
];

export const TAGS_TRENDING = [
  "#RealmOfAsh",
  "#SakuraProtocol",
  "#NexusRising",
  "#ObsidianProtocol",
  "#GhostFrequency",
  "#FilmTwitter",
  "#Awards2025",
];

export const TAG_REACTIONS = ["😂", "🔥", "😱", "💀", "🤌", "👏"];

export const MEME_TEMPLATES = [
  { id: "t1", label: "Drake", emoji: "🤌" },
  { id: "t2", label: "Distracted", emoji: "👀" },
  { id: "t3", label: "This is Fine", emoji: "🔥" },
  { id: "t4", label: "Surprised", emoji: "😱" },
  { id: "t5", label: "Galaxy Brain", emoji: "🧠" },
  { id: "t6", label: "Custom", emoji: "✏️" },
];
