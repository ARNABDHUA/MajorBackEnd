const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  course_code: { type: String, default: null },
  c_roll: { type: String, default: null },
  e_roll: { type: String, default: null },
  tenth: { type: Number, default: null },
  twelfth: { type: Number, default: null },
  ug: { type: Number, default: null },
  pg: { type: Number, default: null }
}, {
  timestamps: true
});

studentSchema.plugin(AutoIncrement, { inc_field: 's_id' });

module.exports = mongoose.model('Student', studentSchema);
