const Medicine = require('../models/Medicine');
const logger = require('../config/logger'); // Import logger

// Add a new medicine
const addMedicine = async (req, res) => {
  try {
    const {
      name,
      manufacturer,
      saltComposition,
      batchNumber,
      expiryDate,
      mrp,
      purchasePrice,
      quantityInStock,
      hsnCode,
      gstPercentage,
      scheduleType,
      barcode,
      supplier,
    } = req.body;

    // Check for existing medicine by batchNumber or barcode (if provided and unique)
    if (batchNumber) {
      const existingBatch = await Medicine.findOne({ batchNumber });
      if (existingBatch) {
        return res.status(400).json({ message: `Medicine with batch number ${batchNumber} already exists.` });
      }
    }
    if (barcode) {
      const existingBarcode = await Medicine.findOne({ barcode });
      if (existingBarcode) {
        return res.status(400).json({ message: `Medicine with barcode ${barcode} already exists.` });
      }
    }

    const newMedicine = new Medicine({
      name,
      manufacturer,
      saltComposition,
      batchNumber,
      expiryDate,
      mrp,
      purchasePrice,
      quantityInStock,
      hsnCode,
      gstPercentage,
      scheduleType,
      barcode,
      supplier, // Assuming supplier ID is sent in the request if available
      lastUpdatedBy: req.user._id, // Populated by 'protect' middleware
    });

    const savedMedicine = await newMedicine.save();
    logger.info(`Medicine added successfully: ${savedMedicine.name} (ID: ${savedMedicine._id}), Batch: ${savedMedicine.batchNumber}, Added by: ${req.user.username}`);
    res.status(201).json({ message: 'Medicine added successfully', medicine: savedMedicine });
  } catch (err) {
    logger.error(`Error adding medicine (Name: ${req.body.name}, Batch: ${req.body.batchNumber}): ${err.message}`, { stack: err.stack, user: req.user.username });
    // Check for Mongoose duplicate key error (code 11000)
    if (err.code === 11000) {
        if (err.keyPattern && err.keyPattern.batchNumber) {
            return res.status(400).json({ message: `Duplicate batch number: ${err.keyValue.batchNumber}` });
        }
        if (err.keyPattern && err.keyPattern.barcode) {
            return res.status(400).json({ message: `Duplicate barcode: ${err.keyValue.barcode}` });
        }
        return res.status(400).json({ message: 'Duplicate key error. Check batch number or barcode.' });
    }
    res.status(500).json({ message: 'Server error while adding medicine', error: err.message });
  }
};

// Get all medicines
const getAllMedicines = async (req, res) => {
  try {
    // Basic pagination (can be enhanced)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const medicines = await Medicine.find()
      .populate('supplier', 'name contactPerson') // Example: Populate supplier name
      .populate('lastUpdatedBy', 'username email') // Populate user who last updated
      .sort({ expiryDate: 1 }) // Sort by expiry date (ascending)
      .skip(skip)
      .limit(limit);
    
    const totalMedicines = await Medicine.countDocuments();

    res.json({
        medicines,
        currentPage: page,
        totalPages: Math.ceil(totalMedicines / limit),
        totalCount: totalMedicines
    });
  } catch (err) {
    logger.error(`Error fetching all medicines: ${err.message}`, { stack: err.stack, user: req.user ? req.user.username : 'N/A' });
    res.status(500).json({ message: 'Server error while fetching medicines', error: err.message });
  }
};

// Get a single medicine by ID
const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id)
      .populate('supplier', 'name contactPerson')
      .populate('lastUpdatedBy', 'username email');

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json(medicine);
  } catch (err) {
    logger.error(`Error fetching medicine by ID ${req.params.id}: ${err.message}`, { stack: err.stack, user: req.user ? req.user.username : 'N/A' });
    if (err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid medicine ID format' });
    }
    res.status(500).json({ message: 'Server error while fetching medicine', error: err.message });
  }
};

// Update a medicine
const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Ensure lastUpdatedBy is set
    updateData.lastUpdatedBy = req.user._id;
    // Ensure updatedAt is set
    updateData.updatedAt = Date.now();


    // Check for potential duplicate batchNumber or barcode if they are being changed
    if (updateData.batchNumber) {
        const existingBatch = await Medicine.findOne({ batchNumber: updateData.batchNumber, _id: { $ne: id } });
        if (existingBatch) {
            return res.status(400).json({ message: `Another medicine with batch number ${updateData.batchNumber} already exists.` });
        }
    }
    if (updateData.barcode) {
        const existingBarcode = await Medicine.findOne({ barcode: updateData.barcode, _id: { $ne: id } });
        if (existingBarcode) {
            return res.status(400).json({ message: `Another medicine with barcode ${updateData.barcode} already exists.` });
        }
    }

    const updatedMedicine = await Medicine.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true } // new: true returns the updated document, runValidators ensures schema validation
    ).populate('supplier', 'name contactPerson')
     .populate('lastUpdatedBy', 'username email');

    if (!updatedMedicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    logger.info(`Medicine updated successfully: ${updatedMedicine.name} (ID: ${updatedMedicine._id}), Updated by: ${req.user.username}`);
    res.json({ message: 'Medicine updated successfully', medicine: updatedMedicine });
  } catch (err) {
    logger.error(`Error updating medicine ID ${id}: ${err.message}`, { stack: err.stack, user: req.user.username, updateData: req.body });
     if (err.code === 11000) { // Mongoose duplicate key error
        if (err.keyPattern && err.keyPattern.batchNumber) {
            return res.status(400).json({ message: `Duplicate batch number: ${err.keyValue.batchNumber}` });
        }
        if (err.keyPattern && err.keyPattern.barcode) {
            return res.status(400).json({ message: `Duplicate barcode: ${err.keyValue.barcode}` });
        }
        return res.status(400).json({ message: 'Duplicate key error during update.' });
    }
    if (err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid medicine ID format' });
    }
    res.status(500).json({ message: 'Server error while updating medicine', error: err.message });
  }
};

// Delete a medicine
const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    logger.info(`Medicine deleted successfully: ${medicine.name} (ID: ${req.params.id}), Deleted by: ${req.user.username}`);
    res.json({ message: 'Medicine deleted successfully', medicineId: req.params.id });
  } catch (err) {
    logger.error(`Error deleting medicine ID ${req.params.id}: ${err.message}`, { stack: err.stack, user: req.user.username });
    if (err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid medicine ID format' });
    }
    res.status(500).json({ message: 'Server error while deleting medicine', error: err.message });
  }
};

module.exports = {
  addMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
};
