const express = require("express");
const router = express.Router();
const {createAdmin,logInAdmin}=require("../controller/adminController")

router.post("/create-admin", createAdmin );

router.post("/login", logInAdmin );

module.exports = router;