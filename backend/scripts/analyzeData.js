require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const { Customer } = require('../models');

async function runAnalysis() {
  console.log('Connecting to database...');
  await connectDB();

  try {
    console.log('\n==================================================');
    console.log('       MONGODB CUSTOMER CHURN ANALYTICS REPORT     ');
    console.log('==================================================');

    // 1. Total Count
    const totalCount = await Customer.countDocuments({ isDeleted: false });
    console.log(`\n• Total Active Records in Database: ${totalCount.toLocaleString()}`);

    if (totalCount === 0) {
      console.log('No customer records found. Please seed the database first using "npm run seed".');
      mongoose.connection.close();
      return;
    }

    // 2. Churn Rate Distribution
    const churnSummary = await Customer.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$churned',
          count: { $sum: 1 },
          avgLTV: { $avg: '$lifetimeValue' },
          avgAge: { $avg: '$age' },
          avgCalls: { $avg: '$customerServiceCalls' }
        }
      }
    ]);

    console.log('\n• Churn vs Retention Breakdown:');
    console.log('--------------------------------------------------');
    let activeCount = 0;
    let churnedCount = 0;
    
    churnSummary.forEach(group => {
      const label = group._id === 1 ? 'CHURNED (At Risk)' : 'ACTIVE (Retained)';
      if (group._id === 1) churnedCount = group.count;
      else activeCount = group.count;

      console.log(`${label}:`);
      console.log(`  - Count: ${group.count.toLocaleString()} (${((group.count / totalCount) * 100).toFixed(1)}%)`);
      console.log(`  - Average Lifetime Value (LTV): $${group.avgLTV.toFixed(2)}`);
      console.log(`  - Average Age: ${group.avgAge.toFixed(1)} years`);
      console.log(`  - Avg Customer Service Calls: ${group.avgCalls.toFixed(1)} calls`);
    });

    const churnRate = ((churnedCount / totalCount) * 100).toFixed(1);
    console.log(`\n• Overall Customer Churn Rate: ${churnRate}%`);

    // 3. Performance by Top 5 Countries
    const countrySummary = await Customer.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 },
          avgLTV: { $avg: '$lifetimeValue' },
          churnedCount: {
            $sum: { $cond: [{ $eq: ['$churned', 1] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    console.log('\n• Top 5 Countries by Customer Share:');
    console.log('--------------------------------------------------');
    countrySummary.forEach(country => {
      const cRate = ((country.churnedCount / country.count) * 100).toFixed(1);
      console.log(`${country._id}:`);
      console.log(`  - Customers: ${country.count.toLocaleString()} (${((country.count / totalCount) * 100).toFixed(1)}%)`);
      console.log(`  - Average LTV: $${country.avgLTV.toFixed(2)}`);
      console.log(`  - Local Churn Rate: ${cRate}%`);
    });

    // 4. Lifetime Value & Credit Balance highlights
    const highlights = await Customer.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          maxLTV: { $max: '$lifetimeValue' },
          avgOrderValue: { $avg: '$averageOrderValue' },
          avgCreditBalance: { $avg: '$creditBalance' }
        }
      }
    ]);

    if (highlights.length > 0) {
      console.log('\n• Database Value Highlights:');
      console.log('--------------------------------------------------');
      console.log(`  - Max Customer LTV Recorded: $${highlights[0].maxLTV.toFixed(2)}`);
      console.log(`  - Average Order Value: $${highlights[0].avgOrderValue.toFixed(2)}`);
      console.log(`  - Average Wallet Credit Balance: $${highlights[0].avgCreditBalance.toFixed(2)}`);
    }

  } catch (error) {
    console.error('Analysis failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

runAnalysis();
