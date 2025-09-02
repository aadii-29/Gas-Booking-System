const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
   

    // Check if req.user and req.user.role exist
    if (!req.user || !req.user.role) {
      console.warn('roleMiddleware: User or role not found', { user: req.user });
      return res.status(403).json({
        success: false,
        message: 'User role not provided or invalid',
      });
    }

    // Normalize roles to lowercase to avoid case sensitivity
    const userRole = req.user.role.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

    // Check if any roles are provided
    if (normalizedAllowedRoles.length === 0) {
      console.warn('roleMiddleware: No allowed roles specified');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: No roles specified for access',
      });
    }

    // Check if user role is allowed
    if (!normalizedAllowedRoles.includes(userRole)) {
      console.warn(`roleMiddleware: Unauthorized role - User: ${userRole}, Allowed: ${normalizedAllowedRoles.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: `Unauthorized role: ${req.user.role} not allowed`,
      });
    }

    next();
  };
};

const permissionMiddleware = (...requiredPermissions) => {
  return (req, res, next) => {
 

    // Check if req.user and req.user.permissions exist and is an array
    if (!req.user || !Array.isArray(req.user.permissions)) {
      console.warn('permissionMiddleware: User or permissions not found', { user: req.user });
      return res.status(403).json({
        success: false,
        message: 'User permissions not provided or invalid',
      });
    }

    // Normalize permissions to lowercase to avoid case sensitivity
    const userPermissions = req.user.permissions.map(perm => perm.toLowerCase());
    const normalizedRequiredPermissions = requiredPermissions.map(perm => perm.toLowerCase());

    // Check if any permissions are required
    if (normalizedRequiredPermissions.length === 0) {
      console.warn('permissionMiddleware: No required permissions specified');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: No permissions specified for access',
      });
    }

    // Check if user has all required permissions
    const hasPermissions = normalizedRequiredPermissions.every(perm => userPermissions.includes(perm));
    if (!hasPermissions) {
      console.warn(`permissionMiddleware: Insufficient permissions - User: ${userPermissions.join(', ')}, Required: ${normalizedRequiredPermissions.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: `Insufficient permissions: Missing required permissions`,
      });
    }
    next();
  };
};

module.exports = { roleMiddleware, permissionMiddleware };

