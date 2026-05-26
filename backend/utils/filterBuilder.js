const parseNumber = (val) => {
  if (val === undefined || val === null || val === '') return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
};

/**
 * Build Mongoose query filter from URL query parameters
 * @param {Object} queryParams - req.query object
 * @returns {Object} Mongoose query object
 */
const buildCustomerFilter = (queryParams) => {
  const filter = { isDeleted: { $ne: true } }; // Exclude soft deleted items by default

  // Demographics
  if (queryParams.country) {
    filter.country = { $regex: new RegExp(`^${queryParams.country}$`, 'i') };
  }
  if (queryParams.city) {
    filter.city = { $regex: new RegExp(`^${queryParams.city}$`, 'i') };
  }
  if (queryParams.gender) {
    filter.gender = { $regex: new RegExp(`^${queryParams.gender}$`, 'i') };
  }
  if (queryParams.signupQuarter) {
    filter.signupQuarter = { $regex: new RegExp(`^${queryParams.signupQuarter}$`, 'i') };
  }

  // Age limits
  const minAge = parseNumber(queryParams.minAge);
  const maxAge = parseNumber(queryParams.maxAge);
  if (minAge !== null || maxAge !== null) {
    filter.age = {};
    if (minAge !== null) filter.age.$gte = minAge;
    if (maxAge !== null) filter.age.$lte = maxAge;
  }

  // Exact age mapping
  if (queryParams.age) {
    const age = parseNumber(queryParams.age);
    if (age !== null) filter.age = age;
  }

  // Churned status
  if (queryParams.churned !== undefined && queryParams.churned !== '') {
    const churnedVal = parseNumber(queryParams.churned);
    if (churnedVal !== null) {
      filter.churned = churnedVal;
    }
  }

  // Membership Years
  if (queryParams.membershipYears !== undefined && queryParams.membershipYears !== '') {
    const mYears = parseNumber(queryParams.membershipYears);
    if (mYears !== null) {
      filter.membershipYears = mYears;
    }
  }

  // Purchases Min
  if (queryParams.minPurchases !== undefined && queryParams.minPurchases !== '') {
    const minPurchases = parseNumber(queryParams.minPurchases);
    if (minPurchases !== null) {
      filter.purchases = { $gte: minPurchases };
    }
  }

  // Lifetime Value Min
  if (queryParams.minLifetime !== undefined && queryParams.minLifetime !== '') {
    const minLifetime = parseNumber(queryParams.minLifetime);
    if (minLifetime !== null) {
      filter.lifetimeValue = { $gte: minLifetime };
    }
  }

  // Credit Balance Min
  if (queryParams.minCredit !== undefined && queryParams.minCredit !== '') {
    const minCredit = parseNumber(queryParams.minCredit);
    if (minCredit !== null) {
      filter.creditBalance = { $gte: minCredit };
    }
  }

  // Login Frequency Min
  if (queryParams.minLoginFrequency !== undefined && queryParams.minLoginFrequency !== '') {
    const minLogin = parseNumber(queryParams.minLoginFrequency);
    if (minLogin !== null) {
      filter.loginFrequency = { $gte: minLogin };
    }
  }

  // Mobile App Usage Min
  if (queryParams.minMobileUsage !== undefined && queryParams.minMobileUsage !== '') {
    const minMobile = parseNumber(queryParams.minMobileUsage);
    if (minMobile !== null) {
      filter.mobileUsage = { $gte: minMobile };
    }
  }

  // Discount Usage Rate Min
  if (queryParams.minDiscountRate !== undefined && queryParams.minDiscountRate !== '') {
    const minDiscount = parseNumber(queryParams.minDiscountRate);
    if (minDiscount !== null) {
      filter.discountRate = { $gte: minDiscount };
    }
  }

  // Session Duration Min
  if (queryParams.minSessionDuration !== undefined && queryParams.minSessionDuration !== '') {
    const minSession = parseNumber(queryParams.minSessionDuration);
    if (minSession !== null) {
      filter.sessionDuration = { $gte: minSession };
    }
  }

  return filter;
};

module.exports = {
  buildCustomerFilter,
};
