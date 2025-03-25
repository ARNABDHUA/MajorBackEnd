const { body, param, validationResult } = require('express-validator');

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

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    next();
  }
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
    .isString().withMessage("paper_code must be a string"),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
      }
      next();
    }
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
      .isString().withMessage('paper_code must be a string'),

      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ message: errors.array() });
        }
        next();
      }
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
  
    body('is_live')
      .notEmpty().withMessage('is_live is required')
      .isString().withMessage('is_live must be a string'),
  
    body('topic')
      .notEmpty().withMessage('topic is required')
      .isString().withMessage('topic must be a string'),
  
    body('image')
      .notEmpty().withMessage('image is required')
      .isString().withMessage('image must be a valid String'),

      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ message: errors.array() });
        }
        next();
      }
  ];
  

  const validateRoutineParams = [
    param('course_id')
      .notEmpty().withMessage('course_id is required')
      .isNumeric().withMessage('course_id must be a number'),
  
    param('sem')
      .notEmpty().withMessage('sem is required')
      .isString().withMessage('sem must be a string'),

      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ message: errors.array() });
        }
        next();
      }
  ];

  const validateCourse = [
    body("course_id").isNumeric().withMessage("Course ID must be a number"),
    body("name").isString().notEmpty().withMessage("Name is required"),
    body("code").isString().notEmpty().withMessage("Code is required"),
    body("description").isString().notEmpty().withMessage("Description is required"),
    body("imageUrl").isString().notEmpty().withMessage("Image URL is required"),
    body("bgColor").isString().notEmpty().withMessage("Background color is required"),
    body("duration").isString().notEmpty().withMessage("Duration is required"),
    body("instructor").isString().notEmpty().withMessage("Instructor is required"),
    // body("students").isNumeric().isInt({ min: 0 }).withMessage("Students count must be a positive number"),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
      }
      next();
    }
  ];


module.exports = { validateAddRoutine , addOrUpdateTimeSlotValidation, deleteTimeSlotValidation, updateSlotDetailsValidation ,validateRoutineParams,validateCourse };