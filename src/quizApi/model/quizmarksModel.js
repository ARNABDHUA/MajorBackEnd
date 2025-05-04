// models/student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  student: {
    type: String,
    required: true,
    trim: true
  },
  c_roll: {
    type: String,
    required: true,
  },
  marks: {
    type: String,
    required: true
  },
  quiz_id: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  course_code: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  paper_code: {
    type: String,
    required: true
  },
  quiz_title: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports  = mongoose.model('Studentquizmarks', studentSchema);
