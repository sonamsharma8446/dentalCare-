import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import ApiError from '../utils/ApiError.js';

// Slows down password guessing. Only FAILED attempts count (successful logins do not),
// and the limit is per IP address.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.authRateLimit,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many attempts. Please try again in 15 minutes.'));
  },
});

// Limits the public Contact form: every message counts, per IP address, per hour
export const enquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: env.enquiryRateLimit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'You have sent too many messages. Please try again later.'));
  },
});