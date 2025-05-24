const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db'); // Adjust path as necessary
const User = require('../models/User'); // Adjust path as necessary

// Load env vars
dotenv.config({ path: __dirname + '/../.env' }); // Go up one level to find .env

const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'AdminPassword123',
    role: 'Admin',
    firstName: 'Admin',
    lastName: 'User',
    isActive: true,
  },
  {
    username: 'manager1',
    email: 'manager1@example.com',
    password: 'ManagerPassword123',
    role: 'Manager',
    firstName: 'Manager',
    lastName: 'One',
    isActive: true,
  },
  {
    username: 'staff1',
    email: 'staff1@example.com',
    password: 'StaffPassword123',
    role: 'Staff',
    firstName: 'Staff',
    lastName: 'One',
    isActive: true,
  },
  {
    username: 'staff2',
    email: 'staff2@example.com',
    password: 'StaffPassword123',
    role: 'Staff',
    firstName: 'Staff',
    lastName: 'Two',
    isActive: false, // Example of an inactive user
  },
];

const seedUsers = async () => {
  try {
    await connectDB();
    console.log('MongoDB Connected for Seeding Users...');

    // Clear existing users
    await User.deleteMany({});
    console.log('Existing users deleted.');

    // Insert sample users (passwords will be hashed by pre-save hook)
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`${createdUsers.length} users inserted successfully:`);
    createdUsers.forEach(user => {
        console.log(`- ${user.username} (${user.role})`);
    });

  } catch (err) {
    console.error('Error seeding users:', err.message);
    if (err.errors) { // Mongoose validation errors
        Object.values(err.errors).forEach(error => console.error(`  - ${error.message}`));
    }
  } finally {
    // Ensure DB connection is closed
    await mongoose.disconnect();
    console.log('MongoDB Disconnected after seeding users.');
  }
};

// Run the seeder
seedUsers();
