const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assessmentSchema = new Schema({
  paper_code: {
    type: String,
    required: true,
    trim: true
  },
  paper_name: {
    type: String,
    required: true,
    trim: true
  },
  course_code: {
    type: String,
    required: true,
    trim: true
  },

  ca1_marks: {
    type: String,
    default: ''
  },
  ca2_marks: {
    type: String,
    default: ''
  },
  ca3_marks: {
    type: String,
    default: ''
  },
  ca4_marks: {
    type: String,
    default: ''
  },
  teacher: {
    type: String,
    default: ''
  },
  teacher_roll: {
    type: String,
    default: ''
  },
  teacher_email: {
    type: String,
    default: ''
  },
  ca1_file: {
    type: String, 
    default: ''
  },
  ca2_file: {
    type: String,
    default: ''
  },
  ca3_file: {
    type: String,
    default: ''
  },
  ca4_file: {
    type: String,
    default: ''
  },
  student: {
    type: String,
    required: true,
    trim: true
  },
  student_roll: {
    type: String,
    required: true,
    trim: true
  },
  student_email: {
    type: String,
    required: true,
    trim: true
  },
//   assessment_type: {
//     type: String,
//     required: true,
//     enum: ['quiz', 'assignment', 'project', 'exam', 'other'],
//     default: 'assignment'
//   },
ca1:{
    type:Boolean,
    default:false
},
ca2:{
    type:Boolean,
    default:false
},
ca3:{
    type:Boolean,
    default:false
},
ca4:{
    type:Boolean,
    default:false
},
  sem:{
    type: String,
    default:"1"
  },
  start_date:{
    type: Date, default: Date.now
  },
  end_date:{
    type: Date, default: Date.now
  },
  lock:{
    type:Boolean,
    default:true
  }
}, {
  timestamps: true 
});


module.exports = mongoose.model('Assessment', assessmentSchema);