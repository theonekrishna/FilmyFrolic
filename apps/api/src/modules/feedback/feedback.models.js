const { supabase } = require("../../configs/supabase");

exports.submitFeedback = async ({
  userId,
  contentType,
  contentId,
  feedbackType,
  priority = "medium",
  message,
  suggestedCorrection = null,
}) => {
  const { data, error } = await supabase
    .from("content_feedback")
    .insert([
      {
        user_id: userId,
        content_type: contentType,
        content_id: contentId,
        feedback_type: feedbackType,
        priority,
        message: message?.trim(),
        suggested_correction: suggestedCorrection,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

exports.checkFeedbackExists = async ({ userId, contentType, contentId }) => {
  const { data, error } = await supabase
    .from("content_feedback")
    .select(
      `
      id,
      feedback_type,
      priority,
      message,
      suggested_correction,
      status,
      created_at
    `
    )
    .eq("user_id", userId)
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

exports.getMyFeedback = async (userId) => {
  const { data, error } = await supabase
    .from("content_feedback")
    .select(
      `
      id,
      content_type,
      content_id,
      feedback_type,
      priority,
      message,
      suggested_correction,
      status,
      created_at
    `
    )
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data;
};
