const { supabase } = require("../../configs/supabase");

exports.createReport = async ({
  reported_by,
  module_type,
  target_id,
  target_user_id,
  category_id,
  custom_issue,
  description,
}) => {
  // prevent self report
  if (target_user_id && reported_by === target_user_id) {
    throw new Error("You cannot report your own content");
  }

  // prevent duplicate report
  const { data: existingReport, error: existingError } = await supabase
    .from("reports")
    .select("id")
    .eq("reported_by", reported_by)
    .eq("module_type", module_type)
    .eq("target_id", target_id)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingReport) {
    throw new Error("You already reported this content");
  }

  // validate category
  const { data: category, error: categoryError } = await supabase
    .from("report_categories")
    .select(
      `
      id,
      module_type,
      name,
      description
    `
    )
    .eq("id", category_id)
    .eq("module_type", module_type)
    .single();

  if (categoryError || !category) {
    throw new Error("Invalid report category");
  }

  // others validation
  if (category.name.toLowerCase() === "others" && !custom_issue) {
    throw new Error("Custom issue is required");
  }

  // create report
  const { data, error } = await supabase
    .from("reports")
    .insert([
      {
        reported_by,
        module_type,
        target_id,
        target_user_id,
        category_id,
        custom_issue,
        description,
      },
    ])
    .select(
      `
      id,
      module_type,
      target_id,
      target_user_id,
      custom_issue,
      description,
      status,
      created_at,

      category:report_categories (
        id,
        name,
        description
      )
    `
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

exports.getReportCategories = async (module_type) => {
  const { data, error } = await supabase
    .from("report_categories")
    .select(
      `
      id,
      module_type,
      name,
      description
    `
    )
    .eq("module_type", module_type)
    .eq("is_active", true)
    .order("name", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

exports.checkUserReport = async ({ reported_by, module_type, target_id }) => {
  const { data, error } = await supabase
    .from("reports")
    .select(
      `
      id,
      module_type,
      target_id,
      custom_issue,
      description,
      status,
      created_at,

      category:report_categories (
        id,
        name,
        description
      )
    `
    )
    .eq("reported_by", reported_by)
    .eq("module_type", module_type)
    .eq("target_id", target_id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  // fetch target object details
  let targetDetails = null;

  // feed
  if (module_type === "feed") {
    const { data: feed } = await supabase
      .from("feeds")
      .select(`*`)
      .eq("id", target_id)
      .maybeSingle();

    targetDetails = feed;
  }

  // meme
  if (module_type === "meme") {
    const { data: meme } = await supabase
      .from("memes")
      .select(
        `*
      `
      )
      .eq("id", target_id)
      .maybeSingle();

    targetDetails = meme;
  }

  // gossip
  if (module_type === "gossip") {
    const { data: gossip } = await supabase
      .from("gossips")
      .select(
        `
        *
      `
      )
      .eq("id", target_id)
      .maybeSingle();

    targetDetails = gossip;
  }

  // profile
  if (module_type === "profile") {
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        `
       *
      `
      )
      .eq("id", target_id)
      .maybeSingle();

    targetDetails = profile;
  }

  return {
    ...data,
    target_details: targetDetails,
  };
};
