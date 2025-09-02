const express = require("express");
const router = express.Router();
const {
  getPendingAgencies,
  updateAgencyStatus,
  updateAgency,
  deleteAgency,
  getAllAgencies,
  getAgencyById,updateRequestStatus,
} = require("../Controllers/adminController");
const authMiddleware = require("../Middlewares/authMiddleware");
const {
  roleMiddleware,
  permissionMiddleware,
} = require("../Middlewares/roleMiddleware");

// Apply authMiddleware to all routes
router.use(authMiddleware);

// Get pending agency applications
router.get(
  "/agency/pendingrequest",
  roleMiddleware("Admin"),
  permissionMiddleware("view_pending_applications"),
  getPendingAgencies
);

// Update agency status (approve/deny)
router.put(
  "/agency/agencystatus/:reqID",
  roleMiddleware("Admin"),
  permissionMiddleware("manage_agencies"),
  updateAgencyStatus
);

// Update agency details by AgencyID
router.put(
  "/agency/:agencyID",
  roleMiddleware("Admin"),
  permissionMiddleware("manage_agencies"),
  updateAgency
);

// Delete agency by AgencyID
router.delete(
  "/agency/:agencyID",
  roleMiddleware("Admin"),
  permissionMiddleware("manage_agencies"),
  deleteAgency
);

// Get all agencies
router.get(
  "/viewallagency",
  roleMiddleware("Admin"),
  permissionMiddleware("manage_agencies"),
  getAllAgencies
);

// Get specific agency by AgencyID
router.get(
  "/viewagency/:agencyID",
  roleMiddleware("Admin"),
  permissionMiddleware("manage_agencies"),
  getAgencyById
);
// Update REquestID status (approve/deny)
router.put(
  "/requestID/status/:id",
  updateRequestStatus
);


module.exports = router;
