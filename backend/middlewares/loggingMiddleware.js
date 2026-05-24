const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const logDirectory = path.join(__dirname, '../logs');

// Ensure log directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Create a write stream for access log
const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, 'access.log'),
  { flags: 'a' }
);

/**
 * Configure Morgan based on environment
 */
const loggingMiddleware = () => {
  if (process.env.NODE_ENV === 'production') {
    return morgan('combined', { stream: accessLogStream });
  }
  // In development, log to console and optionally to file
  return morgan('dev');
};

module.exports = loggingMiddleware;
