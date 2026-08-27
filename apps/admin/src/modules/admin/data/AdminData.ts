// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "user" | "moderator" | "admin" | "article_writer";
export type AdminRole = "super_admin" | "content_manager" | "community_moderator" | "support_staff";
export type UserStatus = "active" | "suspended" | "banned";
export type ContentStatus = "published" | "hidden" | "draft";
export type ReportStatus = "pending" | "resolved" | "dismissed";
export type ReportType =
  "post" | "review" | "user" | "comment" | "community" | "article" | "message";
export type ReportReason =
  | "spam"
  | "harassment"
  | "hate_speech"
  | "misinformation"
  | "copyright"
  | "nudity"
  | "violence"
  | "self_harm"
  | "scam"
  | "impersonation"
  | "other";
export type UserAction = "follow" | "unfollow" | "block" | "unblock" | "mute" | "unmute" | "report";

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  adminRole?: AdminRole;
  status: UserStatus;
  joined: string;
  posts: number;
  reviews: number;
  gradient: string;
  canWriteArticles?: boolean; // For article_writer role
}

export interface AdminMovie {
  id: string;
  title: string;
  year: number;
  genre: string;
  rating: number;
  status: ContentStatus;
  featured: boolean;
  image: string;
}

export interface AdminArticle {
  id: string;
  title: string;
  author: string;
  category: string;
  published: string;
  views: number;
  status: ContentStatus;
}

export interface AdminGossipItem {
  id: string;
  headline: string;
  source: string;
  tags: string[];
  published: string;
  views: number;
  status: ContentStatus;
}

export interface AdminCommunity {
  id: string;
  name: string;
  topic: string;
  members: number;
  posts: number;
  moderator: string;
  status: "active" | "suspended" | "archived";
  verified: boolean;
  image?: string;
  description?: string;
}

export interface AdminPost {
  id: string;
  author: string;
  preview: string;
  community: string;
  flags: number;
  time: string;
  status: "active" | "removed";
}

export interface AdminRoom {
  id: string;
  name: string;
  topic: string;
  participants: number;
  host: string;
  status: "live" | "ended" | "scheduled";
}

export interface AdminQuiz {
  id: string;
  title: string;
  category: string;
  questions: number;
  plays: number;
  avgScore: number;
  status: "active" | "inactive";
  featured: boolean;
}

export interface AdminMeme {
  id: string;
  title: string;
  image: string;
  author: string;
  votes: number;
  status: "pending" | "approved" | "rejected";
  submitted: string;
}

export interface AdminReport {
  id: string;
  type: ReportType;
  contentPreview: string;
  reporter: string;
  reason: ReportReason;
  additionalInfo?: string;
  status: ReportStatus;
  time: string;
  severity?: "low" | "medium" | "high";
  reportedUserId?: string;
  reportedContentId?: string;
}

export interface SentNotification {
  id: string;
  title: string;
  message: string;
  target: string;
  type: "info" | "warning" | "announcement";
  sent: string;
  reach: number;
}

// ─── Mock Users ──────────────────────────────────────────────────────────────

