const express = require('express');
const router = express.Router(); // Corrected from expressRouter()
const customerController = require('../Controllers/customerController');
const authMiddleware = require("../Middlewares/authMiddleware");
const { roleMiddleware, permissionMiddleware } = require("../Middlewares/roleMiddleware");
const uploadMiddleware = require('../Middlewares/uploadMiddleware'); // File upload middleware
router.post(
  '/apply',
  authMiddleware,
  roleMiddleware('Admin', 'User'),
  permissionMiddleware('apply_connection'),
  uploadMiddleware,
  customerController.applyForConnection
);

router.get('/viewAgencies',
  authMiddleware,
  permissionMiddleware('apply_connection'), 
  customerController.getAgencies);

// Apply for Agency
router.post(
  '/agency_apply',
  authMiddleware,
  roleMiddleware('Admin', 'User'), // Only users can apply for agency
  permissionMiddleware('apply_agency'), // Correct permission
  customerController.applyAgency
);



router.get(
  '/agency-status/:registrationID',
  authMiddleware,
  roleMiddleware('Admin', 'User', 'Agency'),
  permissionMiddleware('application_status'),
  customerController.getApplicationStatus
);
 router.get(
  '/viewall/application',
  authMiddleware,
  roleMiddleware('Admin', 'User', 'Customer',"Agency","Deliverystaff"),
  permissionMiddleware('application_status'),
  customerController.getUserApplications
); 

module.exports = router;