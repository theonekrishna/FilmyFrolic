const { supabase } = require("../../configs/supabase.js");
const { v4: uuidv4 } = require("uuid");

const BUCKET = "game-media";

const shuffle = (arr) => {
  // Fisher-Yates (correct shuffle)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const GameService = {
  // ================= GAME =================

  async getAllGames() {
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .eq("status", true)
      .eq("is_deleted", false)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return data;
  },

  async getGameById(id) {
    const { data, error } = await supabase
      .from("games")
      .select(
        `
        id, title, description, difficulty, created_at,
        games_questions (
          id, question_text, options, media_url, question_type
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteGame(id) {
    const { error } = await supabase.from("games").delete().eq("id", id);

    if (error) throw error;
  },

  // ================= QUESTIONS =================

  async checkQuestionLimit(game_id) {
    const { count, error } = await supabase
      .from("games_questions")
      .select("*", { count: "exact", head: true })
      .eq("game_id", game_id);

    if (error) throw error;
    return count >= 10;
  },

  async addQuestion(payload) {
    const { data, error } = await supabase.from("games_questions").insert([payload]).select();

    if (error) throw error;
    return data[0];
  },

  async getQuestionsByGame(game_id) {
    const { data, error } = await supabase
      .from("games_questions")
      .select("id, question_text, options, media_url, question_type")
      .eq("game_id", game_id);

    if (error) throw error;

    return shuffle(data); // ✅ fixed shuffle
  },

  async deleteQuestion(id) {
    const { error } = await supabase.from("games_questions").delete().eq("id", id);

    if (error) throw error;
  },

  async updateQuestion(id, updates) {
    const { data, error } = await supabase
      .from("games_questions")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  },

  // ================= MEDIA =================

  async uploadMedia(file) {
    const ext = file.originalname.split(".").pop();
    const fileName = `${uuidv4()}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(fileName, file.buffer, {
      contentType: file.mimetype,
    });

    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

    return {
      publicUrl: data.publicUrl,
      extension: ext.toLowerCase(),
    };
  },

  // ================= RESULTS =================

  async processSubmission(game_id, answers, user_id) {
    // 🔒 already played
    const { data: existing, error } = await supabase
      .from("game_results")
      .select("score,total,percentage,created_at")
      .eq("game_id", game_id)
      .eq("user_id", user_id)
      .maybeSingle();

    if (error) throw error;

    if (existing) {
      return {
        alreadyPlayed: true,
        score: existing.score,
        total: existing.total,
        percentage: existing.percentage,
      };
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      throw new Error("Invalid answers format");
    }

    const ids = [...new Set(answers.map((a) => a.question_id))];
    const { data: dbQuestions, error: questionsError } = await supabase
      .from("games_questions")
      .select("id, correct_answer")
      .in("id", ids);

    if (questionsError) throw questionsError;

    if (!dbQuestions || dbQuestions.length !== answers.length) {
      throw new Error("Invalid questions");
    }

    let score = 0;
    const marksPerQuestion = 10;

    answers.forEach((a) => {
      const q = dbQuestions.find((q) => String(q.id) === String(a.question_id));

      if (q && parseInt(a.selected) === parseInt(q.correct_answer)) {
        score += marksPerQuestion;
      }
    });

    const total = dbQuestions.length * marksPerQuestion;
    const percentage = Number(((score / total) * 100).toFixed(2));

    // ⚠️ best effort consistency (Supabase doesn't support full transaction here)
    const { error: insertError } = await supabase
      .from("game_results")
      .insert([{ game_id, user_id, score, total, percentage }]);

    if (insertError) throw insertError;

    const { error: rpcError } = await supabase.rpc("add_score", {
      p_user_id: user_id,
      p_score: score,
    });

    if (rpcError) {
      console.error("Score update failed:", rpcError.message);
    }

    return {
      alreadyPlayed: false,
      score,
      total,
      percentage,
    };
  },

  async getGameResults(game_id, user_id) {
    const { data, error } = await supabase
      .from("game_results")
      .select("score, total, percentage, created_at")
      .eq("game_id", game_id)
      .eq("user_id", user_id);

    if (error) throw error;
    return data;
  },

  async getGameStatus(game_id, user_id) {
    const { data, error } = await supabase
      .from("game_results")
      .select("score, total, percentage")
      .eq("game_id", game_id)
      .eq("user_id", user_id)
      .maybeSingle();

    if (error) throw error;

    return data
      ? { status: true, alreadyPlayed: true, summary: data }
      : { status: false, alreadyPlayed: false, summary: null };
  },

  // ================= LEADERBOARD =================

  async getGameLeaderboard(game_id) {
    const { data, error } = await supabase
      .from("game_results")
      .select(
        `
        score,
        percentage,
        user_id,
        profiles (
          id,
          username,
          avatar_url
        )
      `
      )
      .eq("game_id", game_id)
      .order("score", { ascending: false })
      .order("percentage", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data;
  },

  async getGlobalLeaderboard() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, total_score")
      .order("total_score", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data;
  },
};

module.exports = GameService;
