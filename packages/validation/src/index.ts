import { z } from "zod";

// ── 1. Auth Schemas ──────────────────────────────────────────────────────────
export const signupSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be 30 characters or fewer")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ── 2. Gossip Schemas ────────────────────────────────────────────────────────
export const gossipCategories = [
  "breaking",
  "rumour",
  "paparazzi",
  "interview",
  "drama",
  "hottake",
] as const;

export const gossipReactions = ["fire", "shocked"] as const;

export const createGossipSchema = z.object({
  headline: z.string().min(1, "Headline is required").max(300, "Headline max 300 characters"),
  excerpt: z.string().min(1, "Excerpt is required").max(1000, "Excerpt max 1000 characters"),
  category: z.enum(gossipCategories),
  tags: z.array(z.string().min(1)).max(10).optional(),
});

export const gossipReactionSchema = z.object({
  reaction: z.enum(gossipReactions),
});

// ── 3. Post / Feed Schemas ────────────────────────────────────────────────────
export const createPostSchema = z.object({
  content: z.string().min(1, "Post content is required").max(2000, "Post max 2000 characters"),
  media_url: z.string().url("Invalid media URL").optional().nullable(),
  movie_id: z.number().optional().nullable(),
});

// ── 4. Community Schemas ──────────────────────────────────────────────────────
export const createCommunitySchema = z.object({
  name: z.string().min(3, "Community name must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  category: z.string().min(2, "Category is required"),
  is_private: z.boolean().default(false),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateGossipInput = z.infer<typeof createGossipSchema>;
export type GossipReactionInput = z.infer<typeof gossipReactionSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommunityInput = z.infer<typeof createCommunitySchema>;
