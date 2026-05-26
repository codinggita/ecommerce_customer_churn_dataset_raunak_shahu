const fs = require('fs');
const { Customer } = require('../models');

const FirstNames = [
  'John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Jessica', 
  'Robert', 'Karen', 'William', 'Nancy', 'Joseph', 'Betty', 'Thomas', 'Lisa', 
  'Daniel', 'Dorothy', 'Matthew', 'Sandra', 'Christopher', 'Ashley', 'Amanda', 
  'Donald', 'Melissa', 'Paul', 'Donna', 'Mark', 'Carol', 'George', 'Michelle'
];

const LastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker'
];

const parseNumber = (val, defaultVal = 0) => {
  if (val === undefined || val === null || val === '') return defaultVal;
  const num = Number(val);
  return isNaN(num) ? defaultVal : num;
};

/**
 * Clean data and seed database
 * @param {String} filePath - Path to the dataset JSON file
 */
const seedDatabase = async (filePath) => {
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const records = JSON.parse(rawData);

    console.log(`Read ${records.length} records from dataset.`);

    // Clear existing records
    await Customer.deleteMany({});
    console.log('Cleared existing Customer collection.');

    const cleanRecords = records.map((record, i) => {
      const fName = FirstNames[i % FirstNames.length];
      const lName = LastNames[Math.floor(i / FirstNames.length) % LastNames.length];
      const name = `${fName} ${lName}`;
      const email = `${fName.toLowerCase()}.${lName.toLowerCase()}.${i + 1}@example.com`;

      return {
        name,
        email,
        age: parseNumber(record.Age, 30),
        gender: record.Gender || 'Other',
        country: record.Country || 'Unknown',
        city: record.City || 'Unknown',
        membershipYears: parseNumber(record.Membership_Years, 0),
        loginFrequency: parseNumber(record.Login_Frequency, 0),
        sessionDuration: parseNumber(record.Session_Duration_Avg, 0),
        pagesPerSession: parseNumber(record.Pages_Per_Session, 0),
        cartAbandonmentRate: parseNumber(record.Cart_Abandonment_Rate, 0),
        wishlistItems: parseNumber(record.Wishlist_Items, 0),
        purchases: parseNumber(record.Total_Purchases, 0),
        averageOrderValue: parseNumber(record.Average_Order_Value, 0),
        daysSinceLastPurchase: parseNumber(record.Days_Since_Last_Purchase, 0),
        discountRate: parseNumber(record.Discount_Usage_Rate, 0),
        returnsRate: parseNumber(record.Returns_Rate, 0),
        emailOpenRate: parseNumber(record.Email_Open_Rate, 0),
        customerServiceCalls: parseNumber(record.Customer_Service_Calls, 0),
        productReviewsWritten: parseNumber(record.Product_Reviews_Written, 0),
        socialMediaEngagementScore: parseNumber(record.Social_Media_Engagement_Score, 0),
        mobileUsage: parseNumber(record.Mobile_App_Usage, 0),
        paymentMethodDiversity: parseNumber(record.Payment_Method_Diversity, 0),
        lifetimeValue: parseNumber(record.Lifetime_Value, 0),
        creditBalance: parseNumber(record.Credit_Balance, 0),
        churned: parseNumber(record.Churned, 0),
        signupQuarter: record.Signup_Quarter || 'Q1',
        isDeleted: false,
      };
    });

    console.log('Seeding clean customer records (chunked inserts)...');
    
    // Process insertions in chunks of 2000 records to prevent memory limits
    const chunkSize = 2000;
    for (let i = 0; i < cleanRecords.length; i += chunkSize) {
      const chunk = cleanRecords.slice(i, i + chunkSize);
      await Customer.insertMany(chunk, { ordered: false });
      console.log(`Inserted chunk of ${chunk.length} records (${i} to ${i + chunk.length})`);
    }

    console.log('Database seeding successfully finished!');
    return cleanRecords.length;
  } catch (error) {
    console.error(`Database seeding error: ${error.message}`);
    throw error;
  }
};

module.exports = seedDatabase;
