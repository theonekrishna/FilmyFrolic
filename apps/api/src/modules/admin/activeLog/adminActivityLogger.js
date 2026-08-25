const { supabase } = require("../../../configs/supabase");

exports.logAdminActivity = async ({
  adminId,
  adminName,
  adminRole,
  module,
  action,
  entityType,
  entityId,
  entityName,
  icon,
  iconColor,
  description,
}) => {
  try {
    const { data, error } = await supabase
      .from("admin_activity_logs")
      .insert({
        admin_id: adminId,
        admin_name: adminName,
        admin_role: adminRole,

        module,
        action,

        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,

        icon,
        icon_color: iconColor,

        description,
      })
      .select();

    if (error) {
      console.error("ACTIVITY LOG INSERT ERROR:", error);
      return;
    }

    console.log("Activity Logged:", data);
  } catch (err) {
    console.error("Activity log failed:", err);
  }
};
