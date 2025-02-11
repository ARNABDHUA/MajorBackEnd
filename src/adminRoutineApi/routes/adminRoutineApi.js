const express = require("express");
const router = express.Router();
// const CourseRoutine = require("./models/routineModels");
const { getAllReotines, addRoutines, deleteRoutine } = require("../controller/controllerRoutine");
const auth = require("../../../authMiddlewares/auth");


router.get("/", (req, res) => {
  res.send("Get all admin Routine");
});

router.post("/course-routines",auth, addRoutines);
  
router.post("/course-routines-data",auth, getAllReotines );

router.post("/course-routines/:course_id",auth, deleteRoutine);

module.exports = router;
