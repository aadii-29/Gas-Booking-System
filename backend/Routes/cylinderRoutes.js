const express = require('express');
const router = express.Router();
const cylinderController = require('../Controllers/cylinderController'); // Fixed path and case
const authMiddleware = require("../Middlewares/authMiddleware");
const { roleMiddleware, permissionMiddleware } = require("../Middlewares/roleMiddleware"); // Fixed path and case

// Create a new cylinder entry
router.post(
  '/create',
  authMiddleware,
  roleMiddleware('Agency', 'Admin'),
  permissionMiddleware('manage_inventory'),
  cylinderController.createCylinder
);

// Get all cylinder stock
router.get(
  '/stock',
  authMiddleware,
  roleMiddleware('Agency', 'Admin', 'DeliveryStaff'),
  permissionMiddleware('view_deliveries'),
  cylinderController.getCylinderStock
);

// Get cylinders by category
router.get(
  '/category/:category',
  authMiddleware,
  roleMiddleware('Agency', 'Admin', 'DeliveryStaff'),
  permissionMiddleware('view_deliveries'),
  cylinderController.getCylinderByCategory
);

// Update cylinder stock
router.put(
  '/update/:cylinderId',
  authMiddleware,
  roleMiddleware('Agency', 'Admin'),
  permissionMiddleware('manage_inventory'),
  cylinderController.updateCylinderStock
);

// Delete a cylinder entry
router.delete(
  '/delete/:cylinderId',
  authMiddleware,
  roleMiddleware('Admin'),
  permissionMiddleware('manage_inventory'),
  cylinderController.deleteCylinder
);

// Adjust cylinder stock (book or return)
router.put(
  '/adjust',
  authMiddleware,
  roleMiddleware('Agency', 'DeliveryStaff'),
  permissionMiddleware('update_delivery_status'),
  cylinderController.adjustCylinderStock
);

module.exports = router;