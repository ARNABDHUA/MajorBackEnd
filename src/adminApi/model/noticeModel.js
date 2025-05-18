
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
  },
 student :{
    type:Boolean,
    default:true,
 },
label :{
    type: String,
    required: true,
},
short_description :{
    type: String,
    required: true,
},
long_description :{
    type: String,
    required: true,
},
pdf_file:{
    type: String
}
}, {
  timestamps: true
});

module.exports  = mongoose.model('Notice', studentSchema);
