const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const emailSchema = new mongoose.Schema({
  email: { type: String, required: true},
  otp:{type: String, required: true}
}, {
  timestamps: true
});


module.exports = mongoose.model('emailotpsignup', emailSchema);