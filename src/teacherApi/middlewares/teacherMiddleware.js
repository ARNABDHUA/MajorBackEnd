const { body, param, validationResult } = require('express-validator');

const updateTeacherValidation = [
  // Validate c_roll param
  param('c_roll')
    .notEmpty().withMessage('c_roll is required')
    .isString().withMessage('c_roll must be a string'),

  // Validate phoneNumber
  body('phoneNumber')
  .optional()
  .matches(/^[5-9][0-9]{9}$/)
  .withMessage('Phone number must be 10 digits and start with 5, 6, 7, 8, or 9'),


  // Validate degree
  body('degree')
    .optional()
    .isString().withMessage('Degree must be a string')
    .trim()
    .notEmpty().withMessage('Degree cannot be empty'),

  // Validate institution
  body('institution')
    .optional()
    .isString().withMessage('Institution must be a string')
    .trim()
    .notEmpty().withMessage('Institution cannot be empty'),

  // Validate year
  body('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Year must be a valid year'),

  // Validate expertise (string version)
  body('expertise')
    .optional()
    .isString().withMessage('Expertise must be a string')
    .trim()
    .notEmpty().withMessage('Expertise cannot be empty'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ message: errors.array() });
        }
        next();
      }
  
];

module.exports = { updateTeacherValidation };