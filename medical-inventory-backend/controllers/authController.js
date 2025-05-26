const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const logger = require('../config/logger'); // Import logger
const mongoose = require('mongoose'); // Import mongoose for ObjectId validation

// Register Function
const register = async (req, res) => {
  const { username, email, password, role, firstName, lastName } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    // Create new user
    user = new User({
      username,
      email,
      password,
      role,
      firstName,
      lastName,
    });

    // Password will be hashed by pre-save hook in User model
    await user.save();

    // Return user details (excluding password)
    const userResponse = { ...user._doc };
    delete userResponse.password;

    logger.info(`User registered successfully: ${user.username} (ID: ${user._id})`);
    res.status(201).json({ message: 'User registered successfully', user: userResponse });
  } catch (err) {
    logger.error(`Error during registration for username ${username} / email ${email}: ${err.message}`, { stack: err.stack });
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login Function
const login = async (req, res) => {
  const { email, password: candidatePassword } = req.body; // Renamed password to avoid conflict

  try {
    // Find user by email or username
    // For login, it's common to allow login with either email or username.
    // If your schema/requirements strictly use email for login, you can simplify this.
    const user = await User.findOne({ $or: [{ email }, { username: email }] }); // Allow login with email or username

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials - User not found' });
    }

    // Check password
    const isMatch = await user.comparePassword(candidatePassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials - Password incorrect' });
    }

    // Check if user is active
    if (!user.isActive) {
        return res.status(403).json({ message: 'Account is inactive. Please contact administrator.' });
    }

    // Generate JWT token
    const payload = {
      userId: user._id,
      role: user.role,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }, // Token expiration
      (err, token) => {
        if (err) throw err;

        // Return token and user details (excluding password)
        const userResponse = { ...user._doc };
        delete userResponse.password;

        logger.info(`User logged in successfully: ${user.username} (ID: ${user._id})`);
        res.json({
          message: 'Login successful',
          token,
          user: userResponse,
        });
      }
    );
  } catch (err) {
    logger.error(`Error during login for email/username ${email}: ${err.message}`, { stack: err.stack });
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get current logged-in user's profile
const getMe = async (req, res) => {
  // req.user is populated by the 'protect' middleware
  if (!req.user) {
    return res.status(404).json({ message: 'User not found' });
  }
  // Send back user information (excluding password, which is already handled by the middleware)
  res.json(req.user);
};

// Update a user's information
const updateUser = async (req, res) => {
  const { id } = req.params; // User ID to update
  const updateData = req.body; // Data to update
  const requestingUser = req.user; // User making the request (from protect middleware)

  try {
    // Check if the user ID to update is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Find the user to update
    const userToUpdate = await User.findById(id);

    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    // --- Authorization Checks ---

    // Admin can update any user
    if (requestingUser.role !== 'Admin') {
      // If not an Admin, check if the user is trying to update their own profile
      if (requestingUser._id.toString() !== id) {
        return res.status(403).json({ message: 'Forbidden: You can only update your own profile' });
      }

      // Prevent non-admin users from updating their own role
      if (updateData.role && updateData.role !== requestingUser.role) {
         return res.status(403).json({ message: 'Forbidden: You are not allowed to change your own role' });
      }

       // Prevent non-admin users from updating isActive status
      if (updateData.hasOwnProperty('isActive') && requestingUser._id.toString() === id) {
         return res.status(403).json({ message: 'Forbidden: You are not allowed to change your own active status' });
      }

       // Prevent non-admin users from updating role or isActive of *other* users (already covered by the id check above, but good to be explicit)
       if (requestingUser._id.toString() !== id && (updateData.role || updateData.hasOwnProperty('isActive'))) {
           return res.status(403).json({ message: 'Forbidden: You are not allowed to change the role or active status of other users' });
       }
    }

    // Prevent non-admin from setting role to Admin
    if (requestingUser.role !== 'Admin' && updateData.role === 'Admin') {
         return res.status(403).json({ message: 'Forbidden: Only Admins can assign the Admin role' });
    }

    // Apply updates
    // Exclude fields that should not be updated by this endpoint or based on role
    const allowedUpdates = ['username', 'email', 'firstName', 'lastName']; // Fields users can generally update
    if (requestingUser.role === 'Admin') {
        // Admins can update role and isActive
        allowedUpdates.push('role', 'isActive');
    }
     // Exclude password from direct update via this endpoint (should have a separate change password endpoint)
    const fieldsToUpdate = Object.keys(updateData).filter(field => allowedUpdates.includes(field));

    if (fieldsToUpdate.length === 0 && Object.keys(updateData).length > 0) {
        return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    fieldsToUpdate.forEach(field => {
        userToUpdate[field] = updateData[field];
    });

    // Handle potential email/username uniqueness conflicts during update
    if (updateData.email && updateData.email !== userToUpdate.email) {
       const existingUser = await User.findOne({ email: updateData.email });
       if (existingUser && existingUser._id.toString() !== id) {
           return res.status(400).json({ message: 'Email already exists' });
       }
    }
     if (updateData.username && updateData.username !== userToUpdate.username) {
       const existingUser = await User.findOne({ username: updateData.username });
       if (existingUser && existingUser._id.toString() !== id) {
           return res.status(400).json({ message: 'Username already exists' });
       }
    }

    await userToUpdate.save();

    // Return updated user details (excluding password)
    const userResponse = { ...userToUpdate._doc };
    delete userResponse.password;

    logger.info(`User updated successfully: ${userToUpdate.username} (ID: ${userToUpdate._id}) by user (ID: ${requestingUser._id})`);
    res.json({ message: 'User updated successfully', user: userResponse });

  } catch (err) {
    logger.error(`Error updating user ${id} by user ${requestingUser._id}: ${err.message}`, { stack: err.stack, updateData });
     // Handle Mongoose validation errors (e.g., enum violations)
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ message: 'Validation error', errors: messages });
    }
     // Handle Mongoose duplicate key errors (code 11000)
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({ message: `Duplicate field value: ${field} already exists` });
    }
    res.status(500).json({ message: 'Server error while updating user' });
  }
};

// Export the new controller function
module.exports = {
  register,
  login,
  getMe,
  updateUser
};
