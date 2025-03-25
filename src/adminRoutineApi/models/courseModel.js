const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  course_id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  bgColor: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  instructor: {
    type: String,
    required: true
  },
  students: {
    type: Number,
    required: false,
    min: 0
  }
});

module.exports = mongoose.model("Course", courseSchema);