export const ADMIN_USERS: AdminUser[] = [
  {
    id: "u1",
    name: "Alex Chen",
    username: "alexc",
    email: "alex@example.com",
    role: "admin",
    adminRole: "super_admin",
    status: "active",
    joined: "Jan 2024",
    posts: 124,
    reviews: 47,
    gradient: "linear-gradient(135deg,#f5c518,#e84545)",
    canWriteArticles: true,
  },
  {
    id: "u2",
    name: "Sarah Kim",
    username: "sarahk",
    email: "sarah@example.com",
    role: "article_writer",
    status: "active",
    joined: "Mar 2024",
    posts: 89,
    reviews: 32,
    gradient: "linear-gradient(135deg,#3b82f6,#9b59b6)",
    canWriteArticles: true,
  },
  {
    id: "u3",
    name: "James Okafor",
    username: "jokaf",
    email: "james@example.com",
    role: "article_writer",
    status: "active",
    joined: "May 2024",
    posts: 210,
    reviews: 68,
    gradient: "linear-gradient(135deg,#1fd1a8,#4d91ff)",
    canWriteArticles: true,
  },
  {
    id: "u4",
    name: "Priya Nair",
    username: "priyan",
    email: "priya@example.com",
    role: "user",
    status: "suspended",
    joined: "Jun 2024",
    posts: 34,
    reviews: 12,
    gradient: "linear-gradient(135deg,#e91e8c,#9b59b6)",
  },
  {
    id: "u5",
    name: "Marco Rossi",
    username: "marcor",
    email: "marco@example.com",
    role: "moderator",
    adminRole: "community_moderator",
    status: "active",
    joined: "Aug 2024",
    posts: 56,
    reviews: 24,
    gradient: "linear-gradient(135deg,#7c5cfc,#3b82f6)",
  },
  {
    id: "u6",
    name: "Yuki Tanaka",
    username: "yukit",
    email: "yuki@example.com",
    role: "user",
    status: "banned",
    joined: "Sep 2024",
    posts: 3,
    reviews: 1,
    gradient: "linear-gradient(135deg,#f5c518,#2ecc71)",
  },
  {
    id: "u7",
    name: "Lena Schmidt",
    username: "lenas",
    email: "lena@example.com",
    role: "user",
    status: "active",
    joined: "Oct 2024",
    posts: 78,
    reviews: 41,
    gradient: "linear-gradient(135deg,#e84545,#f5c518)",
  },
  {
    id: "u8",
    name: "Raj Patel",
    username: "rajp",
    email: "raj@example.com",
    role: "user",
    status: "active",
    joined: "Nov 2024",
    posts: 145,
    reviews: 60,
    gradient: "linear-gradient(135deg,#2ecc71,#4d91ff)",
  },
  {
    id: "u9",
    name: "Chloe Martin",
    username: "chloem",
    email: "chloe@example.com",
    role: "admin",
    adminRole: "content_manager",
    status: "active",
    joined: "Dec 2024",
    posts: 92,
    reviews: 38,
    gradient: "linear-gradient(135deg,#9b59b6,#e91e8c)",
    canWriteArticles: true,
  },
  {
    id: "u10",
    name: "David Liu",
    username: "davl",
    email: "david@example.com",
    role: "moderator",
    adminRole: "support_staff",
    status: "active",
    joined: "Feb 2025",
    posts: 67,
    reviews: 29,
    gradient: "linear-gradient(135deg,#4d91ff,#7c5cfc)",
  },
];

// ─── Mock Movies ─────────────────────────────────────────────────────────────

export const ADMIN_MOVIES: AdminMovie[] = [
  {
    id: "m1",
    title: "The Obsidian Protocol",
    year: 2025,
    genre: "Action · Thriller",
    rating: 8.7,
    status: "published",
    featured: true,
    image: "https://images.unsplash.com/photo-1557343133-b5cf261ace6b?w=60&h=80&fit=crop",
  },
  {
    id: "m2",
    title: "Nexus Rising",
    year: 2025,
    genre: "Sci-Fi · Adventure",
    rating: 8.4,
    status: "published",
    featured: true,
    image: "https://images.unsplash.com/photo-1761845064537-929979725425?w=60&h=80&fit=crop",
  },
  {
    id: "m3",
    title: "Crimson Veil",
    year: 2024,
    genre: "Thriller · Mystery",
    rating: 7.9,
    status: "published",
    featured: false,
    image: "https://images.unsplash.com/photo-1770150511119-ec6b93d26de9?w=60&h=80&fit=crop",
  },
  {
    id: "m4",
    title: "Realm of Ash",
    year: 2025,
    genre: "Fantasy · Drama",
    rating: 9.1,
    status: "published",
    featured: true,
    image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=60&h=80&fit=crop",
  },
  {
    id: "m5",
    title: "Sakura Protocol",
    year: 2024,
    genre: "Romance · Drama",
    rating: 8.2,
    status: "hidden",
    featured: false,
    image: "https://images.unsplash.com/photo-1611516491426-03025e6043c8?w=60&h=80&fit=crop",
  },
  {
    id: "m6",
    title: "Hearts Aligned",
    year: 2025,
    genre: "Romance · Comedy",
    rating: 7.5,
    status: "draft",
    featured: false,
    image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=60&h=80&fit=crop",
  },
];

