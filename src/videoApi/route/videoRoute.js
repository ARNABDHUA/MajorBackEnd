const express = require("express");
const router = express.Router();
const {createPaper}=require('../controller/videoController.js');
router.get("/", (req, res) => {
  res.send("Get all video");
});

router.post("/course-video",createPaper);



module.exports = router;