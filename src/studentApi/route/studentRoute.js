const express = require("express");
const router = express.Router();
// const studentNameRoutes = require("./studentNameRoutes");
const {singupStudents ,singinStudents ,addStudentAcademicDetails,generateCRoll,updateStudentProfile,sendEmailController,signupOtpValidate,sendForgetPassword,applyStudents,vaidateStudent,rejected,verifyApplyStudentsList,regularOfflineStudentsList,regularOnlineStudentsList,regularOnlineStudentsListDueSemPayment,regularOfflineStudentsListDueSemPayment,regularOfflineStudentsListDueSemPaymentReject}=require("../controller/studentLogInController");
const { validateSignup ,validateLogIn } = require("../middlewares/validationSingup");
const auth=require("../../../authMiddlewares/auth")
const {recordAttendance,updateExitTime,todayRecordStudent,getTotalClassesCount,getPresentStudentsByPaperCode,getStudentAttendanceStats}=require('../controller/studentAttenance')

router.get("/", (req, res) => {
  res.send("Get all students");
});

router.post("/student-singup",validateSignup, singupStudents);

router.post("/student-singin", singinStudents);

router.post("/student-academic", addStudentAcademicDetails);

router.post("/student-rollgenerate", generateCRoll);

router.post("/student-apply", applyStudents);

router.post("/student-verify", vaidateStudent);

router.post("/student-verifylist", verifyApplyStudentsList);// new payment

router.post("/student-offline-student", regularOfflineStudentsList);//new payment

router.post("/student-online-student", regularOnlineStudentsList);//new payment

router.post("/student-online-student-due", regularOnlineStudentsListDueSemPayment);//new payment

router.post("/student-offline-student-due", regularOfflineStudentsListDueSemPayment);//new payment

router.post("/student-due-noacc", regularOfflineStudentsListDueSemPaymentReject);//new payment

router.post("/student-rejected", rejected);

router.post("/student-update", updateStudentProfile);

router.post("/student-mail-otp", sendEmailController);

router.post("/student-mail-otp-validate", signupOtpValidate);

router.post("/student-mail-reset", sendForgetPassword);

router.post("/student-attendance-start", recordAttendance);

router.post("/student-attendance-end", updateExitTime);

router.post("/student-attendance-today", todayRecordStudent);

router.post("/student-attendance-alldays", getTotalClassesCount);

router.post("/student-attendance-onedayforteacher", getPresentStudentsByPaperCode);//teacher

router.post("/student-attendance-report", getStudentAttendanceStats);//teacher 

module.exports = router;
