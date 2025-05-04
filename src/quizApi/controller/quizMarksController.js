const Studentquizmarks=require('../model/quizmarksModel')
const Quiz=require('../model/quizModel')

const addMarksStudent = async (req, res) => {
    const { 
      student,
      c_roll,
      marks,
      quiz_id,
      email,
      course_code
      
    } = req.body;
    
    try {
   
      const quizData = await Quiz.findOne({ quiz_id });
    //   console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",quizData);
      
      if (!quizData) {
        return res.status(404).json({ message: "Quiz not found" });
      }
  
      // Get current date in IST (India/Kolkata time)
      const currentDate = new Date();
      const currentIST = new Date(currentDate.getTime() + (5.5 * 60 * 60 * 1000));
      
      // Format IST dates as YYYY-MM-DD
      const formatDateToISTString = (date) => {
        
        const d = new Date(date);
        
        const istDate = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
        // Format as YYYY-MM-DD
        return istDate.toISOString().split('T')[0];
      };
      
      // Get quiz date and current date in IST
      const quizDateIST = formatDateToISTString(quizData.created_at);
      const todayIST = formatDateToISTString(currentDate);
      
      // Check if today matches quiz date in IST
      if (quizDateIST !== todayIST) {
        return res.status(403).json({ 
          message: "Quiz has expired or is not yet active",
          quizDate: quizDateIST,
          currentDate: todayIST
        });
      }
      const studentRecord = new Studentquizmarks({
        student,
        c_roll,
        marks,
        quiz_id,
        email,
        course_code,
        date: currentIST, 
        paper_code:quizData.paper_code,
      quiz_title:quizData.quiz_title
      });
      
      // Check if this student already submitted marks for this quiz
      const existingSubmission = await Studentquizmarks.findOne({ 
        quiz_id, 
        c_roll
      });
      
      if (existingSubmission) {
        return res.status(400).json({
          message: "You have already submitted marks for this quiz"
        });
      }
      
      const newStudent = await studentRecord.save();
      res.status(201).json({
        message: "Student marks added successfully",
        data: newStudent
      });
      
    } catch (err) {
      console.error("Error adding student marks:", err);
      res.status(400).json({ message: err.message });
    }
  };

 const allstudentByQuizId= async (req, res) => {
    const {quiz_id}=req.body
    try {
      const students = await Studentquizmarks.find({ quiz_id: quiz_id });
      res.status(200).json(students);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };


  const checkStudentSubmission = async (req,res) => {
    const{quiz_id,c_roll}=req.body
    try {
      if (!quiz_id || !c_roll) {
        return {
          hasSubmitted: false,
          submissionData: null,
          message: "Quiz ID and student roll number are required"
        };
      }
      
      const existingSubmission = await Studentquizmarks.findOne({ 
        quiz_id, 
        c_roll 
      });
      
      if (existingSubmission) {
        return res.status(200).json ({
          hasSubmitted: true,
          submissionData: existingSubmission,
          message: "Student has already submitted marks for this quiz"
        });
      } else {
        return res.status(200).json ({
          hasSubmitted: false,
          submissionData: null,
          message: "No previous submission found"
        });
      }
    } catch (err) {
        res.status(500).json({ message: err.message });
      }
  };
  
  module.exports={addMarksStudent,allstudentByQuizId,checkStudentSubmission}