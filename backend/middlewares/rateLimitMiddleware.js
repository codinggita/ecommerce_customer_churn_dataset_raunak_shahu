const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

// Configure standard rate limiting for the API
const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 100, // Limit each IP to 10000 in dev, 100 in production
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = rateLimitMiddleware;