// ─── Mock Articles ────────────────────────────────────────────────────────────

export const ADMIN_ARTICLES: AdminArticle[] = [
  {
    id: "a1",
    title: "Why 2025 Is the Best Year for Sci-Fi",
    author: "Sarah Kim",
    category: "Sci-Fi",
    published: "Apr 5, 2026",
    views: 12400,
    status: "published",
  },
  {
    id: "a2",
    title: "Villeneuve's Next Project: What We Know",
    author: "James Okafor",
    category: "Director",
    published: "Apr 3, 2026",
    views: 8900,
    status: "published",
  },
  {
    id: "a3",
    title: "The Hidden Symbolism in Realm of Ash",
    author: "Lena Schmidt",
    category: "Analysis",
    published: "Apr 1, 2026",
    views: 5600,
    status: "published",
  },
  {
    id: "a4",
    title: "Top 10 Films You Missed in 2024",
    author: "Raj Patel",
    category: "Lists",
    published: "Mar 28, 2026",
    views: 22100,
    status: "published",
  },
  {
    id: "a5",
    title: "Draft: Anime Cinema Renaissance 2026",
    author: "Yuki Tanaka",
    category: "Anime",
    published: "—",
    views: 0,
    status: "draft",
  },
  {
    id: "a6",
    title: "The Controversial Ending of Crimson Veil",
    author: "Alex Chen",
    category: "Analysis",
    published: "Mar 20, 2026",
    views: 3200,
    status: "hidden",
  },
];

// ─── Mock Gossip ──────────────────────────────────────────────────────────────

export const ADMIN_GOSSIP: AdminGossipItem[] = [
  {
    id: "g1",
    headline: "Nolan Confirms His 2027 Film is a Musical",
    source: "Variety",
    tags: ["Nolan", "Musical"],
    published: "Apr 6, 2026",
    views: 34000,
    status: "published",
  },
  {
    id: "g2",
    headline: "Realm of Ash Sequel Greenlit by Studio",
    source: "Deadline",
    tags: ["Sequel", "Fantasy"],
    published: "Apr 4, 2026",
    views: 21000,
    status: "published",
  },
  {
    id: "g3",
    headline: "Star Drops Out of Major Blockbuster",
    source: "THR",
    tags: ["Casting", "Drama"],
    published: "Apr 2, 2026",
    views: 18500,
    status: "published",
  },
  {
    id: "g4",
    headline: "Leaked: Script Pages for Nexus Rising 2",
    source: "Leaked",
    tags: ["Leak", "Sci-Fi"],
    published: "Mar 30, 2026",
    views: 9800,
    status: "hidden",
  },
  {
    id: "g5",
    headline: "Award Season Predictions: Our Analysis",
    source: "FilmyFrolic",
    tags: ["Awards", "Analysis"],
    published: "Mar 25, 2026",
    views: 6700,
    status: "published",
  },
];

// ─── Mock Communities ─────────────────────────────────────────────────────────

