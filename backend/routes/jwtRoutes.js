const express = require('express');
const router = express.Router();
const jwtController = require('../controllers/jwtController');
const { authValidation } = require('../validations');
const validate = require('../middlewares/validationMiddleware');

/**
 * @route   POST /api/v1/jwt/verify-token
 * @desc    Verify if JWT token is valid
 * @access  Public
 */
router.post('/verify-token', authValidation.validateVerifyToken, validate, jwtController.verifyToken);

/**
 * @route   POST /api/v1/jwt/refresh-token
 * @desc    Get new JWT token using existing valid token
 * @access  Public
 */
router.post('/refresh-token', authValidation.validateRefreshToken, validate, jwtController.refreshToken);

module.exports = router;
