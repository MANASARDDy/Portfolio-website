const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const {
  submitContactMessage,
  getContactMessages
} = require('../controllers/contactController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Rate Limiter for Contact Form Submissions
 * Prevents automated bots, brute force, and duplicate flood submissions.
 * Allows at most 10 message submissions per 15 minutes per IP address.
 */
const contactSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many messages sent from this IP. Please wait 15 minutes before sending another message.'
  }
});

/**
 * Validation rules for POST /api/contact
 */
const validateContactForm = [
  body('name')
    .trim()
    .notEmpty().withMessage('Full Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.')
    .escape(),

  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('subject')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('Subject must not exceed 200 characters.')
    .escape(),

  body('message')
    .trim()
    .notEmpty().withMessage('Message body is required.')
    .isLength({ min: 5, max: 5000 }).withMessage('Message must be between 5 and 5000 characters.')
];

// POST /api/contact - Submit a contact message (Public, Rate-Limited, Validated)
router.post('/', contactSubmissionLimiter, validateContactForm, submitContactMessage);

// GET /api/contact - View contact messages (Admin Protected)
router.get('/', requireAdminAuth, getContactMessages);

module.exports = router;
