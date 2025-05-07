const mongoose = require("mongoose");

const TimeSlotSchema = {
  time: { type: String, required: true },
  paper: { type: String, required: true },
  paper_code: { type: String, required: true },
  date:{type: String,default: null },
  is_live:{type: String,default: null},
  topic:{type: String,default: null},
  image:{type: String,default: null}
};

const CourseRoutineSchema = new mongoose.Schema({
  course_id: { type: Number, required: true },
  week:{type: String,default: null },
  date_range:{type: String,default: null },
  sem:{ type: String, required: true },
  days: {
    day1: [TimeSlotSchema],
    day2: [TimeSlotSchema],
    day3: [TimeSlotSchema],
    day4: [TimeSlotSchema],
    day5: [TimeSlotSchema],
    day6: [TimeSlotSchema],
  },
});

module.exports = mongoose.model("CourseRoutine", CourseRoutineSchema);
