const Assessment=require("../model/caModel");
const cloudinary =require("./cloudinary.js");
const fs = require("fs");

const checkOrCreateAssessment = async (req, res) => {
    try {
      const { 
        student, 
        paper_code, 
        paper_name, 
        course_code, 
        student_roll, 
        student_email 
      } = req.body;
  
      // Validate required fields
      if (!student || !paper_code || !paper_name || !course_code || !student_roll || !student_email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields' 
        });
      }
      const assessment = await Assessment.findOneAndUpdate(
        { paper_code, student_roll },
        {
          $setOnInsert: {
            student,
            paper_name,
            course_code,
            student_email,
            // All other fields will use their default values from the schema
          }
        },
        { 
          new: true,
          upsert: true,
          // This tells MongoDB whether the document was newly created or not
          rawResult: true
        }
      );
  
      // Check if document was newly created or already existed
      const isNewlyCreated = assessment.lastErrorObject ? assessment.lastErrorObject.upserted : false;
      
      if (isNewlyCreated) {
        return res.status(201).json({
          success: true,
          message: 'New assessment created successfully',
          assessment: assessment.value
        });
      } else {
        return res.status(200).json({
          success: true,
          message: 'Assessment already exists for this student and paper',
          assessment: assessment.value
        });
      }
      
    } catch (error) {
      console.error('Error in checkOrCreateAssessment:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };

  module.exports={checkOrCreateAssessment}