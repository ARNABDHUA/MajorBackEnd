const { body, validationResult } = require('express-validator');

const validateAddRoutine = [
  body('course_id')
    .exists().withMessage('course_id is required')
    .isInt().withMessage('course_id must be an integer'),

  body('course_name')
    .exists().withMessage('course_name is required')
    .isString().withMessage('course_name must be a string')
    .trim()
    .notEmpty().withMessage('course_name cannot be empty'),

  body('sem')
    .exists().withMessage('sem is required')
    .isString().withMessage('sem must be a string')
    .trim()
    .notEmpty().withMessage('sem cannot be empty'),

  body('days.day1')
    .exists().withMessage('days.day1 is required')
    .isArray({ min: 1 }).withMessage('days.day1 should be a non-empty array'),

  body('days.day2')
    .exists().withMessage('days.day2 is required')
    .isArray({ min: 1 }).withMessage('days.day2 should be a non-empty array'),

  // Optional: Validate time slots inside days
  body('days.day1.*.time')
    .exists().withMessage('time is required in each day1 slot')
    .isString().withMessage('time must be a string'),

  body('days.day1.*.paper')
    .exists().withMessage('paper is required in each day1 slot')
    .isString().withMessage('paper must be a string'),

  body('days.day1.*.paper_code')
    .exists().withMessage('paper_code is required in each day1 slot')
    .isString().withMessage('paper_code must be a string'),

  body('days.day2.*.time')
    .exists().withMessage('time is required in each day2 slot')
    .isString().withMessage('time must be a string'),

  body('days.day2.*.paper')
    .exists().withMessage('paper is required in each day2 slot')
    .isString().withMessage('paper must be a string'),

  body('days.day2.*.paper_code')
    .exists().withMessage('paper_code is required in each day2 slot')
    .isString().withMessage('paper_code must be a string'),

  // Optional days (default to empty array in the backend if not sent)
  body('days.day3').optional().isArray(),
  body('days.day4').optional().isArray(),
  body('days.day5').optional().isArray(),
];


const addOrUpdateTimeSlotValidation = [
  body("course_id")
    .exists().withMessage("course_id is required")
    .isNumeric().withMessage("course_id must be a number"),

  body("course_name")
    .exists().withMessage("course_name is required")
    .isString().withMessage("course_name must be a string"),

  body("sem")
    .exists().withMessage("sem is required")
    .isString().withMessage("sem must be a string"),

  body("day")
    .exists().withMessage("day is required")
    .isString().withMessage("day must be a string")
    .matches(/^Day [1-6]$/).withMessage("day must be in format 'Day 1' to 'Day 6'"),

  body("time")
    .exists().withMessage("time is required")
    .isString().withMessage("time must be a string"),

  body("paper")
    .exists().withMessage("paper is required")
    .isString().withMessage("paper must be a string"),

  body("paper_code")
    .exists().withMessage("paper_code is required")
    .isString().withMessage("paper_code must be a string")
];

const deleteTimeSlotValidation = [
    body('course_id')
      .notEmpty().withMessage('course_id is required')
      .isNumeric().withMessage('course_id must be a number'),
  
    body('course_name')
      .notEmpty().withMessage('course_name is required')
      .isString().withMessage('course_name must be a string'),
  
    body('sem')
      .notEmpty().withMessage('sem is required')
      .isString().withMessage('sem must be a string'),
  
    body('day')
      .notEmpty().withMessage('day is required')
      .matches(/^Day\s[1-6]$/).withMessage('day must be in format "Day 1" to "Day 6"'),
  
    body('paper_code')
      .notEmpty().withMessage('paper_code is required')
      .isString().withMessage('paper_code must be a string')
  ];


const updateSlotDetailsValidation = [
  body('course_id')
    .notEmpty().withMessage('course_id is required')
    .isNumeric().withMessage('course_id must be a number'),

  body('sem')
    .notEmpty().withMessage('sem is required')
    .isString().withMessage('sem must be a string'),

  body('day')
    .notEmpty().withMessage('day is required')
    .matches(/^Day\s[1-6]$/).withMessage('day must be in format "Day 1" to "Day 6"'),

  body('paper_code')
    .notEmpty().withMessage('paper_code is required')
    .isString().withMessage('paper_code must be a string'),

  // Optional fields for update (can be empty but must be valid types if provided)
  body('date')
    .optional()
    .isISO8601().withMessage('date must be a valid ISO 8601 date (YYYY-MM-DD)'),

  body('is_live')
    .optional()
    .isIn(['true', 'false', true, false]).withMessage('is_live must be true or false'),

  body('topic')
    .optional()
    .isString().withMessage('topic must be a string'),

  body('image')
    .optional()
    .isURL().withMessage('image must be a valid URL')
];


module.exports = { validateAddRoutine , addOrUpdateTimeSlotValidation, deleteTimeSlotValidation, updateSlotDetailsValidation };