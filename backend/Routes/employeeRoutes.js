const express = require('express');
const router = express.Router();
const employeeController = require('../Controllers/employeeController');
const authMiddleware = require("../Middlewares/authMiddleware");
const { roleMiddleware, permissionMiddleware } = require("../Middlewares/roleMiddleware");
const agencyUploadMiddleware = require('../Middlewares/agencyUploadMiddleware'); // File upload middleware
// Apply to become a delivery staff member
router.post(
  '/employment/apply',
  authMiddleware,
    authMiddleware,
    roleMiddleware('Admin', 'User'),
    permissionMiddleware('apply_connection'),
    agencyUploadMiddleware,
  employeeController.applyDeliveryStaff
);
router.get(
  '/employment/status',
  authMiddleware,
    authMiddleware,
    roleMiddleware('Admin', 'User'),
    permissionMiddleware('apply_connection'),
  employeeController.viewApplicationStatusByID

);
router.get(
  '/employment/application',
  authMiddleware,
    authMiddleware,
    roleMiddleware('Admin', 'User',"Agency"),
    permissionMiddleware('view_dileverystaff_application'),
  employeeController.viewApplicationStatus

);



module.exports = router;