const { supabaseAdmin } = require("../../configs/supabase");

exports.getWatchlist = async (userId, page = 1, limit = 20) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabaseAdmin
    .from("watchlists")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      hasNextPage: page < Math.ceil(count / limit),
      hasPreviousPage: page > 1,
    },
  };
};

exports.toggleWatchlist = async (userId, movieId) => {
  const { data: existing } = await supabaseAdmin
    .from("watchlists")
    .select("id")
    .eq("user_id", userId)
    .eq("movie_id", movieId)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin.from("watchlists").delete().eq("id", existing.id);

    return {
      is_watchlist: false,
      message: "Removed from watchlist",
    };
  }

  await supabaseAdmin.from("watchlists").insert({
    user_id: userId,
    movie_id: movieId,
  });

  return {
    is_watchlist: true,
    message: "Added to watchlist",
  };
};

exports.isWatchlist = async (userId, movieId) => {
  const { data, error } = await supabaseAdmin
    .from("watchlists")
    .select("id")
    .eq("user_id", userId)
    .eq("movie_id", movieId)
    .maybeSingle();

  if (error) throw error;

  return !!data;
};
