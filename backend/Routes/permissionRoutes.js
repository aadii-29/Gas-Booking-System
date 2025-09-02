const express = require('express');
const router = express.Router();
const { updatePermissions, requirePermission } = require('../Controllers/permissionController');
const { roleMiddleware } = require('../Middlewares/roleMiddleware');

router.put('/additional', requirePermission('manage_users'), roleMiddleware('Admin'), updatePermissions);

module.exports = router;    