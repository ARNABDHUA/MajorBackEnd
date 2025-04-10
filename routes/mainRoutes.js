const express = require("express");
const router = express.Router();
const studentRoutes = require("../src/studentApi/route/studentRoute");
const teacherRoutes = require("../src/teacherApi/route/teacherRoutes");
const adminRoutineApi = require("../src/adminRoutineApi/routes/adminRoutineApi");
const chatApi =require("../src/chatApi/route/routerChat")

router.use("/students", studentRoutes);
router.use("/teachers", teacherRoutes);
router.use("/adminroutine", adminRoutineApi);
router.use("/chat", chatApi);

router.get("/", (req, res) => {
  res.send("Welcome to API v1");
});

module.exports = router;
