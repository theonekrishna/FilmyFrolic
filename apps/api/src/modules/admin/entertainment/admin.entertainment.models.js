// ═══════════════════════════════════════════════════════════════════════════
// admin.entertainment.models.js
// ═══════════════════════════════════════════════════════════════════════════

const { supabase } = require("../../../configs/supabase");
const { v4: uuidv4 } = require("uuid");

const BUCKET = "game-media";

// ══════════════════════
// GET ALL GAMES
// ══════════════════════

exports.getAllGames = async ({ search, page, limit }) => {
  const from = (page - 1) * limit;

  const to = from + limit - 1;

  let query = supabase
    .from("games")
    .select(
      `
      id,
      title,
      description,
      difficulty,
      category,
      featured,
      status,
      is_deleted,
      created_at,
      user_id,

      profiles:user_id (
        id,
        name,
        username,
        avatar_url
      )
    `,
      {
        count: "exact",
      }
    )
    .eq("is_deleted", false);

  // SEARCH
  if (search?.trim()) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // ORDER + PAGINATION
  query = query
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  // MAPPING
  const mappedGames = await Promise.all(
    (data || []).map(async (game) => {
      // TOTAL QUESTIONS
      const { count: questionsCount, error: questionError } = await supabase
        .from("games_questions")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("game_id", game.id);

      if (questionError) {
        throw new Error(questionError.message);
      }

      // PLAYED USERS
      const { data: playedUsers, error: playedError } = await supabase
        .from("game_results")
        .select("percentage")
        .eq("game_id", game.id);

      if (playedError) {
        throw new Error(playedError.message);
      }

      // TOTAL USERS PLAYED
      const total_users_played = playedUsers?.length || 0;

      // TOTAL PLATFORM USERS
      const { count: total_platform_users, error: usersError } = await supabase
        .from("profiles")
        .select("*", {
          count: "exact",
          head: true,
        });

      if (usersError) {
        throw new Error(usersError.message);
      }

      // TOTAL PERCENTAGE
      const totalPercentage = (playedUsers || []).reduce(
        (sum, item) => sum + Number(item.percentage || 0),
        0
      );

      // AVERAGE PERCENTAGE
      const average_percentage =
        total_platform_users > 0 ? Number((totalPercentage / total_platform_users).toFixed(2)) : 0;

      return {
        id: game.id,

        title: game.title,

        description: game.description,

        difficulty: game.difficulty,

        category: game.category,

        featured: game.featured,

        status: game.status ? "active" : "inactive",

        total_questions: questionsCount || 0,

        total_users_played,

        average_percentage,

        created_by: game.profiles || null,

        created_at: game.created_at,
      };
    })
  );

  return {
    total: count || 0,

    page,

    limit,

    totalPages: Math.ceil((count || 0) / limit),

    data: mappedGames,
  };
};

// ══════════════════════
// CREATE GAME
// ══════════════════════

