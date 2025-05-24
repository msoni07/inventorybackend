const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRequest } = require('../middlewares/validationMiddleware');
const { registerSchema, loginSchema } = require('../validators/authValidators');

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRequest(registerSchema), authController.register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', validateRequest(loginSchema), authController.login);

// @route   GET api/auth/me
// @desc    Get current logged-in user's profile
// @access  Private
const { protect } = require('../middlewares/authMiddleware');
router.get('/me', protect, (req, res) => {
  // req.user is populated by the 'protect' middleware
  if (!req.user) {
    return res.status(404).json({ message: 'User not found' });
  }
  // Send back user information (excluding password, which is already handled by the middleware)
  res.json(req.user);
});

module.exports = router;
