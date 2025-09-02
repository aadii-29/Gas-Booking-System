const express = require('express');
const router = express.Router();
const deliveryStaffController = require('../Controllers/deliveryStaffController');
const authMiddleware = require("../Middlewares/authMiddleware");
const { roleMiddleware, permissionMiddleware } = require("../Middlewares/roleMiddleware");

router.post(
  '/addStaff',
  authMiddleware,
  roleMiddleware('Admin', 'Agency'),
  permissionMiddleware('manage_delivery_staff'),
  deliveryStaffController.createDeliveryStaff
);

// Get all delivery staff (Admin can see all, Agency sees only their own)
router.get(
  '/viewall',
  authMiddleware,
  roleMiddleware('Admin', 'Agency'),
  permissionMiddleware('manage_delivery_staff'),
  deliveryStaffController.getAllDeliveryStaff
);

// Get a single delivery staff by ID
router.get(
  '/view/:id',
  authMiddleware,
  roleMiddleware('Admin', 'Agency'),
  permissionMiddleware('manage_delivery_staff'),
  deliveryStaffController.getDeliveryStaffById
);

// Update a delivery staff member
router.put(
  '/update/:id',
  authMiddleware,
  roleMiddleware('Admin', 'Agency'),
  permissionMiddleware('manage_delivery_staff'),
  deliveryStaffController.updateDeliveryStaff
);

// Delete a delivery staff member
router.delete(
  '/delete/:id',
  authMiddleware,
  roleMiddleware('Admin', 'Agency'),
  permissionMiddleware('manage_delivery_staff'),
  deliveryStaffController.deleteDeliveryStaff
);

// Get delivery staff by AgencyID
router.get(
  '/agency/:agencyId',
  authMiddleware,
  roleMiddleware('Admin', 'Agency'),
  permissionMiddleware('manage_delivery_staff'),
  deliveryStaffController.getDeliveryStaffByAgency
);

module.exports = router;