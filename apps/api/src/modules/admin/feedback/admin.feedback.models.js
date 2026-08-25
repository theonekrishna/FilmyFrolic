const { supabase } = require("../../../configs/supabase");

exports.getFeedbacks = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
  contentType,
  sortBy = "created_at",
  order = "desc",
}) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from("content_feedback").select(
    `
      id,
      content_type,
      content_id,
      feedback_type,
      priority,
      message,
      suggested_correction,
      status,
      created_at,
      reviewed_at,
      user_id
    `,
    {
      count: "exact",
    }
  );

  // STATUS FILTER
  if (status) {
    query = query.eq("status", status);
  }

  // CONTENT TYPE FILTER
  if (contentType) {
    query = query.eq("content_type", contentType);
  }

  // SEARCH
  if (search) {
    query = query.or(`
      message.ilike.%${search}%,
      feedback_type.ilike.%${search}%,
      content_type.ilike.%${search}%
    `);
  }

  const { data, count, error } = await query
    .order(sortBy, {
      ascending: order === "asc",
    })
    .range(from, to);

  if (error) {
    throw error;
  }

  return {
    total: count,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
    data,
  };
};

exports.approveFeedback = async ({ feedbackId, adminId }) => {
  const { data: feedback, error } = await supabase
    .from("content_feedback")
    .select("id, status")
    .eq("id", feedbackId)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to fetch feedback");
  }

  if (!feedback) {
    throw new Error("Feedback not found");
  }

  if (feedback.status === "approved") {
    throw new Error("Feedback is already approved");
  }

  if (feedback.status === "rejected") {
    throw new Error("Rejected feedback cannot be approved");
  }

  const { data, error: updateError } = await supabase
    .from("content_feedback")
    .update({
      status: "approved",
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", feedbackId)
    .select()
    .single();

  if (updateError) {
    throw new Error("Failed to approve feedback");
  }

  return data;
};

exports.rejectFeedback = async ({ feedbackId, adminId }) => {
  const { data: feedback, error } = await supabase
    .from("content_feedback")
    .select(
      `
          id,
          status,
          feedback_type
        `
    )
    .eq("id", feedbackId)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to fetch feedback");
  }

  if (!feedback) {
    throw new Error("Feedback not found");
  }

  if (feedback.status === "rejected") {
    throw new Error("Feedback is already rejected");
  }

  if (feedback.status === "approved") {
    throw new Error("Approved feedback cannot be rejected");
  }

  const { data, error: updateError } = await supabase
    .from("content_feedback")
    .update({
      status: "rejected",
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", feedbackId)
    .select()
    .single();

  if (updateError) {
    throw new Error("Failed to reject feedback");
  }

  return data;
};
