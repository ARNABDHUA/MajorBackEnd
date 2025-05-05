 const Quiz=require('../model/quizModel')
 
 const createID=async (req, res) => {
    const{name,
    email,
    c_roll,
    paper_code,
    sem,
    quiz_title}=req.body
    try {
      const quizData = {
        name,
    email,
    c_roll,
    paper_code,
    sem,
    quiz_title,
        questions: []
      };
      
      const newQuiz = new Quiz(quizData);
      const savedQuiz = await newQuiz.save();
      res.status(201).json(savedQuiz);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  const addQuestions=async (req, res) => {
    const{quiz_id,question_text,options,correct_answer}=req.body
    try {
      const quiz = await Quiz.findOne({ quiz_id: quiz_id });
      
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      
      // Add the new question to the questions array
      quiz.questions.push({
        question_text: question_text,
        options:options,
        correct_answer: correct_answer
      });
      
      const updatedQuiz = await quiz.save();
      res.status(201).json(updatedQuiz);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  const deleteQuizId=async (req, res) => {
    const {quiz_id}=req.body
    try {
      const deletedQuiz = await Quiz.findOneAndDelete({ quiz_id: quiz_id });
      
      if (!deletedQuiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      
      res.status(200).json({ message: 'Quiz deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const deleteQuestion=async (req, res) => {
    const {quiz_id,questionId}=req.body
    try {
      const quiz = await Quiz.findOne({ quiz_id: quiz_id });
      
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      
      // Find the question by ID and remove it
      quiz.questions = quiz.questions.filter(
        q => q._id.toString() !== questionId
      );
      
      const updatedQuiz = await quiz.save();
      res.status(200).json(updatedQuiz);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const showQuestion= async(req,res)=>{
    
    const {quiz_id}=req.body
    try {
      const quiz = await Quiz.findOne({ quiz_id: quiz_id });
      
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      res.status(200).json(quiz);
    } catch (error) {
        res.status(500).json({ error: error.message });
      }

  }

  const showAllQuiz= async(req,res)=>{
    
    const {c_roll}=req.body
    try {
      const quiz = await Quiz.find({ c_roll: c_roll });
      
      if (!quiz) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(quiz);
    } catch (error) {
        res.status(500).json({ error: error.message });
      }

  }


  module.exports={createID,addQuestions,deleteQuizId,deleteQuestion,showQuestion,showAllQuiz}