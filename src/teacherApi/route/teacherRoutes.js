const express = require("express");
const router = express.Router();
const { createTeacher, getAllTeachers , getTeacherById , updateTeacher, deleteTeacher, updateTeacherCourseByCRoll,logInTeacher,removeQualification,updateTeacherCourseCode,makeTeacherHOD,getAllTeachersByCourseCode,applyTeacher,applyTeacherCheck,vaidateTeacher,rejected,applyTeacherData} = require('../controller/teacherController');
const {updateTeacherValidation}= require('../middlewares/teacherMiddleware');
const {recordAttendance,updateExitTime,getAttendanceByPaperAndRoll}=require('../controller/attendanceController')
router.get("/", (req, res) => {
  res.send("Get all teachers");
});

// Create Teacher
router.post('/teachers-create',createTeacher);

// update course
router.post('/teachers-courseupdate/:c_roll',updateTeacherCourseByCRoll);// hod

router.post('/teacher-coursecode-update', updateTeacherCourseCode);// admin

// Get All Teachers
router.post('/teachers', getAllTeachers);

router.post('/teachers-bycoursecode', getAllTeachersByCourseCode);

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

router.post('/teachers-all-attendance', getAttendanceByPaperAndRoll);

router.post('/teachers-hod', makeTeacherHOD);

router.post('/teachers-apply', applyTeacher);

router.post('/teachers-reject', rejected);

router.post('/teachers-verify', vaidateTeacher);

router.post('/teachers-apply-check', applyTeacherCheck);

router.post('/teachers-apply-all', applyTeacherData);

module.exports = router;
