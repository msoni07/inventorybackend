const Joi = require('joi');

const addMedicineSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  manufacturer: Joi.string().trim().min(1).required(),
  saltComposition: Joi.string().trim().min(1).required(),
  batchNumber: Joi.string().trim().alphanum().min(1).required(),
  expiryDate: Joi.date().iso().required(),
  mrp: Joi.number().positive().required(),
  purchasePrice: Joi.number().min(0).required(), // Can be 0, but usually positive
  quantityInStock: Joi.number().integer().min(0).required(),
  hsnCode: Joi.string().trim().alphanum().allow('').optional(),
  gstPercentage: Joi.number().min(0).max(100).optional().default(0),
  scheduleType: Joi.string().valid('Generic', 'Schedule H', 'Schedule H1', 'Schedule X', 'OTC', 'Other').optional().default('Other'),
  barcode: Joi.string().trim().alphanum().allow('').optional(),
});

const updateMedicineSchema = Joi.object({
  name: Joi.string().trim().min(1).optional(),
  manufacturer: Joi.string().trim().min(1).optional(),
  saltComposition: Joi.string().trim().min(1).optional(),
  batchNumber: Joi.string().trim().alphanum().min(1).optional(),
  expiryDate: Joi.date().iso().optional(),
  mrp: Joi.number().positive().optional(),
  purchasePrice: Joi.number().min(0).optional(),
  quantityInStock: Joi.number().integer().min(0).optional(),
  hsnCode: Joi.string().trim().alphanum().allow('').optional(),
  gstPercentage: Joi.number().min(0).max(100).optional(),
  scheduleType: Joi.string().valid('Generic', 'Schedule H', 'Schedule H1', 'Schedule X', 'OTC', 'Other').optional(),
  barcode: Joi.string().trim().alphanum().allow('').optional(),
}).min(1); // Requires at least one field to be present for an update

module.exports = {
  addMedicineSchema,
  updateMedicineSchema,
};
