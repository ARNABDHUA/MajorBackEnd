const express = require("express");
const router = express.Router();
const {createPaper,showAllBaseOnPaperCode}=require('../controller/videoController.js');
router.get("/", (req, res) => {
  res.send("Get all video");
});

router.post("/course-video",createPaper);

router.post("/show-video",showAllBaseOnPaperCode);

module.exports = router;