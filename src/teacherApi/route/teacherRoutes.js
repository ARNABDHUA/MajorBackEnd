const express = require("express");
const router = express.Router();
const { createTeacher, getAllTeachers , getTeacherById , updateTeacher, deleteTeacher, updateTeacherCourseByCRoll,logInTeacher,removeQualification} = require('../controller/teacherController');
const {updateTeacherValidation}= require('../middlewares/teacherMiddleware');
const {recordAttendance,updateExitTime}=require('../controller/attendanceController')
router.get("/", (req, res) => {
  res.send("Get all teachers");
});

// Create Teacher
router.post('/teachers-create',createTeacher);

// update course
router.post('/teachers-courseupdate/:c_roll',updateTeacherCourseByCRoll);

// Get All Teachers
router.post('/teachers', getAllTeachers);

// Get Single Teacher
router.post('/teachers/:c_roll', getTeacherById);

// Update Teacher
router.post('/teachers-owndata/:c_roll',updateTeacher);

//remove qualification
router.post('/teachers-qualification/:c_roll',removeQualification);

// Delete Teacher
router.post('/teachers-delete/:c_roll', deleteTeacher);

// login Teacher
router.post('/teachers-login', logInTeacher);

router.post('/teachers-attendance-start', recordAttendance);

router.post('/teachers-attendance-end', updateExitTime);

module.exports = router;
