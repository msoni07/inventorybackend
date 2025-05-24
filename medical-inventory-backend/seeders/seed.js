const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db'); // Adjust path as necessary

// Individual Seeder Functions (assuming they are modified to not self-connect/disconnect)
// For this setup, we'll assume seedUsers.js and seedMedicines.js will be refactored
// to export their main logic function without connecting/disconnecting themselves.
// If they still manage their own connections, this master script would be simpler
// and just call them sequentially without managing a global connection.

// For now, let's proceed as if we will refactor them:
// const seedUsersLogic = require('./seedUsers').seedUsersLogic; // Hypothetical export
// const seedMedicinesLogic = require('./seedMedicines').seedMedicinesLogic; // Hypothetical export

// Load env vars
dotenv.config({ path: __dirname + '/../.env' });

const seedAll = async () => {
  let dbConnected = false;
  try {
    await connectDB();
    dbConnected = true;
    console.log('MongoDB Connected for Master Seeder...');

    // --- Seeding Users ---
    // Option 1: If seedUsers.js manages its own connection and is executable
    console.log('Running user seeder...');
    // We need to run it as a separate process if it connects/disconnects on its own
    const { execSync } = require('child_process');
    try {
        execSync('node seeders/seedUsers.js', { stdio: 'inherit' });
        console.log('User seeding script completed.');
    } catch (userSeedError) {
        console.error('Error running user seeder script:', userSeedError.message);
        // Decide if to continue or stop
        // For now, we'll log and attempt to continue to medicine seeding
    }


    // --- Seeding Medicines ---
    // Option 1: If seedMedicines.js manages its own connection and is executable
    console.log('\nRunning medicine seeder...');
    try {
        execSync('node seeders/seedMedicines.js', { stdio: 'inherit' });
        console.log('Medicine seeding script completed.');
    } catch (medicineSeedError) {
        console.error('Error running medicine seeder script:', medicineSeedError.message);
    }

    // Option 2: If seeders export their logic (preferred for a master script)
    // console.log('Starting to seed users...');
    // await seedUsersLogic(); // This would require seedUsers.js to export seedUsersLogic
    // console.log('Users seeded successfully.');

    // console.log('Starting to seed medicines...');
    // await seedMedicinesLogic(); // This would require seedMedicines.js to export seedMedicinesLogic
    // console.log('Medicines seeded successfully.');

    console.log('\nAll data seeded successfully!');

  } catch (err) {
    console.error('Error in master seeder:', err.message);
    if (err.errors) {
        Object.values(err.errors).forEach(error => console.error(`  - ${error.message}`));
    }
  } finally {
    if (dbConnected) {
      await mongoose.disconnect();
      console.log('MongoDB Disconnected after master seeding.');
    }
  }
};

seedAll();
