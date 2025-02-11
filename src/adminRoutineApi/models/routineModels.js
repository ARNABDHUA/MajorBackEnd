const mongoose = require("mongoose");

const TimeSlotSchema = {
  time: { type: String, required: true },
  paper: { type: String, required: true },
  paper_code: { type: String, required: true },
};

const CourseRoutineSchema = new mongoose.Schema({
  course_id: { type: Number, required: true },
  days: {
    day1: [TimeSlotSchema],
    day2: [TimeSlotSchema],
    day3: [TimeSlotSchema],
    day4: [TimeSlotSchema],
    day5: [TimeSlotSchema],
  },
});

module.exports = mongoose.model("CourseRoutine", CourseRoutineSchema);
