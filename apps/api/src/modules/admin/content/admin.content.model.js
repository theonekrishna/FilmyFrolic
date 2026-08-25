// ═══════════════════════════════════════════════════════════════════════════
// admin.content.model.js
// ═══════════════════════════════════════════════════════════════════════════

const crypto = require("crypto");

const { supabase } = require("../../../configs/supabase");

// ═══════════════════════════════════════════════════════════════════════════
// GET ALL GOSSIPS
// ═══════════════════════════════════════════════════════════════════════════

exports.getAllGossips = async ({
  page = 1,
  limit = 10,
  search = "",
  sortBy = "created_at",
  sortOrder = "desc",
}) => {
  // SAFE LIMIT
  limit = Math.min(Number(limit), 50);

  // PAGINATION
  const from = (page - 1) * limit;

  const to = from + limit - 1;

  // SAFE SEARCH
  const safeSearch = search.replace(/[%(),]/g, "");

  // BASE QUERY
  let query = supabase
    .from("gossips")
    .select(
      `
      id,
      headline,
      excerpt,
      source,
      category,
      verified,
      image_url,
      tags,
      fire_count,
      is_published,
      shocked_count,
      comments_count,
      created_at,
      updated_at,
      user_id
      `,
      {
        count: "exact",
      }
    )
    .eq("is_deleted", false);

  // SEARCH
  if (safeSearch) {
    query = query.or(
      `headline.ilike.%${safeSearch}%,excerpt.ilike.%${safeSearch}%,source.ilike.%${safeSearch}%`
    );
  }

  // SORTING
  const allowedSortFields = ["created_at", "fire_count", "comments_count", "headline"];

  const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : "created_at";

  query = query.order(finalSortBy, {
    ascending: sortOrder === "asc",
  });

  // PAGINATION
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return {
    data,

    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// TOGGLE PUBLISH STATUS
// ═══════════════════════════════════════════════════════════════════════════

exports.togglePublishStatus = async (gossipId) => {
  // CHECK EXISTING
  const { data: existingData, error: fetchError } = await supabase
    .from("gossips")
    .select("id, is_published")
    .eq("id", gossipId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (!existingData) {
    throw new Error("Gossip not found");
  }

  // TOGGLE STATUS
  const newStatus = !existingData.is_published;

  // UPDATE
  const { error: updateError } = await supabase
    .from("gossips")
    .update({
      is_published: newStatus,

      updated_at: new Date().toISOString(),
    })
    .eq("id", gossipId);

  if (updateError) {
    throw updateError;
  }

  // FETCH UPDATED DATA
  const { data: updatedData, error: updatedFetchError } = await supabase
    .from("gossips")
    .select("*")
    .eq("id", gossipId)
    .maybeSingle();

  if (updatedFetchError) {
    throw updatedFetchError;
  }

  return updatedData;
};

// ═══════════════════════════════════════════════════════════════════════════
// TOGGLE VERIFY STATUS
// ═══════════════════════════════════════════════════════════════════════════

exports.toggleVerifyGossip = async (gossipId) => {
  // CHECK EXISTING
  const { data: existingData, error: fetchError } = await supabase
    .from("gossips")
    .select("id, verified")
    .eq("id", gossipId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (!existingData) {
    throw new Error("Gossip not found");
  }

  // TOGGLE STATUS
  const newVerifiedStatus = !existingData.verified;

  // UPDATE
  const { error: updateError } = await supabase
    .from("gossips")
    .update({
      verified: newVerifiedStatus,

      updated_at: new Date().toISOString(),
    })
    .eq("id", gossipId);

  if (updateError) {
    throw updateError;
  }

  // FETCH UPDATED DATA
  const { data: updatedData, error: updatedFetchError } = await supabase
    .from("gossips")
    .select("*")
    .eq("id", gossipId)
    .maybeSingle();

  if (updatedFetchError) {
    throw updatedFetchError;
  }

  return updatedData;
};

// ═══════════════════════════════════════════════════════════════════════════
// EDIT GOSSIP
// ═══════════════════════════════════════════════════════════════════════════

exports.editGossip = async (gossipId, payload, file = null) => {
  // CHECK EXISTING
  const { data: existing, error: fetchError } = await supabase
    .from("gossips")
    .select("*")
    .eq("id", gossipId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (!existing) {
    throw new Error("Gossip not found");
  }

  let finalImageUrl = existing.image_url;

  // IMAGE UPLOAD
  if (file) {
    // DELETE OLD IMAGE
    if (existing.image_url) {
      try {
        const url = new URL(existing.image_url);

        const pathParts = url.pathname.split("/object/public/gossip-images/");

        if (pathParts[1]) {
          await supabase.storage.from("gossip-images").remove([pathParts[1]]);
        }
      } catch (err) {
        console.warn("Old image delete failed:", err.message);
      }
    }

    // FILE INFO
    const fileExt = file.originalname.split(".").pop();

    // UNIQUE FILE NAME
    const fileName = `${crypto.randomUUID()}-${Date.now()}.${fileExt}`;

    // FILE PATH
    const filePath = `public/${fileName}`;

    // UPLOAD
    const { error: uploadError } = await supabase.storage
      .from("gossip-images")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,

        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // PUBLIC URL
    const { data } = supabase.storage.from("gossip-images").getPublicUrl(filePath);

    finalImageUrl = data.publicUrl;
  }

  // UPDATE PAYLOAD
  const updateData = {
    headline: payload.headline?.trim() ?? existing.headline,

    excerpt: payload.excerpt?.trim() ?? existing.excerpt,

    category: payload.category ?? existing.category,

    source: payload.source ?? existing.source,

    verified: payload.verified ?? existing.verified,

    is_published: payload.is_published ?? existing.is_published,

    tags: Array.isArray(payload.tags)
      ? payload.tags
      : payload.tags
        ? payload.tags.split(",").map((tag) => tag.trim())
        : existing.tags,

    image_url: finalImageUrl,

    updated_at: new Date().toISOString(),
  };

  // UPDATE
  const { error: updateError } = await supabase
    .from("gossips")
    .update(updateData)
    .eq("id", gossipId);

  if (updateError) {
    throw updateError;
  }

  // FETCH UPDATED DATA
  const { data: updatedData, error: updatedFetchError } = await supabase
    .from("gossips")
    .select("*")
    .eq("id", gossipId)
    .maybeSingle();

  if (updatedFetchError) {
    throw updatedFetchError;
  }

  return updatedData;
};

// ═══════════════════════════════════════════════════════════════════════════
// DELETE GOSSIP
// ═══════════════════════════════════════════════════════════════════════════

exports.deleteGossip = async (gossipId) => {
  // CHECK EXISTING
  const { data: existingData, error: fetchError } = await supabase
    .from("gossips")
    .select("id, headline")
    .eq("id", gossipId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (!existingData) {
    throw new Error("Gossip not found");
  }

  // SOFT DELETE
  const { error: updateError } = await supabase
    .from("gossips")
    .update({
      is_deleted: true,

      updated_at: new Date().toISOString(),
    })
    .eq("id", gossipId);

  if (updateError) {
    throw updateError;
  }

  return {
    id: gossipId,
    headline: existingData.headline,
    is_deleted: true,
  };
};
