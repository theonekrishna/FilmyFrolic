import apiClient from "./apiClient";
import type { Community, Room } from "@filmyfrolic/types";

export const MOCK_COMMUNITIES: Community[] = [
  {
    id: "c1",
    name: "Nolan Cinematic Universe",
    description:
      "Deep discussions on Inception, Tenet, Oppenheimer & Interstellar timeline theories.",
    membersCount: 14200,
    category: "Director Focus",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800",
    isJoined: true,
  },
  {
    id: "c2",
    name: "Tollywood Blockbuster Hub",
    description: "Celebrations, fan theories, and release updates for Indian regional cinema.",
    membersCount: 22400,
    category: "Regional Cinema",
    bannerUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800",
    isJoined: false,
  },
];

export const MOCK_ROOMS: Room[] = [
  {
    id: "r1",
    title: "Interstellar 10th Anniversary Live Watch-Along",
    host: "AlexNolanFan",
    activeViewers: 84,
    status: "live",
    currentMovie: "Interstellar",
  },
  {
    id: "r2",
    title: "Anime Movie Music & Soundtrack Lounge",
    host: "OtakuCinema",
    activeViewers: 42,
    status: "live",
    currentMovie: "Your Name",
  },
];

export const socialService = {
  async getCommunities(): Promise<Community[]> {
    try {
      const res = await apiClient.get("/api/communities");
      return res.data.communities || MOCK_COMMUNITIES;
    } catch {
      return MOCK_COMMUNITIES;
    }
  },

  async getRooms(): Promise<Room[]> {
    try {
      const res = await apiClient.get("/api/rooms");
      return res.data.rooms || MOCK_ROOMS;
    } catch {
      return MOCK_ROOMS;
    }
  },
};
