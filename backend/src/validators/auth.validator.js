// src/validators/auth.validator.js
import { body } from 'express-validator';

export const validateSendOtp = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .if(body('otp').not().exists())
    .isLength({ min: 1 })
    .withMessage('Password is required when OTP is not provided.'),
  body('otp')
    .if(body('password').not().exists())
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits when password is not provided.'),
];