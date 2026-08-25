import { Star, Film, Bookmark, TrendingUp, Award } from "lucide-react";
import { MOVIES } from "../../Home/data/movies";
const ACCENT = "#1fd1a8";
const GOLD = "#f5c518";
// ─── Static mock data ──────────────────────────────────────────────────────────
export const PROFILE_STATS = [
  { label: "Posts", value: "86" },
  { label: "Following", value: "241" },
  { label: "Followers", value: "3.2K" },
  { label: "Films", value: "312" },
];

export const BADGES = [
  {
    id: "b1",
    emoji: "🎬",
    label: "Cinephile",
    desc: "Watched 100 films",
    color: GOLD,
    unlocked: true,
  },
  {
    id: "b2",
    emoji: "🧠",
    label: "Quiz Master",
    desc: "100 quizzes completed",
    color: ACCENT,
    unlocked: true,
  },
  {
    id: "b3",
    emoji: "🔥",
    label: "On Fire",
    desc: "7-day watch streak",
    color: "#e84545",
    unlocked: true,
  },
  {
    id: "b4",
    emoji: "👥",
    label: "Builder",
    desc: "100 followers",
    color: "#3b82f6",
    unlocked: true,
  },
  {
    id: "b5",
    emoji: "✍️",
    label: "Contributor",
    desc: "50 reviews written",
    color: "#7c5cfc",
    unlocked: true,
  },
  {
    id: "b6",
    emoji: "⭐",
    label: "Top Critic",
    desc: "Review liked 500+ times",
    color: "#4d91ff",
    unlocked: false,
  },
  {
    id: "b7",
    emoji: "🏆",
    label: "Elite Critic",
    desc: "Reach Critic rank",
    color: GOLD,
    unlocked: false,
  },
  {
    id: "b8",
    emoji: "🌙",
    label: "Night Owl",
    desc: "Watch after midnight ×30",
    color: "#9b59b6",
    unlocked: false,
  },
  {
    id: "b9",
    emoji: "🎭",
    label: "Drama King",
    desc: "Watch 50 drama films",
    color: "#ec4899",
    unlocked: false,
  },
  {
    id: "b10",
    emoji: "👻",
    label: "Horror Fan",
    desc: "Watch 30 horror films",
    color: "#e84545",
    unlocked: false,
  },
];

export const ACTIVITY = [
  {
    type: "review",
    movie: "The Obsidian Protocol",
    rating: 9,
    timeAgo: "2h ago",
    image: MOVIES[0]?.image,
  },
  {
    type: "watchlist",
    movie: "Realm of Ash",
    timeAgo: "5h ago",
    image: MOVIES[1]?.image,
  },
  {
    type: "review",
    movie: "Nexus Rising",
    rating: 8,
    timeAgo: "1d ago",
    image: MOVIES[2]?.image,
  },
  {
    type: "like",
    movie: "Sakura Protocol",
    timeAgo: "2d ago",
    image: MOVIES[3]?.image,
  },
  {
    type: "watchlist",
    movie: "Hearts Aligned",
    timeAgo: "3d ago",
    image: MOVIES[4]?.image,
  },
];

export const QUIZ_HISTORY = [
  { title: "Sci-Fi Supremacy", score: 85, date: "Today", emoji: "🌌" },
  { title: "Daily Quiz – March 9", score: 100, date: "Today", emoji: "⚡" },
  { title: "Anime Cinema IQ", score: 72, date: "Yesterday", emoji: "⛩️" },
  {
    title: "Horror Through the Ages",
    score: 91,
    date: "3 days ago",
    emoji: "👻",
  },
  { title: "Directors' Cut", score: 68, date: "5 days ago", emoji: "🎬" },
];

export const Tab = "activity" | "watchlist" | "reviews" | "quizzes" | "badges";

export const ALL_GENRES = [
  { id: 1, label: "Action", emoji: "💥" },
  { id: 2, label: "Sci-Fi", emoji: "🚀" },
  { id: 3, label: "Horror", emoji: "👻" },
  { id: 4, label: "Romance", emoji: "💕" },
  { id: 5, label: "Thriller", emoji: "🔪" },
  { id: 6, label: "Fantasy", emoji: "🧙" },
  { id: 7, label: "Anime", emoji: "⛩️" },
  { id: 8, label: "Comedy", emoji: "😂" },
  { id: 9, label: "Drama", emoji: "🎭" },
  { id: 10, label: "Documentary", emoji: "🎥" },
  { id: 11, label: "Animation", emoji: "✨" },
  { id: 12, label: "Crime", emoji: "🕵️" },
];

export const GRADIENT_OPTIONS = [
  "linear-gradient(135deg, #f5c518, #e84545)",
  "linear-gradient(135deg, #3b82f6, #9b59b6)",
  "linear-gradient(135deg, #e91e8c, #9b59b6)",
  "linear-gradient(135deg, #2ecc71, #1abc9c)",
  "linear-gradient(135deg, #7c5cfc, #3b82f6)",
  "linear-gradient(135deg, #f5c518, #2ecc71)",
  "linear-gradient(135deg, #e84545, #f97316)",
  "linear-gradient(135deg, #ec4899, #8b5cf6)",
];
