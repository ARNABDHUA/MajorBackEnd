const express = require("express");
const router = express.Router();
const studentRoutes = require("../src/studentApi/route/studentRoute");
const teacherRoutes = require("../src/teacherApi/route/teacherRoutes");
const adminRoutineApi = require("../src/adminRoutineApi/routes/adminRoutineApi");
const chatApi =require("../src/chatApi/route/routerChat");
const videoApi=require("../src/videoApi/route/videoRoute");
const paper_code=require('../src/adminRoutineApi/routes/paperCodeRoute');
const quizRoutes=require("../src/quizApi/route/quizRoute");
const caApi=require("../src/CAapi/route/caRoute");
const adminApi=require('../src/adminApi/route/adminRout')

router.use("/students", studentRoutes);
router.use("/teachers", teacherRoutes);
router.use("/adminroutine", adminRoutineApi);
router.use("/paper-code", paper_code);
router.use("/chat", chatApi);
router.use("/video", videoApi);
router.use("/quiz",quizRoutes);
router.use("/ca",caApi);
router.use("/admin",adminApi);

router.get("/", (req, res) => {
  res.send("Welcome to API v1");
});

module.exports = router;
