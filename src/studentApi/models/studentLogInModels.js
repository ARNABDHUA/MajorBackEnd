const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  gender :{ type: String, required: true },
  c_roll: { type: String, default: null },
  e_roll: { type: String, default: null },
  course_code: { type: String, default: null },
  paper_code: {
    type: [String], 
    default: []
  },
  sem:{
    type:String,
    default: "1"
  },
  select_offline:{type:Boolean,default:false},
  // offline_student:{type:Boolean,default:false},
  tenth_marks: { type: Number, default: null },
  tenth_file:{type:String,default: ""},
  tenth_year: { type: Number, default: null },
  twelfth_marks: { type: Number, default: null },
  twelfth_marks_file:{type:String,default: ""},
  twelfth_year: { type: Number, default: null },
  ug_name: { type: String, default: null },
  ug_marks: { type: Number, default: null },
  ug_marks_file:{type:String,default: ""},
  ug_start: { type: String, default: null },
  ug_end: { type: String, default: null },
  other_course: { type: String, default: null },
  other_marks_file:{type:String,default: ""},
  other_course_marks: { type: Number, default: null },
  other_course_start: { type: String, default: null },
  other_course_end: { type: String, default: null },
  rank_file:{type:String,default: ""},
  rank:{ type: Number, default: null },
  payment:{type:Boolean,default:false},
  admit:{type:Boolean,default:false},
  submit:{type:Boolean,default:false},
  verify:{type:Boolean,default:false},
  sem_payment:{type:Boolean,default:true},
  rejected:{type:Boolean,default:false},
  regular:{type:Boolean,default:false},
  pic: {
    type: String,
    default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
  },
}, {
  timestamps: true
});

studentSchema.plugin(AutoIncrement, { inc_field: 's_id' });

module.exports = mongoose.model('Student', studentSchema);
