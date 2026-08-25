const { supabaseAdmin } = require("../../configs/supabase");

const SAFE_PUBLIC_FIELDS =
  "id, username, display_name, bio, website, avatar_url, avatar_color, created_at";
const MY_PROFILE_FIELDS =
  "id, username, display_name, bio, website, avatar_url, avatar_color, created_at, updated_at";

const ProfileModel = {
  // ─── GET ───────────────────────────────────────────────

  async getById(userId) {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select(MY_PROFILE_FIELDS)
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  },

  async getByUsername(username) {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select(SAFE_PUBLIC_FIELDS)
      .eq("username", username)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  },

  async isUsernameTaken(username, excludeUserId) {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", excludeUserId)
      .single();

    return !!data;
  },

  // ─── POST COUNT ────────────────────────────────────────
  // Counts posts from both `feeds` and `posts` (community posts) tables.
  // feeds uses deleted_at (soft delete); posts uses is_deleted flag.

  // async getTotalPostCount(userId) {
  //   const [feedsResult, postsResult] = await Promise.all([
  //     supabaseAdmin
  //       .from('feeds')
  //       .select('*', { count: 'exact', head: true })
  //       .eq('user_id', userId)
  //       .is('deleted_at', null),

  //     supabaseAdmin
  //       .from('posts')
  //       .select('*', { count: 'exact', head: true })
  //       .eq('user_id', userId)
  //       .eq('is_deleted', false),
  //   ]);

  //   if (feedsResult.error) throw feedsResult.error;
  //   if (postsResult.error) throw postsResult.error;

  //   return (feedsResult.count ?? 0) + (postsResult.count ?? 0);
  // },

  async getTotalPostCount(userId) {
    const [feedsResult, gossipsResult, memesResult] = await Promise.all([
      supabaseAdmin
        .from("feeds")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .is("deleted_at", null),

      supabaseAdmin
        .from("gossips")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),

      supabaseAdmin
        .from("memes")
        .select("*", { count: "exact", head: true })
        .eq("created_by", userId)
        .eq("is_deleted", false),
    ]);

    if (feedsResult.error) throw feedsResult.error;
    if (gossipsResult.error) throw gossipsResult.error;
    if (memesResult.error) throw memesResult.error;

    return (feedsResult.count ?? 0) + (gossipsResult.count ?? 0) + (memesResult.count ?? 0);
  },

  // ─── UPDATE INFO ───────────────────────────────────────

  async updateInfo(userId, updates) {
    // keep name column in sync
    if (updates.display_name !== undefined) {
      updates.name = updates.display_name;
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select(MY_PROFILE_FIELDS)
      .single();

    if (error) throw error;
    return data;
  },

  // ─── AVATAR COLOR ──────────────────────────────────────

  async updateAvatarColor(userId, avatarColor) {
    // reconstruct gradient string to keep legacy `gradient` column in sync
    let gradientString = null;
    try {
      const hex = JSON.parse(avatarColor);
      if (Array.isArray(hex) && hex.length === 2) {
        gradientString = `linear-gradient(135deg, ${hex[0]}, ${hex[1]})`;
      }
    } catch {}

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({
        avatar_color: avatarColor,
        ...(gradientString ? { gradient: gradientString } : {}),
      })
      .eq("id", userId)
      .select(MY_PROFILE_FIELDS)
      .single();

    if (error) throw error;
    return data;
  },
  // ─── AVATAR FILE UPLOAD ────────────────────────────────

  async getCurrentAvatarUrl(userId) {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data?.avatar_url || null;
  },

  async updateAvatarUrl(userId, avatarUrl) {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", userId)
      .select(MY_PROFILE_FIELDS)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteOldAvatar(avatarUrl) {
    if (!avatarUrl) return;
    const parts = avatarUrl.split("/avatars/");
    if (!parts[1]) return;

    await supabaseAdmin.storage.from("avatars").remove([parts[1]]);
  },

  // ─── GENRES ────────────────────────────────────────────

  async getAllGenres() {
    const { data, error } = await supabaseAdmin
      .from("genres")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  },

  async getMyGenres(userId) {
    const { data, error } = await supabaseAdmin
      .from("user_genres")
      .select(
        `
        genre_id,
        genres (
          id,
          name
        )
      `
      )
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  },

  async replaceGenres(userId, genreIds) {
    if (genreIds.length === 0) {
      const { error } = await supabaseAdmin.from("user_genres").delete().eq("user_id", userId);
      if (error) throw error;
      return [];
    }

    const insertData = genreIds.map((id) => ({
      user_id: userId,
      genre_id: id,
    }));

    const { error: deleteError } = await supabaseAdmin
      .from("user_genres")
      .delete()
      .eq("user_id", userId);
    if (deleteError) throw deleteError;

    const { data, error: insertError } = await supabaseAdmin
      .from("user_genres")
      .insert(insertData)
      .select(`genre_id, genres ( id, name )`);

    if (insertError) throw insertError;
    return data;
  },

  async validateGenreIds(genreIds) {
    const { data, error } = await supabaseAdmin.from("genres").select("id").in("id", genreIds);

    if (error) throw error;
    return data.length === genreIds.length;
  },
};

module.exports = ProfileModel;