export const ADMIN_COMMUNITIES: AdminCommunity[] = [
  {
    id: "c1",
    name: "Sci-Fi Fanatics",
    topic: "Sci-Fi",
    members: 14200,
    posts: 8900,
    moderator: "James Okafor",
    status: "active",
    verified: true,
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop",
    description: "For lovers of science fiction films and TV shows",
  },
  {
    id: "c2",
    name: "Drama & Art House",
    topic: "Drama",
    members: 8700,
    posts: 5400,
    moderator: "Sarah Kim",
    status: "active",
    verified: true,
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=300&fit=crop",
    description: "Discussing character-driven stories and artistic cinema",
  },
  {
    id: "c3",
    name: "Horror Collective",
    topic: "Horror",
    members: 6300,
    posts: 3200,
    moderator: "Marco Rossi",
    status: "active",
    verified: false,
    image: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400&h=300&fit=crop",
    description: "A community for horror movie enthusiasts",
  },
  {
    id: "c4",
    name: "Anime Cinema",
    topic: "Anime",
    members: 11500,
    posts: 7100,
    moderator: "Yuki Tanaka",
    status: "active",
    verified: true,
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=300&fit=crop",
    description: "Japanese animation films and series discussions",
  },
  {
    id: "c5",
    name: "Bad Takes Only",
    topic: "Comedy",
    members: 2100,
    posts: 1800,
    moderator: "Priya Nair",
    status: "suspended",
    verified: false,
    image: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=400&h=300&fit=crop",
    description: "Controversial and unpopular movie opinions welcome",
  },
  {
    id: "c6",
    name: "Directors Lounge",
    topic: "Directors",
    members: 4800,
    posts: 2900,
    moderator: "Lena Schmidt",
    status: "active",
    verified: true,
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop",
    description: "Celebrating filmmakers and their craft",
  },
];

// ─── Mock Posts (moderation queue) ────────────────────────────────────────────

export const ADMIN_POSTS: AdminPost[] = [
  {
    id: "p1",
    author: "yukit",
    preview: "This movie is absolute garbage and the director should quit...",
    community: "Drama & Art House",
    flags: 8,
    time: "1h ago",
    status: "active",
  },
  {
    id: "p2",
    author: "rajp",
    preview: "Buy cheap movie tickets at [suspicious link] — best deals...",
    community: "Sci-Fi Fanatics",
    flags: 15,
    time: "3h ago",
    status: "active",
  },
  {
    id: "p3",
    author: "chloem",
    preview: "I really didn't enjoy the pacing but the acting was decent...",
    community: "Horror Collective",
    flags: 1,
    time: "5h ago",
    status: "active",
  },
  {
    id: "p4",
    author: "jokaf",
    preview: "SPOILER: The ending reveals that the main character was...",
    community: "Sci-Fi Fanatics",
    flags: 4,
    time: "6h ago",
    status: "active",
  },
  {
    id: "p5",
    author: "marcor",
    preview: "Hot take: overrated trash, everyone who likes this has no...",
    community: "Anime Cinema",
    flags: 11,
    time: "8h ago",
    status: "active",
  },
  {
    id: "p6",
    author: "davl",
    preview: "Great discussion thread about cinematography techniques...",
    community: "Directors Lounge",
    flags: 0,
    time: "10h ago",
    status: "removed",
  },
];

// ─── Mock Rooms ───────────────────────────────────────────────────────────────

export const ADMIN_ROOMS: AdminRoom[] = [
  {
    id: "r1",
    name: "Live Watchalong: Realm of Ash",
    topic: "Fantasy",
    participants: 342,
    host: "alexc",
    status: "live",
  },
  {
    id: "r2",
    name: "Oscars 2026 Discussion",
    topic: "Awards",
    participants: 218,
    host: "sarahk",
    status: "live",
  },
  {
    id: "r3",
    name: "Nolan Deep Dive — This Weekend",
    topic: "Directors",
    participants: 0,
    host: "lenas",
    status: "scheduled",
  },
  {
    id: "r4",
    name: "Horror Marathon: April Edition",
    topic: "Horror",
    participants: 0,
    host: "marcor",
    status: "scheduled",
  },
  {
    id: "r5",
    name: "Anime Cinema Night",
    topic: "Anime",
    participants: 0,
    host: "yukit",
    status: "ended",
  },
];

// ─── Mock Quizzes ─────────────────────────────────────────────────────────────

