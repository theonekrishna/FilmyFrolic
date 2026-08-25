const ACCENT = "#f5c518";
export const CAT_CONFIG = {
  breaking: { label: "Breaking", emoji: "🔥", color: "#e84545" },
  rumour: { label: "Rumour", emoji: "🤫", color: "#f39c12" },
  paparazzi: { label: "Paparazzi", emoji: "📸", color: "#ec4899" },
  interview: { label: "Interview", emoji: "🎙️", color: "#3b82f6" },
  drama: { label: "Drama", emoji: "🎭", color: "#9b59b6" },
  hottake: { label: "Hot Take", emoji: "⚡", color: ACCENT },
};

export const GOSSIPS = [
  {
    id: "g1",
    headline:
      "EXCLUSIVE: Realm of Ash Sequel Already In Pre-Production — Three New Kingdoms Confirmed",
    excerpt:
      "Sources close to the production confirm that studio executives signed off on a two-film continuation just 72 hours after the original's opening weekend numbers landed. Three new kingdoms will expand the already sprawling mythology.",
    source: "via Deadline",
    timeAgo: "1h ago",
    category: "breaking",
    verified: true,
    image:
      "https://images.unsplash.com/photo-1767709879762-c7a6ce819aeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    fire: 8412,
    shocked: 3201,
    comments: 891,
    bookmarked: false,
    tags: ["Sequel", "Realm of Ash", "Exclusive"],
  },
  {
    id: "g2",
    headline: "Ana Kovacs in Talks to Direct Marvel's Next Big Phase Project",
    excerpt:
      "After Obsidian Protocol became the year's highest-grossing original film, the director has reportedly fielded multiple major studio offers. Marvel is said to be the frontrunner.",
    source: "via Variety",
    timeAgo: "3h ago",
    category: "breaking",
    verified: true,
    fire: 5103,
    shocked: 4201,
    comments: 647,
    bookmarked: true,
    tags: ["Marvel", "Ana Kovacs", "Director"],
  },
  {
    id: "g3",
    headline: "RUMOUR: Sakura Protocol Lead Aoi Nakamura Set for Live-Action Hollywood Debut",
    excerpt:
      "Unverified reports suggest the anime breakout star has been quietly meeting with A-list directors following her historic voice performance.",
    source: "via Film Twitter",
    timeAgo: "6h ago",
    category: "rumour",
    verified: false,
    image:
      "https://images.unsplash.com/photo-1730563756005-9b379b0512ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    fire: 3890,
    shocked: 6102,
    comments: 412,
    bookmarked: false,
    tags: ["Rumour", "Live-Action", "Sakura Protocol"],
  },
  {
    id: "g4",
    headline: "Ghost Frequency 2 Officially Greenlit — Original Director & Cast Return",
    excerpt:
      "Horror fans rejoice: the cult smash Ghost Frequency is getting a full-budget sequel, with the original director and most of the cast returning to haunt our screens.",
    source: "via The Hollywood Reporter",
    timeAgo: "9h ago",
    category: "breaking",
    verified: true,
    image:
      "https://images.unsplash.com/photo-1639986587553-1d994ffc66d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    fire: 7234,
    shocked: 1890,
    comments: 523,
    bookmarked: false,
    tags: ["Sequel", "Horror", "Ghost Frequency"],
  },
  {
    id: "g5",
    headline: "Set Drama? Reports of Tension Between Nexus Rising Stars Surface Online",
    excerpt:
      "Behind-the-scenes friction reportedly emerged during reshoots, though both stars' reps deny any conflict. A production insider paints a different picture.",
    source: "via Entertainment Weekly",
    timeAgo: "12h ago",
    category: "drama",
    verified: false,
    fire: 2109,
    shocked: 8341,
    comments: 1203,
    bookmarked: false,
    tags: ["Rumour", "Drama", "Nexus Rising"],
  },
  {
    id: "g6",
    headline: "Leo Vane's Next Project is a 4-Hour Director's Cut Epic — No Studio Involvement",
    excerpt:
      "The Realm of Ash director confirms his next film will be self-financed, four hours long, and completely independent. 'I will never compromise again,' he tells us.",
    source: "via IndieWire Interview",
    timeAgo: "1d ago",
    category: "interview",
    verified: true,
    fire: 9120,
    shocked: 2340,
    comments: 1820,
    bookmarked: false,
    tags: ["Leo Vane", "Independent", "Director"],
  },
  {
    id: "g7",
    headline:
      "Hot Take: The Academy is Already Sleeping on Sakura Protocol and We Should All Be Mad",
    excerpt:
      "Another year, another animated masterpiece getting snubbed before the ceremony even starts. This is getting embarrassing.",
    source: "via FilmlyFrolic Editorial",
    timeAgo: "2d ago",
    category: "hottake",
    verified: true,
    fire: 15340,
    shocked: 4210,
    comments: 3241,
    bookmarked: true,
    tags: ["Hot Take", "Awards", "Sakura Protocol"],
  },
];

export const TRENDING_TAGS = [
  "#RealmOfAsh",
  "#SakuraProtocol",
  "#NexusRising",
  "#GhostFrequency",
  "#MarvelPhase6",
  "#HollywoodDrama",
  "#AnimeHollywood",
];
