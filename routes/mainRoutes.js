const express = require("express");
const router = express.Router();
const studentRoutes = require("../src/studentApi/route/studentRoute");
const teacherRoutes = require("../src/teacherApi/route/teacherRoutes");
const adminRoutineApi = require("../src/adminRoutineApi/routes/adminRoutineApi");
const chatApi =require("../src/chatApi/route/routerChat")
const videoApi=require("../src/videoApi/route/videoRoute")

router.use("/students", studentRoutes);
router.use("/teachers", teacherRoutes);
router.use("/adminroutine", adminRoutineApi);
router.use("/chat", chatApi);
router.use("/video", videoApi);

router.get("/", (req, res) => {
  res.send("Welcome to API v1");
});

module.exports = router;
