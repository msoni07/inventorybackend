const Joi = require('joi');
const logger = require('../config/logger'); // Assuming logger is setup

const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors
      allowUnknown: false, // Do not allow properties not defined in schema for 'body'
      stripUnknown: property !== 'body', // For 'params' or 'query', strip unknown, for 'body' keep it strict
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      logger.warn(`Validation error for ${req.method} ${req.originalUrl}: ${errorMessage}`, {
        requestBody: req.body,
        requestParams: req.params,
        requestQuery: req.query,
        validationDetails: error.details
      });
      return res.status(400).json({ message: 'Validation failed', errors: error.details });
    }

    // If validation is successful, req[property] can be replaced with the validated 'value'
    // This is useful for type coercion, default values, etc.
    req[property] = value;
    next();
  };
};

module.exports = { validateRequest };
