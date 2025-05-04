const express = require("express");
const router = express.Router();

const {createCoursePaper,getAllCoursePapers,getCoursePaper,getPaperByCode,updateCoursePaper,addPaper,updatePaper,removePaper,deleteCoursePaper}=require('../controller/paperCodeController');

router.post("/create-course-code-all", createCoursePaper );

router.post("/get-coursecode", getCoursePaper );//get by course_code(like (MCA==="101"))

router.post("/get-papercode-name", getPaperByCode );//get by paper_code

router.post("/update-papercode-bycoursecode", updateCoursePaper );//all paper_code and papername array all change

router.post("/update-papercode", updatePaper );

router.post("/remove-papercode", removePaper );

router.post("/add-papercode", addPaper );

router.post("/delete-courseCode", deleteCoursePaper );//all paper_code and papername array all delete

module.exports = router;