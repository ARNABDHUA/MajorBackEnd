const mongoose = require('mongoose');

const CoursePaperSchema = new mongoose.Schema({
    course_code: { 
    type: String, 
    required: true 
  },
  sem: { 
    type: String, 
    required: true 
  },
  papers: [{
    paper_code: { 
      type: String, 
      required: true 
    },
    paper_name: { 
      type: String, 
      required: true 
    }
  }]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('CoursePaper', CoursePaperSchema);