const express = require("express");
const router = express.Router();
const {checkOrCreateAssessment}=require("../controller/caController")
router.get("/", (req, res) => {
    res.send("Get all video");
  });

router.post("/add-user",checkOrCreateAssessment);

module.exports = router;