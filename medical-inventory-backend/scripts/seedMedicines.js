const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const logger = require('../config/logger');
require('dotenv').config();

// Placeholder User ID for seeding. Replace with a real user ID if available.
const SEED_USER_ID = process.env.SEED_USER_ID || '60c72b2f9b1e8b001c8e4d0a'; // Example valid ObjectId

const sampleMedicines = [
  {
    name: "Paracetamol 500mg",
    manufacturer: "ABC Pharmaceuticals",
    saltComposition: "Paracetamol",
    batchNumber: "BATCH001",
    expiryDate: new Date("2025-12-31"),
    mrp: 25,
    purchasePrice: 15,
    quantityInStock: 1000,
    hsnCode: "30049099",
    gstPercentage: 12,
    scheduleType: "Schedule H",
    barcode: "MED001",
    lastUpdatedBy: SEED_USER_ID
  },
  {
    name: "Amoxicillin 250mg",
    manufacturer: "XYZ Pharma",
    saltComposition: "Amoxicillin Trihydrate",
    batchNumber: "BATCH002",
    expiryDate: new Date("2025-11-30"),
    mrp: 45,
    purchasePrice: 30,
    quantityInStock: 500,
    hsnCode: "30041090",
    gstPercentage: 12,
    scheduleType: "Schedule H",
    barcode: "MED002",
    lastUpdatedBy: SEED_USER_ID
  },
  {
    name: "Omeprazole 20mg",
    manufacturer: "MediCorp",
    saltComposition: "Omeprazole",
    batchNumber: "BATCH003",
    expiryDate: new Date("2026-01-15"),
    mrp: 35,
    purchasePrice: 25,
    quantityInStock: 750,
    hsnCode: "30049099",
    gstPercentage: 12,
    scheduleType: "Schedule H",
    barcode: "MED003",
    lastUpdatedBy: SEED_USER_ID
  },
  {
    name: "Cetirizine 10mg",
    manufacturer: "HealthPlus",
    saltComposition: "Cetirizine Hydrochloride",
    batchNumber: "BATCH004",
    expiryDate: new Date("2025-10-31"),
    mrp: 30,
    purchasePrice: 20,
    quantityInStock: 600,
    hsnCode: "30049099",
    gstPercentage: 12,
    scheduleType: "Schedule H",
    barcode: "MED004",
    lastUpdatedBy: SEED_USER_ID
  },
  {
    name: "Metformin 500mg",
    manufacturer: "DiabeCare",
    saltComposition: "Metformin Hydrochloride",
    batchNumber: "BATCH005",
    expiryDate: new Date("2026-02-28"),
    mrp: 40,
    purchasePrice: 28,
    quantityInStock: 800,
    hsnCode: "30049099",
    gstPercentage: 12,
    scheduleType: "Schedule H",
    barcode: "MED005",
    lastUpdatedBy: SEED_USER_ID
  }
];

// Generate additional 45 medicines with random variations
const generateAdditionalMedicines = () => {
  const manufacturers = ["ABC Pharma", "XYZ Meds", "HealthPlus", "MediCorp", "DiabeCare", "LifeCare", "Wellness Pharma"];
  const saltCompositions = ["Paracetamol", "Amoxicillin", "Omeprazole", "Cetirizine", "Metformin", "Azithromycin", "Pantoprazole"];
  const scheduleTypes = ["Schedule H", "Schedule H1", "Schedule X"];
  const hsnCodes = ["30049099", "30041090", "30049091"];
  
  const additionalMedicines = [];
  
  for (let i = 6; i <= 50; i++) {
    const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    const saltComposition = saltCompositions[Math.floor(Math.random() * saltCompositions.length)];
    const scheduleType = scheduleTypes[Math.floor(Math.random() * scheduleTypes.length)];
    const hsnCode = hsnCodes[Math.floor(Math.random() * hsnCodes.length)];
    
    const medicine = {
      name: `${saltComposition} ${Math.floor(Math.random() * 1000)}mg`,
      manufacturer,
      saltComposition,
      batchNumber: `BATCH${i.toString().padStart(3, '0')}`,
      expiryDate: new Date(2025 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      mrp: Math.floor(Math.random() * 100) + 20,
      purchasePrice: Math.floor(Math.random() * 70) + 10,
      quantityInStock: Math.floor(Math.random() * 1000) + 100,
      hsnCode,
      gstPercentage: [5, 12, 18][Math.floor(Math.random() * 3)],
      scheduleType,
      barcode: `MED${i.toString().padStart(3, '0')}`,
      lastUpdatedBy: SEED_USER_ID
    };
    
    additionalMedicines.push(medicine);
  }
  
  return additionalMedicines;
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Clear existing medicines
    await Medicine.deleteMany({});
    logger.info('Cleared existing medicines');

    // Combine initial and generated medicines
    const allMedicines = [...sampleMedicines, ...generateAdditionalMedicines()];

    // Insert all medicines
    await Medicine.insertMany(allMedicines);
    logger.info(`Successfully seeded ${allMedicines.length} medicines`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase(); 