export const ADMIN_QUIZZES: AdminQuiz[] = [
  {
    id: "q1",
    title: "Sci-Fi Supremacy",
    category: "Sci-Fi",
    questions: 20,
    plays: 18400,
    avgScore: 74,
    status: "active",
    featured: true,
  },
  {
    id: "q2",
    title: "Daily Quiz – April 7",
    category: "General",
    questions: 10,
    plays: 42100,
    avgScore: 68,
    status: "active",
    featured: true,
  },
  {
    id: "q3",
    title: "Anime Cinema IQ",
    category: "Anime",
    questions: 15,
    plays: 9200,
    avgScore: 61,
    status: "active",
    featured: false,
  },
  {
    id: "q4",
    title: "Horror Through the Ages",
    category: "Horror",
    questions: 20,
    plays: 7800,
    avgScore: 79,
    status: "active",
    featured: false,
  },
  {
    id: "q5",
    title: "Directors' Cut",
    category: "Directors",
    questions: 25,
    plays: 5400,
    avgScore: 55,
    status: "inactive",
    featured: false,
  },
  {
    id: "q6",
    title: "2025 Box Office Blitz",
    category: "General",
    questions: 15,
    plays: 3100,
    avgScore: 63,
    status: "draft" as "inactive",
    featured: false,
  },
];

// ─── Mock Memes ───────────────────────────────────────────────────────────────

export const ADMIN_MEMES: AdminMeme[] = [
  {
    id: "me1",
    title: "When the twist hits at minute 90",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=160&h=120&fit=crop",
    author: "jokaf",
    votes: 412,
    status: "approved",
    submitted: "2h ago",
  },
  {
    id: "me2",
    title: "Me explaining the plot to my dad",
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=160&h=120&fit=crop",
    author: "rajp",
    votes: 288,
    status: "approved",
    submitted: "4h ago",
  },
  {
    id: "me3",
    title: "Nolan movie timeline (simplified)",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=160&h=120&fit=crop",
    author: "chloem",
    votes: 0,
    status: "pending",
    submitted: "30m ago",
  },
  {
    id: "me4",
    title: "POV: Reading IMDB reviews",
    image: "https://images.unsplash.com/photo-1581888227599-779811939961?w=160&h=120&fit=crop",
    author: "lenas",
    votes: 0,
    status: "pending",
    submitted: "1h ago",
  },
  {
    id: "me5",
    title: "That one scene we don't discuss",
    image: "https://images.unsplash.com/photo-1512070679279-8988d32161be?w=160&h=120&fit=crop",
    author: "yukit",
    votes: 0,
    status: "rejected",
    submitted: "6h ago",
  },
];

// ─── Mock Reports ─────────────────────────────────────────────────────────────

export const ADMIN_REPORTS: AdminReport[] = [
  {
    id: "rep1",
    type: "post",
    contentPreview: "Buy cheap tickets at [link]...",
    reporter: "alexc",
    reason: "spam",
    status: "pending",
    time: "30m ago",
    severity: "medium",
    reportedUserId: "u7",
    reportedContentId: "p123",
  },
  {
    id: "rep2",
    type: "user",
    contentPreview: "@yukit — repeated harassment of users",
    reporter: "sarahk",
    reason: "harassment",
    status: "pending",
    time: "1h ago",
    severity: "high",
    reportedUserId: "u6",
  },
  {
    id: "rep3",
    type: "post",
    contentPreview: "This director is garbage and should...",
    reporter: "marcor",
    reason: "hate_speech",
    status: "pending",
    time: "2h ago",
    severity: "high",
    reportedUserId: "u4",
    reportedContentId: "p124",
  },
  {
    id: "rep4",
    type: "community",
    contentPreview: "Bad Takes Only community promotes toxicity",
    reporter: "rajp",
    reason: "harassment",
    status: "pending",
    time: "3h ago",
    severity: "medium",
    reportedContentId: "c5",
  },
  {
    id: "rep5",
    type: "comment",
    contentPreview: "Anyone who disagrees is an idiot...",
    reporter: "jokaf",
    reason: "hate_speech",
    status: "resolved",
    time: "5h ago",
    severity: "low",
    reportedUserId: "u4",
    reportedContentId: "c567",
  },
  {
    id: "rep6",
    type: "article",
    contentPreview: "Article contains misleading information about...",
    reporter: "lenas",
    reason: "misinformation",
    status: "pending",
    time: "6h ago",
    severity: "medium",
    reportedContentId: "a5",
  },
  {
    id: "rep7",
    type: "post",
    contentPreview: "Leaked script pages attached below...",
    reporter: "davl",
    reason: "copyright",
    status: "resolved",
    time: "8h ago",
    severity: "high",
    reportedUserId: "u3",
    reportedContentId: "p125",
  },
  {
    id: "rep8",
    type: "user",
    contentPreview: "@scammer123 — Selling fake merchandise",
    reporter: "chloem",
    reason: "scam",
    status: "pending",
    time: "10h ago",
    severity: "high",
    reportedUserId: "u8",
  },
  {
    id: "rep9",
    type: "message",
    contentPreview: "Unwanted promotional messages in DMs",
    reporter: "rajp",
    reason: "spam",
    status: "pending",
    time: "12h ago",
    severity: "low",
    reportedUserId: "u7",
  },
  {
    id: "rep10",
    type: "post",
    contentPreview: "Content showing graphic violence",
    reporter: "sarahk",
    reason: "violence",
    status: "dismissed",
    time: "1d ago",
    severity: "medium",
    reportedUserId: "u3",
    reportedContentId: "p126",
  },
];

