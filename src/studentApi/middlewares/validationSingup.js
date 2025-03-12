const { check, validationResult } = require('express-validator');

const validateSignup = [
    check('name')
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a valid string')
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters long')
    .matches(/^[A-Za-z\s]+$/).withMessage('Name must not contain numbers or special characters'),

  check('email')
    .isEmail().withMessage('Invalid email format')
    .matches(/@gmail\.com$/).withMessage('Only Gmail addresses are allowed'),

  check('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[!@#$%^&*(),.?"-=+:{}|<>]/).withMessage('Password must contain at least one special character'),

  check('phoneNumber')
    .matches(/^[98765][0-9]{9}$/).withMessage('Phone number must be 10 digits and start with 9, 8, 7, 6, or 5'),

  check('pincode')
    .isLength({ min: 6, max: 6 }).withMessage('Pincode must be exactly 6 digits'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    next();
  }
];

const validateLogIn = [
  
check('email')
  .isEmail().withMessage('Invalid email format')
  .matches(/@gmail\.com$/).withMessage('Only Gmail addresses are allowed'),

check('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
  .matches(/[!@#$%^&*(),.?"-=+:{}|<>]/).withMessage('Password must contain at least one special character'),

(req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }
  next();
}
];

module.exports = { validateSignup ,validateLogIn};
