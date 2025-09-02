const express = require('express');
const router = express.Router();
const passwordController = require('../Controllers/passwordController');
const authMiddleware = require("../Middlewares/authMiddleware");



router.post('/change-password', authMiddleware, passwordController.changePassword);
router.post('/change-password/:token', passwordController.changePasswordWithToken);
router.post('/reset-password/:token', passwordController.resetPasswordWithToken);
router.post('/forgot-password', passwordController.forgotPassword);
/* router.post('/request-password-reset', passwordController.requestPasswordReset); */
router.post('/check-reset-status', passwordController.checkResetStatus);
router.post('/updatepassword', authMiddleware, passwordController.updatePassword);
router.post('/setInitiatePassword',authMiddleware, passwordController.setInitialPassword);
router.post('/setPassword/:token',authMiddleware, passwordController.setPasswordWithToken);
router.post('/customer/setInitiatePassword',authMiddleware, passwordController.setInitialCustomerPassword);
router.post('/deliverystaff/setPassword',authMiddleware, passwordController.updateDeliveryStaffPassword);

module.exports = router;