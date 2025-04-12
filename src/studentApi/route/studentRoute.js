const express = require("express");
const router = express.Router();
// const studentNameRoutes = require("./studentNameRoutes");
const {singupStudents ,singinStudents ,addStudentAcademicDetails}=require("../controller/studentLogInController");
const { validateSignup ,validateLogIn } = require("../middlewares/validationSingup");

router.get("/", (req, res) => {
  res.send("Get all students");
});

router.post("/student-singup",validateSignup, singupStudents);

router.post("/student-singin",validateLogIn, singinStudents);

router.post("/student-academic", addStudentAcademicDetails);

module.exports = router;
