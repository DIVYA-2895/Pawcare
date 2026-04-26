// middleware/roleGuard.js
// Role-based access control middleware — restricts routes by user role

/**
 * Usage: roleGuard('admin', 'staff')
 * This returns a middleware that allows only users with those roles.
 */
const roleGuard = (...roles) => {
  return (req, res, next) => {
    // req.user is set by the protect middleware (must run after protect)
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
      });
    }

    next(); // User has an allowed role, proceed
  };
};

module.exports = { roleGuard };
