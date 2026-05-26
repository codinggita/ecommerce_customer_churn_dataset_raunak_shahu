const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a customer name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide a customer email'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  age: {
    type: Number,
    required: [true, 'Please provide customer age'],
    index: true,
  },
  gender: {
    type: String,
    required: [true, 'Please provide customer gender'],
    trim: true,
    index: true,
  },
  country: {
    type: String,
    required: [true, 'Please provide customer country'],
    trim: true,
    index: true,
  },
  city: {
    type: String,
    required: [true, 'Please provide customer city'],
    trim: true,
    index: true,
  },
  membershipYears: {
    type: Number,
    required: [true, 'Please provide membership years'],
    index: true,
  },
  loginFrequency: {
    type: Number,
    required: [true, 'Please provide login frequency'],
    index: true,
  },
  sessionDuration: {
    type: Number,
    required: [true, 'Please provide session duration average'],
  },
  pagesPerSession: {
    type: Number,
    required: [true, 'Please provide pages per session'],
  },
  cartAbandonmentRate: {
    type: Number,
    required: [true, 'Please provide cart abandonment rate'],
  },
  wishlistItems: {
    type: Number,
    required: [true, 'Please provide wishlist items count'],
  },
  purchases: {
    type: Number,
    required: [true, 'Please provide total purchases'],
    index: true,
  },
  averageOrderValue: {
    type: Number,
    required: [true, 'Please provide average order value'],
  },
  daysSinceLastPurchase: {
    type: Number,
    required: [true, 'Please provide days since last purchase'],
  },
  discountRate: {
    type: Number,
    required: [true, 'Please provide discount usage rate'],
  },
  returnsRate: {
    type: Number,
    required: [true, 'Please provide returns rate'],
  },
  emailOpenRate: {
    type: Number,
    required: [true, 'Please provide email open rate'],
  },
  customerServiceCalls: {
    type: Number,
    required: [true, 'Please provide customer service calls count'],
  },
  productReviewsWritten: {
    type: Number,
    required: [true, 'Please provide product reviews written count'],
  },
  socialMediaEngagementScore: {
    type: Number,
    default: 0,
  },
  mobileUsage: {
    type: Number,
    required: [true, 'Please provide mobile app usage minutes'],
  },
  paymentMethodDiversity: {
    type: Number,
    required: [true, 'Please provide payment method diversity'],
  },
  lifetimeValue: {
    type: Number,
    required: [true, 'Please provide customer lifetime value'],
    index: true,
  },
  creditBalance: {
    type: Number,
    required: [true, 'Please provide credit balance'],
    index: true,
  },
  churned: {
    type: Number,
    required: [true, 'Please provide churned status (0 or 1)'],
    index: true,
  },
  signupQuarter: {
    type: String,
    required: [true, 'Please provide signup quarter'],
    trim: true,
    index: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Customer', customerSchema);
