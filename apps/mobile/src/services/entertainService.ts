import apiClient from "./apiClient";
import type { Quiz, Meme } from "@filmyfrolic/types";

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: "q1",
    title: "Sci-Fi Mastermind Blitz",
    category: "Sci-Fi",
    questionsCount: 10,
    playsCount: 28400,
    avgScore: 78,
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800",
  },
  {
    id: "q2",
    title: "Guess the Movie from One Shot",
    category: "Trivia",
    questionsCount: 8,
    playsCount: 19200,
    avgScore: 64,
    imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800",
  },
];

export const MOCK_MEMES: Meme[] = [
  {
    id: "mem1",
    title: "When Nolan explains the plot timeline",
    imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800",
    author: "MemeLord99",
    upvotes: 4200,
    submittedAt: "1 day ago",
  },
  {
    id: "mem2",
    title: "Me waiting for the 3-hour movie without bathroom breaks",
    imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800",
    author: "CinematicGenZ",
    upvotes: 3100,
    submittedAt: "2 days ago",
  },
];

export const entertainService = {
  async getQuizzes(): Promise<Quiz[]> {
    try {
      const res = await apiClient.get("/api/games/quizzes");
      return res.data.quizzes || MOCK_QUIZZES;
    } catch {
      return MOCK_QUIZZES;
    }
  },

  async getMemes(): Promise<Meme[]> {
    try {
      const res = await apiClient.get("/api/memes");
      return res.data.memes || MOCK_MEMES;
    } catch {
      return MOCK_MEMES;
    }
  },
};
