const express = require("express");
const router = express.Router();
const { createTeacher, getAllTeachers , getTeacherById , updateTeacher, deleteTeacher, updateTeacherCourseByCRoll} = require('../controller/teacherController');

router.get("/", (req, res) => {
  res.send("Get all teachers");
});

// Create Teacher
router.post('/teachers-create',createTeacher);

// update course
router.post('/teachers-courseupdate/:id',updateTeacherCourseByCRoll);

// Get All Teachers
router.post('/teachers', getAllTeachers);

// Get Single Teacher
router.post('/teachers/:id', getTeacherById);

// Update Teacher
router.post('/teachers-owndata/:id',updateTeacher);

// Delete Teacher
router.post('/teachers-delete/:id', deleteTeacher);

module.exports = router;
