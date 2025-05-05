const express = require("express");
const router = express.Router();

const {createID,addQuestions,deleteQuizId,deleteQuestion,showQuestion,showAllQuiz}=require('../controller/quizController');
const {addMarksStudent,allstudentByQuizId,checkStudentSubmission}=require("../controller/quizMarksController")

// router.post("/create-course-code-all", createCoursePaper );

router.post("/create-quizid", createID );

router.post("/add-question", addQuestions );

router.post("/delete-question", deleteQuestion ); //delete one question only

router.post("/delete-quizid", deleteQuizId );// delete full quizeId

router.post("/show-questions", showQuestion );// all question show base opn questionId

router.post("/add-student-marks", addMarksStudent );

router.post("/all-student-marks", allstudentByQuizId );

router.post("/check-submit", checkStudentSubmission );

router.post("/show-all-quiz", showAllQuiz );

module.exports = router;