// ─── Mock Sent Notifications ──────────────────────────────────────────────────

export const SENT_NOTIFICATIONS: SentNotification[] = [
  {
    id: "n1",
    title: "New Quiz Available!",
    message: "Test your Sci-Fi knowledge in our latest weekly quiz.",
    target: "All Users",
    type: "announcement",
    sent: "Apr 7, 2026",
    reach: 84200,
  },
  {
    id: "n2",
    title: "Scheduled Maintenance",
    message: "The platform will be down for 30 min on Apr 8 at 2AM.",
    target: "All Users",
    type: "warning",
    sent: "Apr 6, 2026",
    reach: 84200,
  },
  {
    id: "n3",
    title: "Realm of Ash Now on Platform",
    message: "The most-anticipated fantasy film just dropped on FF.",
    target: "Content Users",
    type: "info",
    sent: "Apr 5, 2026",
    reach: 42100,
  },
  {
    id: "n4",
    title: "Community Milestone!",
    message: "Sci-Fi Fanatics just hit 14,000 members. Thank you!",
    target: "Sci-Fi Fanatics",
    type: "announcement",
    sent: "Apr 3, 2026",
    reach: 14200,
  },
  {
    id: "n5",
    title: "Weekly Digest",
    message: "Here's what happened on Filmy Frolic this week.",
    target: "All Users",
    type: "info",
    sent: "Apr 1, 2026",
    reach: 84200,
  },
];

// ─── Analytics Chart Data ─────────────────────────────────────────────────────

export const USER_GROWTH = [
  { month: "Nov", users: 42000, active: 28000 },
  { month: "Dec", users: 51000, active: 34000 },
  { month: "Jan", users: 58000, active: 39000 },
  { month: "Feb", users: 64000, active: 43000 },
  { month: "Mar", users: 73000, active: 51000 },
  { month: "Apr", users: 84200, active: 61000 },
];

export const MODULE_USAGE = [
  { name: "CORE", sessions: 92400, color: "#4d91ff" },
  { name: "SOCIAL", sessions: 74200, color: "#7c5cfc" },
  { name: "CONTENT", sessions: 68900, color: "#f5c518" },
  { name: "ENTERTAIN", sessions: 52100, color: "#e84545" },
  { name: "USER", sessions: 38700, color: "#1fd1a8" },
];

export const DAU_TREND = [
  { day: "Mon", dau: 5200 },
  { day: "Tue", dau: 6100 },
  { day: "Wed", dau: 5800 },
  { day: "Thu", dau: 7200 },
  { day: "Fri", dau: 8400 },
  { day: "Sat", dau: 9100 },
  { day: "Sun", dau: 8700 },
];

export const CONTENT_VIEWS = [
  { type: "Movies", views: 284000, color: "#f5c518" },
  { type: "Articles", views: 124000, color: "#4d91ff" },
  { type: "Gossip", views: 98000, color: "#e84545" },
  { type: "Quizzes", views: 76000, color: "#7c5cfc" },
  { type: "Memes", views: 54000, color: "#1fd1a8" },
];

