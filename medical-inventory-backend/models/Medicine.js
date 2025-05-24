const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  manufacturer: {
    type: String,
    required: true,
    trim: true,
  },
  saltComposition: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  batchNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  expiryDate: {
    type: Date,
    required: true,
    index: true,
  },
  mrp: {
    type: Number,
    required: true,
    min: 0,
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  quantityInStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  hsnCode: {
    type: String,
    trim: true,
  },
  gstPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  scheduleType: {
    type: String,
    enum: ['Generic', 'Schedule H', 'Schedule H1', 'Schedule X', 'OTC', 'Other'],
    default: 'Other',
    trim: true,
  },
  barcode: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, // Allows multiple documents to have a null value for barcode
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier', // Assuming a Supplier model will exist
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to update `updatedAt` timestamp
MedicineSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-findOneAndUpdate hook to update `updatedAt` timestamp
// Mongoose V5.x 'findOneAndUpdate' is an alias for 'findAndModify' which is deprecated.
// Using findOneAndUpdate directly or via a model method will not trigger 'save' hooks.
// We need a query middleware for findOneAndUpdate.
MedicineSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});


module.exports = mongoose.model('Medicine', MedicineSchema);
