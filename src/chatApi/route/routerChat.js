const express = require("express");
const router = express.Router();
const {registerUser, chatUser,allUsers,updateUserImage,getImage}=require("../controller/userControllers");
const {accessChat, fetchChats, createGroupChat, renameGroup, addToGroup,removeFromGroup,updateGroupChatAdminMode,getChatById}=require("../controller/chatControllers")
const {sendMessage,allMessages} =require("../controller/messageControllers")

router.get("/", (req, res) => {
  res.send("Get all chat");
});

router.post("/chat-user-add",registerUser);

router.post("/chat-user-data",chatUser);

router.post("/chat-user-all",allUsers);

router.post("/chat-create",accessChat);

router.post("/chat-fatch",fetchChats);

router.post("/chat-group",createGroupChat);

router.post("/chat-group-rename",renameGroup);

router.post("/chat-group-add",addToGroup);

router.post("/chat-group-remove",removeFromGroup);

router.post("/chat-messages",sendMessage);

router.get("/:chatId", allMessages);

router.post("/userimageupload",updateUserImage);

router.post("/userimageget",getImage);//from student image

router.post("/chat-group-admin-mode",updateGroupChatAdminMode);

router.post("/chat-admin-mode-find",getChatById);


// router.post("/student-singin",validateLogIn, singinStudents);

module.exports = router;