exports.createGame = async ({ title, description, difficulty, featured, category, user_id }) => {
  const normalizedDifficulty = difficulty.toLowerCase();

  const { data, error } = await supabase
    .from("games")
    .insert([
      {
        title,

        description,

        difficulty: normalizedDifficulty,

        category,

        featured: featured || false,

        status: true,

        is_deleted: false,

        user_id,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// ══════════════════════
// UPDATE GAME
// ══════════════════════

exports.updateGame = async (id, updates) => {
  if (updates.difficulty) {
    updates.difficulty = updates.difficulty.toLowerCase();
  }

  const { data, error } = await supabase
    .from("games")
    .update(updates)
    .eq("id", id)
    .eq("is_deleted", false)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Game not found");
  }

  return data;
};

// ══════════════════════
// DELETE GAME
// ══════════════════════

exports.deleteGame = async (id) => {
  const { error } = await supabase.from("games").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};

// ══════════════════════
// QUESTION LIMIT
// ══════════════════════

exports.checkQuestionLimit = async (game_id) => {
  const { count, error } = await supabase
    .from("games_questions")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("game_id", game_id);

  if (error) {
    throw new Error(error.message);
  }

  return count >= 10;
};

// ══════════════════════
// ADD QUESTION
// ══════════════════════

exports.addQuestion = async (payload) => {
  const { data, error } = await supabase
    .from("games_questions")
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// ══════════════════════
// UPDATE QUESTION
// ══════════════════════

exports.updateQuestion = async (id, updates) => {
  const { data, error } = await supabase
    .from("games_questions")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Question not found");
  }

  return data;
};

// ══════════════════════
// DELETE QUESTION
// ══════════════════════

exports.deleteQuestion = async (id) => {
  const { error } = await supabase.from("games_questions").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};

// ══════════════════════
// UPLOAD MEDIA
// ══════════════════════

exports.uploadMedia = async (file) => {
  const ext = file.originalname.split(".").pop();

  const fileName = `${uuidv4()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(fileName, file.buffer, {
    contentType: file.mimetype,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

  return {
    publicUrl: data.publicUrl,

    extension: ext.toLowerCase(),
  };
};

// ══════════════════════
// GET SINGLE GAME
// ══════════════════════

exports.getSingleGame = async (id) => {
  // GAME
  const { data: game, error } = await supabase
    .from("games")
    .select(
      `
      id,
      title,
      description,
      difficulty,
      category,
      featured,
      status,
      created_at,
      user_id,

      profiles:user_id (
        id,
        name,
        username,
        avatar_url
      )
    `
    )
    .eq("id", id)
    .eq("is_deleted", false)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!game) {
    throw new Error("Game not found");
  }

  // QUESTIONS
  const { data: questions, error: questionsError } = await supabase
    .from("games_questions")
    .select(
      `
      id,
      question_text,
      question_type,
      media_url,
      options,
      correct_answer,
      created_at
    `
    )
    .eq("game_id", id)
    .order("created_at", {
      ascending: true,
    });

  if (questionsError) {
    throw new Error(questionsError.message);
  }

  return {
    id: game.id,

    title: game.title,

    description: game.description,

    difficulty: game.difficulty,

    category: game.category,

    featured: game.featured,

    status: game.status ? "active" : "inactive",

    created_by: game.profiles || null,

    total_questions: questions?.length || 0,

    created_at: game.created_at,

    questions: questions || [],
  };
};

// ══════════════════════
// TOGGLE FEATURED
// ══════════════════════

exports.toggleFeatured = async (id) => {
  // CURRENT GAME
  const { data: game, error: fetchError } = await supabase
    .from("games")
    .select(
      `
      id,
      featured
    `
    )
    .eq("id", id)
    .eq("is_deleted", false)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!game) {
    throw new Error("Game not found");
  }

  // TOGGLE
  const { data, error } = await supabase
    .from("games")
    .update({
      featured: !game.featured,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// ══════════════════════
// TOGGLE GAME STATUS
// ══════════════════════

exports.toggleGameStatus = async (id) => {
  // CURRENT GAME
  const { data: game, error: fetchError } = await supabase
    .from("games")
    .select(
      `
      id,
      status
    `
    )
    .eq("id", id)
    .eq("is_deleted", false)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!game) {
    throw new Error("Game not found");
  }

  // TOGGLE STATUS
  const { data, error } = await supabase
    .from("games")
    .update({
      status: !game.status,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// ══════════════════════
// SOFT DELETE GAME
// ══════════════════════

exports.softDeleteGame = async (id) => {
  const { data, error } = await supabase
    .from("games")
    .update({
      is_deleted: true,
    })
    .eq("id", id)
    .eq("is_deleted", false)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Game not found");
  }

  return data;
};

// ══════════════════════
// GET ALL MEMES
// ══════════════════════

exports.getAllMemes = async ({ search, status, page, limit }) => {
  const from = (page - 1) * limit;

  const to = from + limit - 1;

  let query = supabase
    .from("memes")
    .select(
      `
      id,
      title,
      image_url,
      movie_ref,
      format,
      text_content,
      tags,
      status,
      is_trending,
      share_count,
      created_at,
      created_by,

      profiles:created_by (
        id,
        name,
        username,
        display_name,
        avatar_url
      )
    `,
      {
        count: "exact",
      }
    )
    .eq("is_deleted", false);

  // SEARCH
  if (search?.trim()) {
    query = query.or(`title.ilike.%${search}%,movie_ref.ilike.%${search}%`);
  }

  // STATUS FILTER
  if (status?.trim()) {
    query = query.eq("status", status);
  }

  // ORDER + PAGINATION
  query = query
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  // TOTAL PENDING MEMES
  const { count: totalPending, error: pendingError } = await supabase
    .from("memes")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("is_deleted", false)
    .eq("status", "pending");

  if (pendingError) {
    throw new Error(pendingError.message);
  }

  // MAP DATA
  const mappedMemes = (data || []).map((meme) => {
    return {
      id: meme.id,

      title: meme.title,

      image_url: meme.image_url,

      movie_ref: meme.movie_ref,

      format: meme.format,

      text_content: meme.text_content,

      tags: meme.tags || [],

      status: meme.status,

      is_trending: meme.is_trending,

      share_count: meme.share_count || 0,

      created_by: meme.profiles || null,

      created_at: meme.created_at,
    };
  });

  return {
    total: count || 0,

    totalPending: totalPending || 0,

    page,

    limit,

    totalPages: Math.ceil((count || 0) / limit),

    data: mappedMemes,
  };
};

// ══════════════════════
// UPDATE MEME STATUS
// ══════════════════════

exports.updateMemeStatus = async ({ meme_id, status, admin_id }) => {
  // CHECK MEME
  const { data: existingMeme, error: fetchError } = await supabase
    .from("memes")
    .select("id, status")
    .eq("id", meme_id)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!existingMeme) {
    throw new Error("Meme not found");
  }

  // UPDATE STATUS
  const { data, error } = await supabase
    .from("memes")
    .update({
      status,
      reviewed_by: admin_id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", meme_id)
    .select(
      `
      id,
      title,
      image_url,
      status,
      reviewed_by,
      reviewed_at
    `
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
