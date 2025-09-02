const express = require("express");
const router = express.Router();
const agencyController = require("../Controllers/agencyController");
const deliveryStaffController = require("../Controllers/deliveryStaffController");
const authMiddleware = require("../Middlewares/authMiddleware");
const { roleMiddleware, permissionMiddleware } = require("../Middlewares/roleMiddleware");

// View all delivery staff applications
router.post(
  "/delivery_staff/applications",
  authMiddleware,
  roleMiddleware("Admin", "Agency"),
  permissionMiddleware("view_delivery_staff_application"),
  agencyController.viewDeliveryStaffApplications
);

// View pending delivery staff applications
router.get(
  "/delivery_staff/pending/applications",
  authMiddleware,
  roleMiddleware("Admin", "Agency"),
  permissionMiddleware("manage_delivery_staff"),
  agencyController.pendingDeliveryStaffApplications
);

// View delivery staff applications by ID
router.get(
  "/delivery_staff/pending/applications/:Id",
  authMiddleware,
  roleMiddleware("Admin", "Agency"),
  permissionMiddleware("manage_delivery_staff"),
  agencyController.getDeliveryStaffapplicationById
);




// Update delivery staff status (approve/deny)
router.put(
  "/delivery_staff/status/:ApplicationID",
  authMiddleware,
  roleMiddleware("Admin", "Agency"),
  permissionMiddleware("update_delivery_staff_application"),
  agencyController.updateDeliveryStaffStatus
);

// Get agency details by AgencyID
router.get(
  "/:agencyID",
  authMiddleware,
  roleMiddleware("Agency"),
  permissionMiddleware("view_agency"),
  agencyController.getAgencyDetails
);

// Update customer status (approve/deny)
router.put(
  "/customer/status/:reqID",
  authMiddleware,
  roleMiddleware("Admin", "Agency"),
  permissionMiddleware("manage_customers"),
  agencyController.updateCustomerStatus
);

// Get pending customer applications
router.get(
  "/customer/pendingrequest",
  authMiddleware,
  roleMiddleware("Admin", "Agency"),
  permissionMiddleware("manage_customers"),
  agencyController.getPendingNewCustomer
);

// Get all customers for a specified AgencyID
router.post(
  "/customers/viewall/agencyID",
  authMiddleware,
  roleMiddleware("Admin", "Agency"),
  permissionMiddleware("manage_customers"),
  agencyController.viewCustomersByAgencyID
);

// Get specific customer details by CustomerID
router.post(
  "/customers/view/customerID",
  authMiddleware,
  roleMiddleware("Admin", "Agency"),
  permissionMiddleware("manage_customers"),
  agencyController.viewCustomerByCustomerID
);

// Update customer details by CustomerID
router.put(
  "/customers/update/customerID",
  authMiddleware,
  roleMiddleware("Admin", "Agency"),
  permissionMiddleware("manage_customers"),
  agencyController.updateCustomerByCustomerID
);

// Delete customer by CustomerID
router.delete(
  "/customers/delete/customerID",
  authMiddleware,
  roleMiddleware("Admin", "Agency"),
  permissionMiddleware("manage_customers"),
  agencyController.deleteCustomerByCustomerID
);



module.exports = router;