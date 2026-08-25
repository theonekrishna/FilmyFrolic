const { supabase } = require("../../../configs/supabase");

// ═══════════════════════════════════════
// GET ALL ROLES
// ═══════════════════════════════════════

exports.getAllRoles = async ({ search = "", status = "all" }) => {
  // BASE QUERY
  let query = supabase
    .from("roles")
    .select(
      `
      id,
      name,
      slug,
      description,
      color,
      priority,

      can_create,
      can_moderate,
      can_manage_users,
      can_manage_roles,
      can_access_analytics,

      is_system,
      is_active,

      created_at,
      updated_at
    `
    )
    .order("priority", { ascending: false });

  // ═══════════════════════════════════════
  // ALWAYS HIDE INACTIVE ROLES (GLOBAL RULE)
  // ═══════════════════════════════════════

  query = query.eq("is_active", true);

  // ═══════════════════════════════════════
  // SEARCH
  // ═══════════════════════════════════════

  if (search?.trim()) {
    const keyword = search.trim();

    query = query.or(`
      name.ilike.%${keyword}%,
      slug.ilike.%${keyword}%,
      description.ilike.%${keyword}%
    `);
  }

  // ═══════════════════════════════════════
  // STATUS FILTER (ONLY WORKS ON ACTIVE DATA SET)
  // ═══════════════════════════════════════

  if (status === "inactive") {
    // no results possible since we already filter active only
    return {
      total: 0,
      data: [],
    };
  }

  // EXECUTE
  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.length) {
    return {
      total: 0,
      data: [],
    };
  }

  // MAP ROLES
  const mappedRoles = await Promise.all(
    data.map(async (role) => {
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("role", role.slug);

      const permissionsCount = [
        role.can_create,
        role.can_moderate,
        role.can_manage_users,
        role.can_manage_roles,
        role.can_access_analytics,
      ].filter(Boolean).length;

      return {
        id: role.id,
        name: role.name,
        slug: role.slug,
        description: role.description,
        color: role.color,
        priority: role.priority,

        is_system: role.is_system,
        is_active: role.is_active,

        total_users: Number(totalUsers || 0),
        permissions_count: permissionsCount,

        permissions: {
          can_create: role.can_create,
          can_moderate: role.can_moderate,
          can_manage_users: role.can_manage_users,
          can_manage_roles: role.can_manage_roles,
          can_access_analytics: role.can_access_analytics,
        },

        created_at: role.created_at,
        updated_at: role.updated_at,
      };
    })
  );

  return {
    total: mappedRoles.length,
    data: mappedRoles,
  };
};

// ═══════════════════════════════════════
// GET SINGLE ROLE
// ═══════════════════════════════════════

exports.getSingleRole = async (roleId) => {
  // QUERY
  const { data, error } = await supabase
    .from("roles")
    .select(
      `
        id,
        name,
        slug,
        description,
        color,
        priority,

        can_create,
        can_moderate,
        can_manage_users,
        can_manage_roles,
        can_access_analytics,

        is_system,
        is_active,

        created_at,
        updated_at
      `
    )
    .eq("id", roleId)
    .maybeSingle();

  // ERROR
  if (error) {
    throw new Error(error.message);
  }

  // NOT FOUND
  if (!data) {
    throw new Error("Role not found");
  }

  // USERS COUNT
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("role", data.slug);

  // ENABLED PERMISSIONS COUNT
  const permissionsCount = [
    data.can_create,
    data.can_moderate,
    data.can_manage_users,
    data.can_manage_roles,
    data.can_access_analytics,
  ].filter(Boolean).length;

  // RETURN
  return {
    id: data.id,

    name: data.name,

    slug: data.slug,

    description: data.description,

    color: data.color,

    priority: data.priority,

    is_system: data.is_system,

    is_active: data.is_active,

    total_users: Number(totalUsers || 0),

    permissions_count: permissionsCount,

    permissions: {
      can_create: data.can_create,

      can_moderate: data.can_moderate,

      can_manage_users: data.can_manage_users,

      can_manage_roles: data.can_manage_roles,

      can_access_analytics: data.can_access_analytics,
    },

    created_at: data.created_at,

    updated_at: data.updated_at,
  };
};

// ═══════════════════════════════════════
// CREATE ROLE
// ═══════════════════════════════════════

