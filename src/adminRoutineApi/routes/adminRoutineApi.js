const express = require("express");
const router = express.Router();
// const CourseRoutine = require("./models/routineModels");
const { getAllReotines, addRoutines, deleteRoutine , addRoutinesNormal,deleteTimeSlot, updateSlotDetails , getRoutineByCourseIdAndSem, getAllRoutinbycourse_id,getAllCourses,createCourse,getAllCoursesBYId} = require("../controller/controllerRoutine");
const auth = require("../../../authMiddlewares/auth");
const {validateAddRoutine,  addOrUpdateTimeSlotValidation,deleteTimeSlotValidation, updateSlotDetailsValidation, validateRoutineParams,validateCourse} =require("../middlewares/validationRoutine");

router.get("/", (req, res) => {
  res.send("Get all admin Routine");
});

router.post("/course-routines",validateAddRoutine, addRoutines);
  
router.post("/course-routines-data", getAllReotines );

router.post("/course-routines/:course_id", deleteRoutine);

router.post("/add-course-routine", addOrUpdateTimeSlotValidation, addRoutinesNormal );

router.post("/delete-time-slot",deleteTimeSlotValidation, deleteTimeSlot );

router.post("/teacher-update-time-slot",updateSlotDetailsValidation, updateSlotDetails );

router.post("/routine/:course_id/:sem",auth,validateRoutineParams, getRoutineByCourseIdAndSem );

router.post("/routine-all/:course_id/:sem",validateRoutineParams, getAllRoutinbycourse_id );

router.post("/course-all", getAllCourses );

router.get("/course-all-id", getAllCoursesBYId );

router.post("/create-course",validateCourse, createCourse);


module.exports = router;
