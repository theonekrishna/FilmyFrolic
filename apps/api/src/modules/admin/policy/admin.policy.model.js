const { supabase } = require("../../../configs/supabase");

/* ==========================================================================
   POLICIES
   ========================================================================== */

exports.getAllPolicies = async () => {
  const { data, error } = await supabase
    .from("policies")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
};

exports.getPolicyById = async (id) => {
  const { data: policy, error } = await supabase
    .from("policies")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) throw error;

  const { data: sections, error: sectionError } = await supabase
    .from("policy_sections")
    .select("*")
    .eq("policy_id", id)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (sectionError) throw sectionError;

  return {
    ...policy,
    sections,
  };
};

exports.createPolicy = async (payload) => {
  const slug =
    payload.slug ||
    payload.title
      ?.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  const { data, error } = await supabase
    .from("policies")
    .insert([
      {
        title: payload.title,
        slug,
        description: payload.description || null,
        icon: payload.icon || null,
        color: payload.color || "#8B5CF6",

        is_active: payload.is_active !== undefined ? payload.is_active : true,

        created_by: payload.created_by || null,
        updated_by: payload.updated_by || null,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
};

exports.updatePolicy = async (id, payload) => {
  const updateData = {
    updated_at: new Date().toISOString(),
    updated_by: payload.updated_by || null,
  };

  if (payload.title !== undefined) updateData.title = payload.title;

  if (payload.slug !== undefined) updateData.slug = payload.slug;

  if (payload.description !== undefined) updateData.description = payload.description;

  if (payload.icon !== undefined) updateData.icon = payload.icon;

  if (payload.color !== undefined) updateData.color = payload.color;

  if (payload.is_active !== undefined) updateData.is_active = payload.is_active;

  const { data, error } = await supabase
    .from("policies")
    .update(updateData)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) throw error;

  return data;
};

exports.deletePolicy = async (id, adminId) => {
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from("policies")
    .update({
      deleted_at: timestamp,
      deleted_by: adminId,
      is_active: false,
    })
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from("policy_sections")
    .update({
      deleted_at: timestamp,
      deleted_by: adminId,
      is_active: false,
    })
    .eq("policy_id", id)
    .is("deleted_at", null);

  return data;
};

/* ==========================================================================
   POLICY SECTIONS
   ========================================================================== */

exports.getSectionsByPolicyId = async (policyId) => {
  const { data, error } = await supabase
    .from("policy_sections")
    .select("*")
    .eq("policy_id", policyId)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return data;
};

exports.createPolicySection = async (policyId, payload) => {
  const { data, error } = await supabase
    .from("policy_sections")
    .insert([
      {
        policy_id: policyId,

        title: payload.title,
        description: payload.description,

        sort_order: payload.sort_order || 1,

        is_active: payload.is_active !== undefined ? payload.is_active : true,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
};

exports.updatePolicySection = async (id, payload) => {
  const updateData = {
    updated_at: new Date().toISOString(),
  };

  if (payload.title !== undefined) updateData.title = payload.title;

  if (payload.description !== undefined) updateData.description = payload.description;

  if (payload.sort_order !== undefined) updateData.sort_order = payload.sort_order;

  if (payload.is_active !== undefined) updateData.is_active = payload.is_active;

  const { data, error } = await supabase
    .from("policy_sections")
    .update(updateData)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) throw error;

  return data;
};

exports.deletePolicySection = async (id, adminId) => {
  const { data, error } = await supabase
    .from("policy_sections")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: adminId,
      is_active: false,
    })
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) throw error;

  return data;
};

/* ==========================================================================
   PUBLIC
   ========================================================================== */

exports.getPublicPolicies = async () => {
  const { data: policies, error } = await supabase
    .from("policies")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("title");

  if (error) throw error;

  const result = await Promise.all(
    policies.map(async (policy) => {
      const { data: sections, error: sectionError } = await supabase
        .from("policy_sections")
        .select("*")
        .eq("policy_id", policy.id)
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      if (sectionError) throw sectionError;

      return {
        ...policy,
        sections,
      };
    })
  );

  return result;
};

exports.getPublicPolicyBySlug = async (slug) => {
  const { data: policy, error } = await supabase
    .from("policies")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .is("deleted_at", null)
    .single();

  if (error) throw error;

  if (!policy) return null;

  const { data: sections, error: sectionError } = await supabase
    .from("policy_sections")
    .select("*")
    .eq("policy_id", policy.id)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (sectionError) throw sectionError;

  return {
    ...policy,
    sections,
  };
};

exports.getPolicyList = async () => {
  const { data, error } = await supabase
    .from("policies")
    .select("title, slug")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("title");

  if (error) throw error;

  return data;
};
