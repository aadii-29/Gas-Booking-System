const express = require('express');
const router = express.Router();
const bookingController = require('../Controllers/bookingController');
const authMiddleware = require("../Middlewares/authMiddleware");
const { roleMiddleware, permissionMiddleware } = require("../Middlewares/roleMiddleware");

router.post(
  '/create',
  authMiddleware,
  roleMiddleware('Customer','Agency', 'Admin'),
  permissionMiddleware('book_cylinder'),
  bookingController.createBooking
);
router.get(
  '/viewall',
  authMiddleware,
  roleMiddleware('Agency', 'Admin'),
  permissionMiddleware('view_all_booking'),
  bookingController.viewBookings
);

router.get(
  '/view',
  authMiddleware,
  roleMiddleware('Customer','Agency', 'Admin'),
  permissionMiddleware('view_booking'),
  bookingController.viewBookingbyCustomerID
);



router.put(
  '/update',
  authMiddleware,
  roleMiddleware('Agency', 'Admin'),
  permissionMiddleware('manage_customers'),
  bookingController.updateBookingStatus
);

router.get(
  '/delivery-status/:bookingId',
  authMiddleware,
  roleMiddleware('Customer', 'Agency', 'Admin'),
  permissionMiddleware('view_deliveries'),
  bookingController.getBookingDeliveryStatus
);

router.get(
  '/delivery-status',
  authMiddleware,
  roleMiddleware('Agency', 'Admin', 'DeliveryStaff'),
  permissionMiddleware('view_deliveries'),
  bookingController.getAssignmentDeliveryStatus // Fixed this line
);

module.exports = router;