// ─── Content Feedback System ──────────────────────────────────────────────────

export type ContentFeedbackType = "movie" | "article" | "cast";
export type FeedbackCategory =
  "incorrect_info" | "missing_data" | "image_quality" | "duplicate" | "rating_dispute" | "other";
export type FeedbackStatus = "pending" | "approved" | "rejected";
export type FeedbackPriority = "high" | "medium" | "low";

export interface ContentFeedback {
  id: string;
  type: ContentFeedbackType;
  contentId: string;
  contentTitle: string;
  category: FeedbackCategory;
  description: string;
  suggestedCorrection?: string;
  submittedBy: string;
  submittedAt: string;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface CastCrewMember {
  id: string;
  name: string;
  role:
    | "actor"
    | "director"
    | "producer"
    | "writer"
    | "cinematographer"
    | "composer"
    | "editor"
    | "production_designer"
    | "costume_designer"
    | "other";
  image: string;
  bio: string;
  birthYear?: number;
  credits: number;
  featured: boolean;
  popularMovies: string[];
  awards?: string[];
}

// ─── Mock Content Feedback ────────────────────────────────────────────────────

export const CONTENT_FEEDBACK: ContentFeedback[] = [
  {
    id: "cf1",
    type: "movie",
    contentId: "m1",
    contentTitle: "The Obsidian Protocol",
    category: "incorrect_info",
    description: "The release year is listed as 2025 but it was actually released in 2024.",
    suggestedCorrection: "Change year from 2025 to 2024",
    submittedBy: "alexc",
    submittedAt: "2h ago",
    status: "pending",
    priority: "high",
  },
  {
    id: "cf2",
    type: "movie",
    contentId: "m4",
    contentTitle: "Realm of Ash",
    category: "missing_data",
    description: "Missing director information and composer credits.",
    suggestedCorrection: "Director: Sofia Ramirez, Composer: Hans Zimmer",
    submittedBy: "sarahk",
    submittedAt: "5h ago",
    status: "pending",
    priority: "medium",
  },
  {
    id: "cf3",
    type: "article",
    contentId: "a2",
    contentTitle: "Villeneuve's Next Project: What We Know",
    category: "incorrect_info",
    description:
      "Article says the film starts production in May 2026, but official announcement says June 2026.",
    suggestedCorrection: "Update production start date to June 2026",
    submittedBy: "jokaf",
    submittedAt: "1d ago",
    status: "pending",
    priority: "low",
  },
  {
    id: "cf4",
    type: "cast",
    contentId: "cc3",
    contentTitle: "Emma Stone",
    category: "missing_data",
    description: "Missing recent award win for Best Actress at Golden Globes 2026.",
    suggestedCorrection: "Add Golden Globe 2026 to awards list",
    submittedBy: "rajp",
    submittedAt: "1d ago",
    status: "pending",
    priority: "medium",
  },
  {
    id: "cf5",
    type: "movie",
    contentId: "m2",
    contentTitle: "Nexus Rising",
    category: "image_quality",
    description: "Movie poster image is very low resolution and pixelated.",
    submittedBy: "chloem",
    submittedAt: "2d ago",
    status: "approved",
    priority: "high",
    reviewedBy: "alexc",
    reviewedAt: "1d ago",
    adminNotes: "Updated with high-res poster from FilyDock",
  },
  {
    id: "cf6",
    type: "article",
    contentId: "a5",
    contentTitle: "Draft: Anime Cinema Renaissance 2026",
    category: "duplicate",
    description:
      "This article is a duplicate of 'The Rise of Anime Cinema in 2026' published last month.",
    submittedBy: "yukit",
    submittedAt: "3d ago",
    status: "rejected",
    priority: "low",
    reviewedBy: "sarahk",
    reviewedAt: "2d ago",
    adminNotes: "Not a duplicate - different focus and author",
  },
];

// ─── Mock Cast & Crew ─────────────────────────────────────────────────────────

export const CAST_CREW: CastCrewMember[] = [
  {
    id: "cc1",
    name: "Christopher Nolan",
    role: "director",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
    bio: "Acclaimed director known for complex narratives and practical effects.",
    birthYear: 1970,
    credits: 23,
    featured: true,
    popularMovies: ["Inception", "Interstellar", "Oppenheimer"],
    awards: ["Academy Award", "Golden Globe", "BAFTA"],
  },
  {
    id: "cc2",
    name: "Denis Villeneuve",
    role: "director",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
    bio: "Visionary filmmaker behind Dune, Blade Runner 2049, and Arrival.",
    birthYear: 1967,
    credits: 18,
    featured: true,
    popularMovies: ["Dune", "Blade Runner 2049", "Arrival"],
    awards: ["Academy Award Nominee", "BAFTA", "Critics Choice"],
  },
  {
    id: "cc3",
    name: "Emma Stone",
    role: "actor",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
    bio: "Academy Award-winning actress with range spanning comedy to drama.",
    birthYear: 1988,
    credits: 47,
    featured: true,
    popularMovies: ["La La Land", "Poor Things", "The Favourite"],
    awards: ["Academy Award", "Golden Globe", "BAFTA", "SAG"],
  },
  {
    id: "cc4",
    name: "Timothée Chalamet",
    role: "actor",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop",
    bio: "Rising star known for nuanced performances in Dune and Call Me by Your Name.",
    birthYear: 1995,
    credits: 29,
    featured: true,
    popularMovies: ["Dune", "Call Me by Your Name", "Little Women"],
    awards: ["Critics Choice", "Golden Globe Nominee"],
  },
  {
    id: "cc5",
    name: "Hans Zimmer",
    role: "composer",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
    bio: "Legendary composer with iconic scores for over 150 films.",
    birthYear: 1957,
    credits: 156,
    featured: true,
    popularMovies: ["Dune", "Inception", "The Dark Knight", "Interstellar"],
    awards: ["Academy Award", "Grammy", "Golden Globe"],
  },
  {
    id: "cc6",
    name: "Roger Deakins",
    role: "cinematographer",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop",
    bio: "Master cinematographer with unparalleled visual storytelling.",
    birthYear: 1949,
    credits: 94,
    featured: true,
    popularMovies: ["Blade Runner 2049", "1917", "Skyfall"],
    awards: ["Academy Award", "BAFTA", "ASC Award"],
  },
  {
    id: "cc7",
    name: "Greta Gerwig",
    role: "director",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop",
    bio: "Writer-director known for insightful character-driven stories.",
    birthYear: 1983,
    credits: 12,
    featured: false,
    popularMovies: ["Barbie", "Lady Bird", "Little Women"],
    awards: ["Golden Globe", "Academy Award Nominee"],
  },
  {
    id: "cc8",
    name: "Ludwig Göransson",
    role: "composer",
    image: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&h=80&fit=crop",
    bio: "Grammy and Oscar-winning composer blending orchestral and modern sounds.",
    birthYear: 1984,
    credits: 38,
    featured: false,
    popularMovies: ["Black Panther", "Oppenheimer", "Tenet"],
    awards: ["Academy Award", "Grammy"],
  },
  {
    id: "cc9",
    name: "Zendaya",
    role: "actor",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop",
    bio: "Emmy-winning actress and fashion icon breaking boundaries.",
    birthYear: 1996,
    credits: 34,
    featured: true,
    popularMovies: ["Dune", "Spider-Man", "Euphoria"],
    awards: ["Emmy", "Critics Choice"],
  },
  {
    id: "cc10",
    name: "Thelma Schoonmaker",
    role: "editor",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop",
    bio: "Legendary editor and longtime collaborator with Martin Scorsese.",
    birthYear: 1940,
    credits: 52,
    featured: false,
    popularMovies: ["The Irishman", "Goodfellas", "Raging Bull"],
    awards: ["Academy Award (3x)", "BAFTA", "Eddie Award"],
  },
];