exports.createRole = async ({
  name,
  description = "",
  color = "#8B5CF6",
  priority = 1,

  can_create = false,
  can_moderate = false,
  can_manage_users = false,
  can_manage_roles = false,
  can_access_analytics = false,
}) => {
  // AUTO SLUG
  const cleanSlug = name
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .replace(/\s+/g, "_");

  // CHECK EXISTING ROLE NAME
  const { data: existingName } = await supabase
    .from("roles")
    .select("id")
    .ilike("name", name.trim())
    .maybeSingle();

  // NAME EXISTS
  if (existingName) {
    throw new Error("Role name already exists");
  }

  // CHECK EXISTING SLUG
  const { data: existingSlug } = await supabase
    .from("roles")
    .select("id")
    .ilike("slug", cleanSlug)
    .maybeSingle();

  // SLUG EXISTS
  if (existingSlug) {
    throw new Error("Role slug already exists");
  }

  // CREATE ROLE
  const { data, error } = await supabase
    .from("roles")
    .insert({
      name: name.trim(),

      slug: cleanSlug,

      description: description?.trim() || null,

      color,

      priority,

      can_create,

      can_moderate,

      can_manage_users,

      can_manage_roles,

      can_access_analytics,

      is_system: false,

      is_active: true,
    })
    .select(
      `
        id,
        name,
        slug,
        description,
        color,
        priority,

        can_create,
        can_moderate,
        can_manage_users,
        can_manage_roles,
        can_access_analytics,

        is_system,
        is_active,

        created_at,
        updated_at
      `
    )
    .single();

  // ERROR
  if (error) {
    throw new Error(error.message);
  }

  // RETURN
  return {
    ...data,

    permissions: {
      can_create: data.can_create,

      can_moderate: data.can_moderate,

      can_manage_users: data.can_manage_users,

      can_manage_roles: data.can_manage_roles,

      can_access_analytics: data.can_access_analytics,
    },
  };
};

// ═══════════════════════════════════════
// UPDATE ROLE
// ═══════════════════════════════════════

exports.updateRole = async ({
  roleId,

  name,
  description = "",
  color = "#8B5CF6",
  priority = 1,

  can_create = false,
  can_moderate = false,
  can_manage_users = false,
  can_manage_roles = false,
  can_access_analytics = false,

  is_active = true,
}) => {
  // FIND ROLE
  const { data: existingRole, error: findError } = await supabase
    .from("roles")
    .select(
      `
      id,
      name,
      slug,
      is_system
    `
    )
    .eq("id", roleId)
    .maybeSingle();

  // NOT FOUND
  if (findError || !existingRole) {
    throw new Error("Role not found");
  }

  // BLOCK SYSTEM ROLE EDIT
  // OPTIONAL: remove if you want editable system roles

  // if (existingRole.is_system) {
  //   throw new Error(
  //     "System role cannot be edited"
  //   );
  // }

  // AUTO SLUG
  const cleanSlug = name
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .replace(/\s+/g, "_");

  // CHECK DUPLICATE NAME
  const { data: existingName } = await supabase
    .from("roles")
    .select("id")
    .ilike("name", name.trim())
    .neq("id", roleId)
    .maybeSingle();

  if (existingName) {
    throw new Error("Role name already exists");
  }

  // CHECK DUPLICATE SLUG
  const { data: existingSlug } = await supabase
    .from("roles")
    .select("id")
    .ilike("slug", cleanSlug)
    .neq("id", roleId)
    .maybeSingle();

  if (existingSlug) {
    throw new Error("Role slug already exists");
  }

  // UPDATE ROLE
  const { data, error } = await supabase
    .from("roles")
    .update({
      name: name.trim(),

      slug: cleanSlug,

      description: description?.trim() || null,

      color,

      priority,

      can_create,

      can_moderate,

      can_manage_users,

      can_manage_roles,

      can_access_analytics,

      is_active,
    })
    .eq("id", roleId)
    .select(
      `
        id,
        name,
        slug,
        description,
        color,
        priority,

        can_create,
        can_moderate,
        can_manage_users,
        can_manage_roles,
        can_access_analytics,

        is_system,
        is_active,

        created_at,
        updated_at
      `
    )
    .single();

  // ERROR
  if (error) {
    if (error.message.includes("roles_name_key")) {
      throw new Error("Role name already exists");
    }

    if (error.message.includes("roles_slug_key")) {
      throw new Error("Role slug already exists");
    }

    throw new Error(error.message);
  }

  // RETURN
  return {
    ...data,

    permissions: {
      can_create: data.can_create,

      can_moderate: data.can_moderate,

      can_manage_users: data.can_manage_users,

      can_manage_roles: data.can_manage_roles,

      can_access_analytics: data.can_access_analytics,
    },
  };
};

