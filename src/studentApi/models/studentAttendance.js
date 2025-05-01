const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

const attendanceSchema = new mongoose.Schema({
  attendance_id: {
    type: String,
    default: () => uuidv4(),  // Generate a unique ID
    unique: true,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  c_roll: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    ref: 'Student',
    required: true
  },
  paper_code: {
    type: String,
    required: true
  },
  course_code: {
    type: String,
    required: true
  },
  jointime: {
    type: String,  // Changed to String to store formatted time
    required: true
  },
  exittime: {
    type: String  // Changed to String to store formatted time
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'left early'],
    default: 'absent'  // Changed default to 'absent'
  },
  date: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Studentattendance', attendanceSchema);
