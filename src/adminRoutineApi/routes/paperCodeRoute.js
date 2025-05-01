const express = require("express");
const router = express.Router();

const {createCoursePaper,getAllCoursePapers,getCoursePaper,getPaperByCode,updateCoursePaper,addPaper,updatePaper,removePaper,deleteCoursePaper}=require('../controller/paperCodeController');

router.post("/create-course-code-all", createCoursePaper );

module.exports = router;