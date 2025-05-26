const express = require('express');
const router = express.Router();
const { register, login, getMe, updateUser } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');
const { registerSchema, loginSchema, updateUserSchema } = require('../validators/authValidators');
const { authorize } = require('../middlewares/rbacMiddleware'); // Assuming rbacMiddleware is needed for future user management permissions

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public (or Private with Admin/Manager role if registration is restricted)
router.post('/register', validateRequest(registerSchema), register);

// @route   POST api/auth/login
// @desc    Authenticate a user and get a JWT token
// @access  Public
router.post('/login', validateRequest(loginSchema), login);

// @route   GET api/auth/me
// @desc    Get the profile of the currently logged-in user
// @access  Private
router.get('/me', protect, getMe);

// @route   PUT api/auth/users/:id
// @desc    Update a user's information (including role for Admin)
// @access  Private (Admin can update any user, User can update their own profile except role)
router.put('/users/:id', protect, validateRequest(updateUserSchema), updateUser);

module.exports = router;
