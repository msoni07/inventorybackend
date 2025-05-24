const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.userId).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      
      // Check if user is active
      if (!req.user.isActive) {
        return res.status(403).json({ message: 'Account is inactive. Please contact administrator.' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      if (error.name === 'JsonWebTokenError') {
        return res.status(403).json({ message: 'Not authorized, token failed (invalid signature)' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(403).json({ message: 'Not authorized, token expired' });
      }
      return res.status(403).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
