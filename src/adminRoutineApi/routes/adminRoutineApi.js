const express = require("express");
const router = express.Router();
// const CourseRoutine = require("./models/routineModels");
const { getAllReotines, addRoutines, deleteRoutine , addRoutinesNormal,deleteTimeSlot, updateSlotDetails} = require("../controller/controllerRoutine");
const auth = require("../../../authMiddlewares/auth");
const {validateAddRoutine,  addOrUpdateTimeSlotValidation,deleteTimeSlotValidation, updateSlotDetailsValidation} =require("../middlewares/validationRoutine");

router.get("/", (req, res) => {
  res.send("Get all admin Routine");
});

router.post("/course-routines",validateAddRoutine, addRoutines);
  
router.post("/course-routines-data", getAllReotines );

router.post("/course-routines/:course_id",auth, deleteRoutine);

router.post("/add-course-routine", addOrUpdateTimeSlotValidation, addRoutinesNormal );

router.post("/delete-time-slot",deleteTimeSlotValidation, deleteTimeSlot );

router.post("/teacher-update-time-slot",updateSlotDetailsValidation, updateSlotDetails );


module.exports = router;
