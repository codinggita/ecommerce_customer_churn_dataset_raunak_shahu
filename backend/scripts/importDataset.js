require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const seedDatabase = require('../utils/seedDatabase');

const runImport = async () => {
  try {
    // Connect to Database
    await connectDB();

    const datasetPath = path.join(__dirname, '../data/ecommerce_customer_churn_dataset.json');
    console.log(`Dataset path: ${datasetPath}`);

    const totalSeeded = await seedDatabase(datasetPath);
    console.log(`Done! Successfully seeded ${totalSeeded} customers.`);

    // Close Connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Import script failed: ${error.message}`);
    try {
      await mongoose.connection.close();
    } catch (e) {}
    process.exit(1);
  }
};

runImport();
