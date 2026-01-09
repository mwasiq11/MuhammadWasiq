import { body } from 'express-validator';

export const createUserValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
];

export const askQuestionValidation = [
  body('userId').isInt({ min: 1 }).withMessage('Valid user ID is required'),
  body('question').trim().notEmpty().withMessage('Question is required'),
];

export const createSubscriptionValidation = [
  body('userId').isInt({ min: 1 }).withMessage('Valid user ID is required'),
  body('bundleType')
    .isIn(['Basic', 'Pro', 'Enterprise'])
    .withMessage('Bundle type must be Basic, Pro, or Enterprise'),
  body('billingCycle')
    .isIn(['monthly', 'yearly'])
    .withMessage('Billing cycle must be monthly or yearly'),
  body('autoRenew').optional().isBoolean().withMessage('Auto-renew must be a boolean'),
];

export const toggleAutoRenewValidation = [
  body('autoRenew').isBoolean().withMessage('Auto-renew must be a boolean'),
];
