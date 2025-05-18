const express = require("express");
const router = express.Router();
const {createAdmin,logInAdmin}=require("../controller/adminController")
const {createNotice,getAllNotices,getNoticeById,updateNotice,deleteNotice}=require("../controller/noticeController")

router.post("/create-admin", createAdmin );

router.post("/login", logInAdmin );

router.post("/create-notice", createNotice );

router.post("/get-all-notice", getAllNotices );

router.post("/update-notice/:id", updateNotice );

router.post("/delete-notice/:id", deleteNotice );

module.exports = router;