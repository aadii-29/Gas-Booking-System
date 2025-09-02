const express = require('express');
const router = express.Router();
const assignmentController = require('../Controllers/assignmentController');
const authMiddleware = require("../Middlewares/authMiddleware");
const { roleMiddleware, permissionMiddleware } = require("../Middlewares/roleMiddleware");

// Create a new assignment
router.post(
  '/create',
  authMiddleware,
  roleMiddleware('Agency', 'Admin'),
  permissionMiddleware('manage_staff'),
  assignmentController.createAssignment
);

// Get all assignments
router.get(
  '/all',
  authMiddleware,
  roleMiddleware('Agency', 'Admin', 'DeliveryStaff'),
  permissionMiddleware('view_deliveries'),
  assignmentController.getAllAssignments
);

// Get assignments by staff ID
router.get(
  '/staff/:employeeId',
  authMiddleware,
  roleMiddleware('Agency', 'Admin', 'DeliveryStaff'),
  permissionMiddleware('view_deliveries'),
  assignmentController.getAssignmentsByStaff
);

// Update assignment status
router.put(
  '/update/:assignmentId',
  authMiddleware,
  roleMiddleware('Agency', 'Admin', 'DeliveryStaff'),
  permissionMiddleware('update_delivery_status'),
  assignmentController.updateAssignmentStatus
);

// Delete an assignment
router.delete(
  '/delete/:assignmentId',
  authMiddleware,
  roleMiddleware('Agency', 'Admin'),
  permissionMiddleware('manage_staff'),
  assignmentController.deleteAssignment
);

// Complete an assignment
router.put(
  '/complete/:assignmentId',
  authMiddleware,
  roleMiddleware('DeliveryStaff', 'Agency'),
  permissionMiddleware('update_delivery_status'),
  assignmentController.completeAssignment
);


module.exports = router;