const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const accessChat =async (req, res) => {
    const { ownId,userId } = req.body;
  
    if (!userId) {
      console.log("UserId param not sent with request");
      return res.sendStatus(400).json({message:"please add other user id"});
    }
  
    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: ownId } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");
  
    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
  
    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [ownId, userId],
      };
  
      try {
        const createdChat = await Chat.create(chatData);
        const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
          "users",
          "-password"
        );
        res.status(200).json(FullChat);
      } catch (error) {
        return res.status(400).json({message:"no message on one-to-one"})
        
      }
    }
  };

  const fetchChats = async (req, res) => {
    const { ownId } = req.body;

    try {
      Chat.find({ users: { $elemMatch: { $eq: ownId } } })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 })
        .then(async (results) => {
          results = await User.populate(results, {
            path: "latestMessage.sender",
            select: "name pic email",
          });
          res.status(200).send(results);
        });
    } catch (error) {
      return res.status(400).json({message:error.message});
    }
  };


  const createGroupChat = async (req, res) => {
    const {ownId,user,name}=req.body
    if (! ownId || ! user || ! name) {
      return res.status(400).send({ message: "Please Fill all the feilds" });
    }
  
    var users = JSON.parse(req.body.user);
  
    if (users.length < 2) {
      return res
        .status(400)
        .send("More than 2 users are required to form a group chat");
    }
    const me=await User.findOne({_id: ownId });

    users.push(me);
  
    try {
      const groupChat = await Chat.create({
        chatName: req.body.name,
        users: users,
        isGroupChat: true,
        groupAdmin: me,
      });
  
      const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
  
      res.status(200).json(fullGroupChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  };

  const renameGroup = async (req, res) => {
    const { chatId, chatName } = req.body;
  
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName: chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
  
    if (!updatedChat) {
      return res.status(404).json({message:"Chat Not Found"});
    } else {
     return res.json(updatedChat);
    }
  };

  const addToGroup = async (req, res) => {
    const { chatId, userId } = req.body;
  
    // check if the requester is admin
  
    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
  
    if (!added) {
      return res.status(404).json({message:"Chat Not Found"});
    } else {
      return res.json(added);
    }
  };


  // const removeFromGroup = async (req, res) => {
  //   const { chatId, userId } = req.body;
  
  //   try {
  //     // First, get the current chat to check admin status
  //     const chat = await Chat.findById(chatId);
      
  //     if (!chat) {
  //       return res.status(404).json({ message: "Chat Not Found" });
  //     }
      
  //     let updateOperation = {
  //       $pull: { users: userId }
  //     };
      
  //     // Check if the user being removed is the current admin
  //     if (chat.groupAdmin.toString() === userId) {
  //       // Find remaining users after removal
  //       const remainingUsers = chat.users.filter(
  //         user => user.toString() !== userId
  //       );
        
  //       // If there are remaining users, assign the first one as the new admin
  //       if (remainingUsers.length > 0) {
  //         updateOperation.groupAdmin = remainingUsers[0];
  //       }
  //     }
      
  //     // Update the chat with all necessary changes
  //     const removed = await Chat.findByIdAndUpdate(
  //       chatId,
  //       updateOperation,
  //       {
  //         new: true,
  //       }
  //     )
  //       .populate("users", "-password")
  //       .populate("groupAdmin", "-password");
      
  //     return res.json(removed);
  //   } catch (error) {
  //     return res.status(400).json({ message: "Failed to remove from group", error: error.message });
  //   }
  // };

  const removeFromGroup = async (req, res) => {
    const { chatId, userId } = req.body;
  
    try {
      // Fetch the chat document
      const chat = await Chat.findById(chatId);
  
      if (!chat) {
        return res.status(404).json({ message: "Chat Not Found" });
      }
  
      // Remove the user from the 'users' array
      chat.users.pull(userId);
  
      // Check if the user is an admin before attempting to remove
      const isAdmin = chat.groupAdmin.some(
        admin => admin._id.toString() === userId.toString()
      );
  
      if (isAdmin) {
        // Remove the user from the 'groupAdmin' array
        chat.groupAdmin = chat.groupAdmin.filter(
          admin => admin._id.toString() !== userId.toString()
        );
      }
  
      // If no admins remain, assign a new admin if possible
      if (chat.groupAdmin.length === 0 && chat.users.length > 0) {
        chat.groupAdmin.push(chat.users[0]);
      }
  
      // Save the updated chat document
      const updatedChat = await chat.save();
  
      // Populate the necessary fields
      await updatedChat.populate("users", "-password");
      await updatedChat.populate("groupAdmin", "-password");
  
      return res.json(updatedChat);
    } catch (error) {
      return res.status(400).json({
        message: "Failed to remove from group",
        error: error.message,
      });
    }
  };
  
  

  const updateGroupChatAdminMode = async (req, res) => {
    const {ownId, chatId, adminOnlyMode } = req.body;
  
    // Validate request data
    if (!chatId) {
      return res.status(400).json({ message: "Chat ID is required" });
    }
  
    if (typeof adminOnlyMode !== "boolean") {
      return res.status(400).json({ message: "adminOnlyMode must be a boolean value" });
    }
  
    try {
      // Find the chat by ID
      const chat = await Chat.findById(chatId);
  
      // Check if chat exists and is a group chat
      if (!chat || !chat.isGroupChat) {
        return res.status(404).json({ message: "Group chat not found" });
      }
  
      // Check if the requesting user is the admin
      // if (chat.groupAdmin.toString() !== ownId) {
      //   return res.status(403).json({ message: "Only admin can update group settings" });
      // }
  
      const isAdmin = chat.groupAdmin?.some(admin => admin._id.toString() === ownId.toString());

      if (!isAdmin) {
        return res.status(403).json({ message: "Only admin can update group settings" });
      }

      // Update the admin mode setting
      chat.adminOnlyMode = adminOnlyMode;
      await chat.save();
  
      // Return the updated chat with populated user fields
      const updatedChat = await Chat.findById(chatId)
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
  
      res.json(updatedChat);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };


  const getChatById = async (req, res) => {
    const { chatId } = req.body;
  
    if (!chatId) {
      return res.status(400).json({ message: "Chat ID is required" });
    }
  
    try {
      const chat = await Chat.findById(chatId)
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
  
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
  
      res.status(200).json(chat);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
  const makeAdmin = async (req, res) => {
    try {
      const { chatId, userId, ownId } = req.body;
  
      // Validate required fields
      if (!chatId || !userId || !ownId) {
        return res.status(400).json({
          success: false,
          message: "Chat ID, User ID, and Owner ID are required"
        });
      }
  
      // Find the chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Chat not found"
        });
      }
  
      // Check if it's a group chat
      if (!chat.isGroupChat) {
        return res.status(400).json({
          success: false,
          message: "This operation is only allowed for group chats"
        });
      }
  
  
  
      // Check if user is a member of the chat
      if (!chat.users.includes(userId)) {
        return res.status(400).json({
          success: false,
          message: "User is not a member of this chat"
        });
      }
  
      // Handle case where groupAdmin might be a single ObjectId or an array
      let currentAdmins = [];
      if (Array.isArray(chat.groupAdmin)) {
        currentAdmins = chat.groupAdmin;
      } else if (chat.groupAdmin) {
        currentAdmins = [chat.groupAdmin];
      }
  
      // Check if user is already an admin
      const isAlreadyAdmin = currentAdmins.some(admin => admin.toString() === userId.toString());
      if (isAlreadyAdmin) {
        return res.status(400).json({
          success: false,
          message: "User is already an admin"
        });
      }
  
      // Check if ownId is an admin
      const isOwnerAdmin = currentAdmins.some(admin => admin.toString() === ownId.toString());
      if (!isOwnerAdmin) {
        return res.status(403).json({
          success: false,
          message: "Only group admins can make other users admin"
        });
      }
  
      // Update groupAdmin field - ensure it's always an array
      const newAdmins = [...currentAdmins, userId];
      const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
          $set: { groupAdmin: newAdmins }
        },
        {
          new: true,
          populate: [
            { path: "users", select: "name email pic" },
            { path: "groupAdmin", select: "name email pic" },
            { path: "latestMessage" }
          ]
        }
      );
  
      res.status(200).json({
        success: true,
        message: "User has been made admin successfully",
        data: updatedChat
      });
  
    } catch (error) {
      console.error("Error making user admin:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  };

  module.exports = { accessChat,fetchChats,createGroupChat, renameGroup, addToGroup,removeFromGroup,updateGroupChatAdminMode,getChatById,makeAdmin};