const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('Admin', 'Manager', 'Staff').optional(),
  firstName: Joi.string().allow('').optional(), // Allow empty string
  lastName: Joi.string().allow('').optional(),  // Allow empty string
});

const loginSchema = Joi.object({
  // Allow login with either email or username
  email: Joi.alternatives().try(
    Joi.string().email(),
    Joi.string().min(3).max(30) // Assuming username has same constraints as in registration
  ).required(),
  password: Joi.string().required(),
});

const updateUserSchema = Joi.object({
    username: Joi.string().min(3).max(30).optional(),
    email: Joi.string().email().optional(),
    role: Joi.string().valid('Admin', 'Manager', 'Staff').optional(),
    firstName: Joi.string().allow('').optional(),
    lastName: Joi.string().allow('').optional(),
    isActive: Joi.boolean().optional() // Added isActive as an updatable field
    // Password is not included here, as password changes should be a separate endpoint.
});

module.exports = {
  registerSchema,
  loginSchema,
  updateUserSchema,
};
