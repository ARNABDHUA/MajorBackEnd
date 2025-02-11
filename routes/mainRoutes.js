const express = require("express");
const router = express.Router();
const studentRoutes = require("../src/studentApi/route/studentRoute");
const teacherRoutes = require("../src/teacherApi/teacherRoutes");
const adminRoutineApi = require("../src/adminRoutineApi/routes/adminRoutineApi");

router.use("/students", studentRoutes);
router.use("/teachers", teacherRoutes);
router.use("/adminroutine", adminRoutineApi);

router.get("/", (req, res) => {
  res.send("Welcome to API v1");
});

module.exports = router;
