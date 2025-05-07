const express = require("express");
const router = express.Router();
const {registerUser, chatUser,allUsers,updateUserImage,getImage,getImageteacher,registerTeacher,makeUserTeacher,makeUserStudent,allUsersForStudent,allUsersForNonStudent}=require("../controller/userControllers");
const {accessChat, fetchChats, createGroupChat, renameGroup, addToGroup,removeFromGroup,updateGroupChatAdminMode,getChatById}=require("../controller/chatControllers")
const {teacherFileMessage}=require("../controller/imageAndPdf")
const {sendMessage,allMessages,updateMessageForDeletion} =require("../controller/messageControllers")

router.get("/", (req, res) => {
  res.send("Get all chat");
});

router.post("/chat-user-add",registerUser);

router.post("/chat-user-data",chatUser);

router.post("/chat-user-all",allUsersForNonStudent);//use in teacher and admin

router.post("/chat-user-all-forstudent",allUsersForStudent);//use in student for search teacher and admin

// router.post("/chat-user-all-forteacher",allUsersForNonStudent);//use in teacher and admin

router.post("/chat-create",accessChat);

router.post("/chat-fatch",fetchChats);

router.post("/chat-group",createGroupChat);

router.post("/chat-group-rename",renameGroup);

router.post("/chat-group-add",addToGroup);

router.post("/chat-group-remove",removeFromGroup);

router.post("/chat-messages",sendMessage);

router.get("/:chatId", allMessages);

router.post("/delete-message", updateMessageForDeletion);

router.post("/userimageupload",updateUserImage);

router.post("/userimageget",getImage);//from student image

router.post("/teacherimageget",getImageteacher);//from teacher image

router.post("/chat-group-admin-mode",updateGroupChatAdminMode);

router.post("/chat-admin-mode-find",getChatById);

router.post("/chat-register-teacher",registerTeacher);//new teacher register 

router.post("/chat-isteacher",makeUserTeacher);// for one time use to make isteacher===true

router.post("/chat-isstudent",makeUserStudent);// for one time use to make isstudent===true

router.post("/chat-isteacher-image",teacherFileMessage);

// router.post("/student-singin",validateLogIn, singinStudents);

module.exports = router;
