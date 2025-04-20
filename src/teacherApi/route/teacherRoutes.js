const express = require("express");
const router = express.Router();
const { createTeacher, getAllTeachers , getTeacherById , updateTeacher, deleteTeacher, updateTeacherCourseByCRoll,logInTeacher,removeQualification} = require('../controller/teacherController');
const {updateTeacherValidation}= require('../middlewares/teacherMiddleware');
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

module.exports = router;
