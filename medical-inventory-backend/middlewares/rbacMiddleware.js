const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      // This case should ideally be caught by the 'protect' middleware first
      return res.status(401).json({ message: 'Not authorized, user information missing' });
    }

    const { role } = req.user;

    if (allowedRoles.includes(role)) {
      next(); // User has one of the allowed roles
    } else {
      res.status(403).json({ message: 'Forbidden: You do not have the necessary permissions' });
    }
  };
};

module.exports = { authorize };
