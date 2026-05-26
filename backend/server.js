require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const loggingMiddleware = require('./middlewares/loggingMiddleware');
const errorHandler = require('./middlewares/errorMiddleware');
const apiRouter = require('./routes');
const ApiResponse = require('./utils/apiResponse');

// Initialize express app
const app = express();

// Connect to MongoDB Database
connectDB();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Request Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom Logging Middleware (Morgan)
app.use(loggingMiddleware());

// Mount central router under versioned path /api/v1
app.use('/api/v1', apiRouter);

// Fallback 404 Route Handler
app.use((req, res, next) => {
  const error = new Error(`Resource not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start listening for incoming connections
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Export server instance for potential unit testing
module.exports = server;
