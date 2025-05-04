// models/Quiz.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question_text: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
  },
  correct_answer: {
    type: String,
    required: true,
    trim: true
  }
});

const quizSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  c_roll: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  paper_code: {
    type: String,
    required: true,
    trim: true
  },
  quiz_id: {
    type: String,
    trim: true,
    unique: true,
    default: function() {
      // Generate a unique ID based on timestamp and random string
      const timestamp = new Date().getTime().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 8);
      return `QUIZ-${timestamp}-${randomStr}`.toUpperCase();
    }
  },
  quiz_title: {
    type: String,
    required: true,
    trim: true
  },
  sem:{
    type:String,
    required: true,
    default:"1"
    },
  questions: [questionSchema],
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quiz', quizSchema);