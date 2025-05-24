const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db'); // Adjust path as necessary
const Medicine = require('../models/Medicine'); // Adjust path as necessary
const User = require('../models/User'); // Adjust path as necessary

// Load env vars
dotenv.config({ path: __dirname + '/../.env' }); // Go up one level to find .env

const sampleMedicines = [
  {
    name: 'Paracetamol 500mg Tablets',
    manufacturer: 'Generic Pharma Ltd.',
    saltComposition: 'Paracetamol',
    batchNumber: 'BATCH001',
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)), // Expires in 2 years
    mrp: 25.50,
    purchasePrice: 18.00,
    quantityInStock: 500,
    hsnCode: '30049099',
    gstPercentage: 12,
    scheduleType: 'Generic',
    barcode: 'MED00001',
  },
  {
    name: 'Amoxicillin 250mg Capsules',
    manufacturer: 'Alpha Drugs Inc.',
    saltComposition: 'Amoxicillin',
    batchNumber: 'BATCH002',
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1, new Date().getMonth() + 6)), // Expires in 1.5 years
    mrp: 75.00,
    purchasePrice: 55.00,
    quantityInStock: 300,
    hsnCode: '30041090',
    gstPercentage: 5,
    scheduleType: 'Schedule H',
    barcode: 'MED00002',
  },
  {
    name: 'Cetirizine 10mg Syrup',
    manufacturer: 'Beta Healthcare',
    saltComposition: 'Cetirizine Dihydrochloride',
    batchNumber: 'BATCH003',
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 3)), // Expires in 3 years
    mrp: 45.00,
    purchasePrice: 30.00,
    quantityInStock: 200,
    hsnCode: '30049034',
    gstPercentage: 12,
    scheduleType: 'OTC',
    barcode: 'MED00003',
  },
  {
    name: 'Multivitamin Tablets',
    manufacturer: 'Wellness Corp.',
    saltComposition: 'Various Vitamins and Minerals',
    batchNumber: 'BATCH004',
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
    mrp: 150.00,
    purchasePrice: 110.00,
    quantityInStock: 400,
    hsnCode: '21069099',
    gstPercentage: 18,
    scheduleType: 'Generic',
    barcode: 'MED00004',
  }
];

const seedMedicines = async () => {
  let dbConnected = false;
  try {
    await connectDB();
    dbConnected = true;
    console.log('MongoDB Connected for Seeding Medicines...');

    // Find an Admin or Manager user to be the 'lastUpdatedBy'
    const adminUser = await User.findOne({ role: { $in: ['Admin', 'Manager'] } });
    if (!adminUser) {
      console.error('No Admin or Manager user found. Please seed users first or ensure one exists.');
      return; // Exit if no suitable user found
    }
    console.log(`Using user '${adminUser.username}' (${adminUser.role}) for 'lastUpdatedBy' field.`);

    // Add lastUpdatedBy to each sample medicine
    const processedSampleMedicines = sampleMedicines.map(med => ({
      ...med,
      lastUpdatedBy: adminUser._id,
    }));

    // Clear existing medicines
    await Medicine.deleteMany({});
    console.log('Existing medicines deleted.');

    // Insert sample medicines
    const createdMedicines = await Medicine.insertMany(processedSampleMedicines);
    console.log(`${createdMedicines.length} medicines inserted successfully:`);
    createdMedicines.forEach(med => {
        console.log(`- ${med.name} (Batch: ${med.batchNumber})`);
    });

  } catch (err) {
    console.error('Error seeding medicines:', err.message);
    if (err.errors) { // Mongoose validation errors
        Object.values(err.errors).forEach(error => console.error(`  - ${error.message}`));
    }
    if (err.code === 11000) { // Duplicate key error
        console.error('  - Duplicate key error:', err.keyValue);
    }
  } finally {
    if (dbConnected) {
      await mongoose.disconnect();
      console.log('MongoDB Disconnected after seeding medicines.');
    }
  }
};

// Run the seeder
seedMedicines();
