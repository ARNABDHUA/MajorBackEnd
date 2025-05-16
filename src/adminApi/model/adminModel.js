// models/student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
  },
  password: { type: String, required: true },
 admin :{
    type:Boolean,
    default:true,
 },
 registration_admin :{
    type:Boolean,
    default:false,
 },
academic_admin :{
    type:Boolean,
    default:false,
},
accounts_admin:{
    type:Boolean,
    default:false,
}
}, {
  timestamps: true
});

module.exports  = mongoose.model('Admin', studentSchema);