// ═══════════════════════════════════════
// TOGGLE ROLE STATUS
// ═══════════════════════════════════════

exports.toggleRoleStatus = async (roleId) => {
  // FIND ROLE
  const { data: existingRole, error: findError } = await supabase
    .from("roles")
    .select(
      `
      id,
      name,
      slug,
      is_system,
      is_active
    `
    )
    .eq("id", roleId)
    .maybeSingle();

  // NOT FOUND
  if (findError || !existingRole) {
    throw new Error("Role not found");
  }

  // BLOCK SYSTEM ROLE
  if (existingRole.is_system) {
    throw new Error("System role cannot be deactivated");
  }

  // TOGGLE STATUS
  const newStatus = !existingRole.is_active;

  // UPDATE
  const { data, error } = await supabase
    .from("roles")
    .update({
      is_active: newStatus,
    })
    .eq("id", roleId)
    .select(
      `
        id,
        name,
        slug,
        is_active,
        updated_at
      `
    )
    .single();

  // ERROR
  if (error) {
    throw new Error(error.message);
  }

  // RESPONSE
  return {
    message: newStatus ? "Role activated successfully" : "Role deactivated successfully",

    role: data,
  };
};

// ═══════════════════════════════════════
// GET ACTIVE ROLES LIST
// ═══════════════════════════════════════

exports.getRolesList = async () => {
  // QUERY
  const { data, error } = await supabase
    .from("roles")
    .select(
      `
        id,
        name,
        slug,
        color,
        priority
      `
    )
    .eq("is_active", true)
    .order("priority", {
      ascending: false,
    });

  // ERROR
  if (error) {
    throw new Error(error.message);
  }

  // RESPONSE
  return data || [];
};

// ═══════════════════════════════════════
// GET LOGGED IN USER PERMISSIONS
// ═══════════════════════════════════════

