const express = require("express");
const router = express.Router();
// const studentNameRoutes = require("./studentNameRoutes");
const {singupStudents ,singinStudents}=require("../controller/studentLogInController");
const { validateSignup } = require("../middlewares/validationSingup");

router.get("/", (req, res) => {
  res.send("Get all students");
});

router.post("/student-singup",validateSignup, singupStudents);

router.post("/student-singin", singinStudents);

module.exports = router;
