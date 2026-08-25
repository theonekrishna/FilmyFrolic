// ─── Game Service ──────────────────────────────────────────────────────────────
// All game-related API calls. Uses privateAxios (auth token auto-attached).

import { privateAxios, publicAxios } from "../../utils/AxiosInstance";

const BASE = "/api/games";

// ── Games ─────────────────────────────────────────────────────────────────────

/**
 * Fetch all games.
 * GET /api/games
 * @returns {Promise<Array>} array of game objects
 */
export async function getAllGames() {
  const res = await publicAxios.get(BASE); // public – no auth needed
  return res.data.data ?? res.data;
}

/**
 * Fetch a single game with its questions.
 * GET /api/games/:id
 * @param {string} gameId
 * @returns {Promise<Object>} game object with games_questions array
 */
export async function getGameById(gameId) {
  const res = await privateAxios.get(`${BASE}/${gameId}`);
  return res.data.data ?? res.data;
}

/**
 * Delete a game.
 * DELETE /api/games/:id
 * @param {string} gameId
 */
export async function deleteGame(gameId) {
  const res = await privateAxios.delete(`${BASE}/${gameId}`);
  return res.data;
}

// ── Questions ─────────────────────────────────────────────────────────────────

/**
 * Fetch questions for a game.
 * GET /api/games/:game_id/questions
 * @param {string} gameId
 * @returns {Promise<Array>} array of question objects
 */
export async function getQuestions(gameId) {
  const res = await privateAxios.get(`${BASE}/${gameId}/questions`);
  return res.data.data ?? res.data;
}

// ── Submission ────────────────────────────────────────────────────────────────

/**
 * Submit answers for a game.
 * POST /api/games/:game_id/submit
 * @param {string} gameId
 * @param {Array<{question_id: string, selected: number}>} answers
 * @returns {Promise<{summary: {score, total, percentage}, result: Object}>}
 */
export async function submitGame(gameId, answers) {
  try {
    const res = await privateAxios.post(`${BASE}/${gameId}/submit`, { answers });
    return res.data;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.alreadyPlayed !== undefined) {
      return err.response.data;
    }
    throw err;
  }
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

/**
 * Fetch game leaderboard.
 * GET /api/games/:game_id/leaderboard
 * @param {string} gameId
 * @returns {Promise<Array<{score, percentage, user_id, profiles}>>}
 */
export async function getGameLeaderboard(gameId) {
  const res = await privateAxios.get(`${BASE}/${gameId}/leaderboard`);
  return res.data?.data ?? res.data ?? [];
}

/**
 * Fetch global leaderboard.
 * GET /api/games/leaderboard/global
 * @returns {Promise<Array<{id, username, avatar_url, total_score}>>}
 */
export async function getGlobalLeaderboard() {
  const res = await publicAxios.get(`${BASE}/leaderboard/global`); // public – no auth needed
  return res.data?.data ?? res.data ?? [];
}

// ── Results ───────────────────────────────────────────────────────────────────

/**
 * Fetch game status to check if user has played.
 * GET /api/games/:game_id/status
 * @param {string} gameId
 * @returns {Promise<{alreadyPlayed: boolean, summary: {score, total, percentage}}>}
 */
export async function getGameStatus(gameId) {
  const res = await privateAxios.get(`${BASE}/${gameId}/status`);
  const data = res.data?.data ?? res.data ?? null;
  // Return in format: { alreadyPlayed, summary: {score, total, percentage} }
  return data;
}

/**
 * Fetch results for a game.
 * GET /api/games/:game_id/results
 * @param {string} gameId
 * @returns {Promise<Array<{score, percentage}>>}
 */
export async function getGameResults(gameId) {
  try {
    const res = await privateAxios.get(`${BASE}/${gameId}/results`);
    // Handle both { data: [...] } wrapped and direct array responses
    const responseData = res?.data;
    const results = responseData?.data ?? responseData ?? [];
    return Array.isArray(results) ? results : [];
  } catch (err) {
    // If 404 or other error, return empty array (no results yet)
    return [];
  }
}
