const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/rbacMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');
const { addMedicineSchema, updateMedicineSchema } = require('../validators/medicineValidators');

// @route   POST api/inventory/medicines
// @desc    Add a new medicine
// @access  Private (Admin, Manager)
router.post(
  '/medicines',
  protect,
  authorize(['Admin', 'Manager']),
  validateRequest(addMedicineSchema),
  inventoryController.addMedicine
);

// @route   GET api/inventory/medicines
// @desc    Get all medicines
// @access  Private (All authenticated users)
router.get(
  '/medicines',
  protect,
  inventoryController.getAllMedicines
);

// @route   GET api/inventory/medicines/:id
// @desc    Get a single medicine by ID
// @access  Private (All authenticated users)
router.get(
  '/medicines/:id',
  protect,
  inventoryController.getMedicineById
);

// @route   PUT api/inventory/medicines/:id
// @desc    Update a medicine
// @access  Private (Admin, Manager)
router.put(
  '/medicines/:id',
  protect,
  authorize(['Admin', 'Manager']),
  validateRequest(updateMedicineSchema),
  inventoryController.updateMedicine
);

// @route   DELETE api/inventory/medicines/:id
// @desc    Delete a medicine
// @access  Private (Admin)
router.delete(
  '/medicines/:id',
  protect,
  authorize(['Admin']),
  inventoryController.deleteMedicine
);

module.exports = router;
