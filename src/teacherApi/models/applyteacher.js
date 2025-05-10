const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
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
    type: String,
    default:"" 
  },
  submit:{type:Boolean,default:false},
  verify:{type:Boolean,default:false},
  rejected:{type:Boolean,default:false},
  tenth_marks: { type: Number, default: null },
  tenth_year: { type: Number, default: null },
  twelfth_marks: { type: Number, default: null },
  twelfth_year: { type: Number, default: null },
  ug_name: { type: String, default: null },
  ug_marks: { type: Number, default: null },
  ug_start: { type: String, default: null },
  ug_end: { type: String, default: null },
  other_course: { type: String, default: null },
  other_course_marks: { type: Number, default: null },
  other_course_start: { type: String, default: null },
  other_course_end: { type: String, default: null },
  cv_file:{type:String,default: ""}
}, {
  timestamps: true
});

module.exports = mongoose.model('Applyteacher', teacherSchema);
