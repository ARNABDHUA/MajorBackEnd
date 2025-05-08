const express = require("express");
const router = express.Router();
const {createPaper,showAllBaseOnPaperCode,deleteByCreatedTime}=require('../controller/videoController.js');
router.get("/", (req, res) => {
  res.send("Get all video");
});

router.post("/course-video",createPaper);

router.post("/show-video",showAllBaseOnPaperCode);

router.post("/delete-video",deleteByCreatedTime);

module.exports = router;