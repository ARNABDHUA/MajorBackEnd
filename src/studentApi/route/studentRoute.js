const express = require("express");
const router = express.Router();
// const studentNameRoutes = require("./studentNameRoutes");
const {singupStudents ,singinStudents ,addStudentAcademicDetails,generateCRoll,updateStudentProfile,sendEmailController,signupOtpValidate,sendForgetPassword}=require("../controller/studentLogInController");
const { validateSignup ,validateLogIn } = require("../middlewares/validationSingup");
const auth=require("../../../authMiddlewares/auth")

router.get("/", (req, res) => {
  res.send("Get all students");
});

router.post("/student-singup",validateSignup, singupStudents);

router.post("/student-singin", singinStudents);

router.post("/student-academic", addStudentAcademicDetails);

router.post("/student-rollgenerate", generateCRoll);

router.post("/student-update", updateStudentProfile);

router.post("/student-mail-otp", sendEmailController);

router.post("/student-mail-otp-validate", signupOtpValidate);

router.post("/student-mail-reset", sendForgetPassword);

module.exports = router;
