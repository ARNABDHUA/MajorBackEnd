const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: { 
    type: String, 
    required: true 
  },
  c_roll: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String
  },
  salary: {
    type: Number
  },
  image: {
    type: String,
    default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
  },
  teacher_course: {
    type: [String], // e.g. ['MCA-203', 'BTECH-404']
    default: []
  },
  qualification: {
    type: [
      {
        degree: String,
        institution: String,
        year: String
      }
    ], // e.g. ['HS', 'BTECH', 'MTECH']
    default: []
  },
  rating: {
    type: Number,
    default: 0
  },
  expertise: {
    type: [String], // e.g. ['Advanced Mathematics', 'Curriculum Design']
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Teacher', teacherSchema);
