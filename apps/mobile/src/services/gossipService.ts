import apiClient from "./apiClient";
import type { Gossip } from "@filmyfrolic/types";

export const MOCK_GOSSIP: Gossip[] = [
  {
    id: "g1",
    title: "Nolan Teases Next Sci-Fi Project in Tokyo Studio Visit",
    content: "Reports confirm Christopher Nolan has begun pre-production on an original IMAX sci-fi epic involving time dilation and deep sea exploration.",
    author: "CinemaSpy",
    category: "Nolan",
    publishedAt: "2 hours ago",
    likesCount: 3420,
    commentsCount: 284,
    imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800",
  },
  {
    id: "g2",
    title: "Secret Marvel Cameo Leaked Ahead of Summer Blockbuster",
    content: "Insiders reveal a fan-favorite X-Men character makes a surprise appearance in the upcoming multiverse climax.",
    author: "GeekInsider",
    category: "Marvel",
    publishedAt: "5 hours ago",
    likesCount: 5120,
    commentsCount: 620,
    imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800",
  },
  {
    id: "g3",
    title: "Prabhas & Rajamouli Re-Unite for Massive Fantasy Franchise",
    content: "Following the historic success of Baahubali, the powerhouse duo is rumored to collaborate on an international mythical epic.",
    author: "TollywoodTracker",
    category: "Tollywood",
    publishedAt: "1 day ago",
    likesCount: 8900,
    commentsCount: 1140,
    imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800",
  },
];

export const gossipService = {
  async getTrendingGossip(): Promise<Gossip[]> {
    try {
      const res = await apiClient.get("/api/gossips/trending");
      return res.data.gossip || MOCK_GOSSIP;
    } catch {
      return MOCK_GOSSIP;
    }
  },
};
