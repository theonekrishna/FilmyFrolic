const express = require("express");
const router = express.Router();

const controller = require("./admin.policy.controller");

const { protect } = require("../../../middlewares/auth");
const staffOnly = require("../../../middlewares/staffOnly");
const loadUserRoleAndPermissions = require("../../../middlewares/userRoleAndPermissions");

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

router.get("/public/all", controller.getPublicPolicies);
router.get("/public/list", controller.getPolicyList);
router.get("/public/:slug", controller.getPublicPolicyBySlug);

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES
|--------------------------------------------------------------------------
*/

router.use(protect, staffOnly, loadUserRoleAndPermissions);

/*
|--------------------------------------------------------------------------
| POLICY ROUTES
|--------------------------------------------------------------------------
*/

router.get("/", controller.getAllPolicies);

router.get("/:id", controller.getPolicyById);

router.post("/", controller.createPolicy);

router.put("/:id", controller.updatePolicy);

router.delete("/:id", controller.deletePolicy);

/*
|--------------------------------------------------------------------------
| POLICY SECTION ROUTES
|--------------------------------------------------------------------------
*/

router.get("/:policyId/sections", controller.getSectionsByPolicyId);

router.post("/:policyId/sections", controller.createPolicySection);

router.put("/sections/:id", controller.updatePolicySection);

router.delete("/sections/:id", controller.deletePolicySection);

module.exports = router;
