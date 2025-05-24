const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const logger = require('../config/logger'); // Import logger

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

module.exports = {
  register,
  login,
};
