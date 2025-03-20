const express = require("express");
const router = express.Router();
// const CourseRoutine = require("./models/routineModels");
const { getAllReotines, addRoutines, deleteRoutine , addRoutinesNormal,deleteTimeSlot, updateSlotDetails , getRoutineByCourseIdAndSem, getAllRoutinbycourse_id} = require("../controller/controllerRoutine");
const auth = require("../../../authMiddlewares/auth");
const {validateAddRoutine,  addOrUpdateTimeSlotValidation,deleteTimeSlotValidation, updateSlotDetailsValidation, validateRoutineParams} =require("../middlewares/validationRoutine");

router.get("/", (req, res) => {
  res.send("Get all admin Routine");
});

router.post("/course-routines",validateAddRoutine, addRoutines);
  
router.post("/course-routines-data", getAllReotines );

router.post("/course-routines/:course_id", deleteRoutine);

router.post("/add-course-routine", addOrUpdateTimeSlotValidation, addRoutinesNormal );

router.post("/delete-time-slot",auth,deleteTimeSlotValidation, deleteTimeSlot );

router.post("/teacher-update-time-slot",auth,updateSlotDetailsValidation, updateSlotDetails );

router.post("/routine/:course_id/:sem",auth,validateRoutineParams, getRoutineByCourseIdAndSem );

router.post("/routine-all/:course_id/:sem",validateRoutineParams, getAllRoutinbycourse_id );


module.exports = router;
