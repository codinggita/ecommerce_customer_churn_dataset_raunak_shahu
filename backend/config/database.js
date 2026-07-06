const mongoose = require('mongoose');
const dns = require('dns');

// Override DNS to use Google/Cloudflare public DNS for MongoDB Atlas SRV resolution
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce_analytics';
    
    // Set strictQuery to prepare for Mongoose upgrades
    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(mongoURI, {

    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