exports.getMyPermissions = async (userId) => {
  // GET USER ROLE
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
      id,
      name,
      username,
      role
    `
    )
    .eq("id", userId)
    .maybeSingle();

  // ERROR
  if (profileError || !profile) {
    throw new Error("User profile not found");
  }

  // GET ROLE
  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select(
      `
      id,
      name,
      slug,
      color,
      priority,

      can_create,
      can_moderate,
      can_manage_users,
      can_manage_roles,
      can_access_analytics,

      is_active
    `
    )
    .eq("slug", profile.role)
    .maybeSingle();

  // ROLE NOT FOUND
  if (roleError || !role) {
    throw new Error("Role not found");
  }

  // ROLE DISABLED
  if (!role.is_active) {
    throw new Error("Role is deactivated");
  }

  // RESPONSE
  return {
    user: {
      id: profile.id,

      name: profile.name,

      username: profile.username,

      role: profile.role,
    },

    role: {
      id: role.id,

      name: role.name,

      slug: role.slug,

      color: role.color,

      priority: role.priority,
    },

    permissions: {
      can_create: role.can_create,

      can_moderate: role.can_moderate,

      can_manage_users: role.can_manage_users,

      can_manage_roles: role.can_manage_roles,

      can_access_analytics: role.can_access_analytics,
    },
  };
};

// ═══════════════════════════════════════
// DELETE ROLE
// ═══════════════════════════════════════

exports.deleteRole = async (roleId) => {
  // VALIDATE ID
  if (!roleId) {
    throw new Error("Role ID is required");
  }

  // FIND ROLE
  const { data: existingRole, error: findError } = await supabase
    .from("roles")
    .select(
      `
      id,
      name,
      slug,
      is_system
    `
    )
    .eq("id", roleId)
    .maybeSingle();

  // ROLE NOT FOUND
  if (findError) {
    throw new Error(findError.message);
  }

  if (!existingRole) {
    throw new Error("Role not found");
  }

  // BLOCK SYSTEM ROLE DELETE
  if (existingRole.is_system) {
    throw new Error("System role cannot be deleted");
  }

  // CHECK ASSIGNED USERS
  const { count: assignedUsers, error: userError } = await supabase
    .from("profiles")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("role", existingRole.slug);

  // USER CHECK ERROR
  if (userError) {
    throw new Error(userError.message);
  }

  // BLOCK DELETE
  if (assignedUsers > 0) {
    throw new Error("Role has assigned users");
  }

  // DELETE ROLE
  const { error: deleteError } = await supabase.from("roles").delete().eq("id", roleId);

  // DELETE ERROR
  if (deleteError) {
    throw new Error(deleteError.message);
  }

  // RESPONSE
  return {
    message: "Role deleted successfully",
  };
};

// ═══════════════════════════════════════
// GET ALL MODULES
// ═══════════════════════════════════════

exports.getAllModules = async () => {
  const { data, error } = await supabase
    .from("app_modules")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
};

// ═══════════════════════════════════════
// TOGGLE MODULE STATUS
// ═══════════════════════════════════════

exports.toggleModuleStatus = async (module_key) => {
  // GET CURRENT MODULE
  const { data: existingModule, error: fetchError } = await supabase
    .from("app_modules")
    .select("*")
    .eq("module_key", module_key)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  // MODULE NOT FOUND
  if (!existingModule) {
    throw new Error("Module not found");
  }

  // TOGGLE STATUS
  const { data, error } = await supabase
    .from("app_modules")
    .update({
      is_enabled: !existingModule.is_enabled,
    })
    .eq("module_key", module_key)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

// ═══════════════════════════════════════
// GET ALL ACCESS SETTINGS
// ═══════════════════════════════════════

exports.getAllAccessSettings = async () => {
  const { data, error } = await supabase
    .from("app_settings")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
};

// ═══════════════════════════════════════
// TOGGLE ACCESS SETTING
// ═══════════════════════════════════════

exports.toggleAccessSetting = async (setting_key) => {
  // GET CURRENT SETTING
  const { data: existingSetting, error: fetchError } = await supabase
    .from("app_settings")
    .select("*")
    .eq("setting_key", setting_key)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  // NOT FOUND
  if (!existingSetting) {
    throw new Error("Setting not found");
  }

  // TOGGLE STATUS
  const { data, error } = await supabase
    .from("app_settings")
    .update({
      is_enabled: !existingSetting.is_enabled,
    })
    .eq("setting_key", setting_key)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

// ═══════════════════════════════════════
// GET ALL CONTENT CONTROLS
// ═══════════════════════════════════════

exports.getAllContentControls = async () => {
  const { data, error } = await supabase
    .from("content_controls")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
};

// ═══════════════════════════════════════
// TOGGLE CONTENT CONTROL
// ═══════════════════════════════════════

exports.toggleContentControl = async (control_key) => {
  // GET CURRENT CONTROL
  const { data: existingControl, error: fetchError } = await supabase
    .from("content_controls")
    .select("*")
    .eq("control_key", control_key)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  // NOT FOUND
  if (!existingControl) {
    throw new Error("Content control not found");
  }

  // TOGGLE STATUS
  const { data, error } = await supabase
    .from("content_controls")
    .update({
      is_enabled: !existingControl.is_enabled,
    })
    .eq("control_key", control_key)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

// ═══════════════════════════════════════
// GET ALL ENTERTAINMENT CONTROLS
// ═══════════════════════════════════════

exports.getAllEntertainmentControls = async () => {
  const { data, error } = await supabase
    .from("entertainment_controls")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
};

// ═══════════════════════════════════════
// TOGGLE ENTERTAINMENT CONTROL
// ═══════════════════════════════════════

exports.toggleEntertainmentControl = async (control_key) => {
  // GET CURRENT CONTROL
  const { data: existingControl, error: fetchError } = await supabase
    .from("entertainment_controls")
    .select("*")
    .eq("control_key", control_key)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  // NOT FOUND
  if (!existingControl) {
    throw new Error("Entertainment control not found");
  }

  // TOGGLE STATUS
  const { data, error } = await supabase
    .from("entertainment_controls")
    .update({
      is_enabled: !existingControl.is_enabled,
    })
    .eq("control_key", control_key)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};
