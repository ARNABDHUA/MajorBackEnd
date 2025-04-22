const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const cloudinary = require("./cloudinary");
const fs = require("fs");

const teacherFileMessage = async (req, res) => {
    // console.log("kkkkkkkk",req.files.file)
  try {
    // Check if file is provided
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        status: "error",
        message: "No file was received. Please upload a file."
      });
    }

    const uploadedFile = req.files.file;
    
    // Check file size (5MB limit)
    if (uploadedFile.size > 5 * 1024 * 1024) {
      return res.status(413).json({
        status: "error",
        message: "File is too large. Maximum size is 5MB."
      });
    }
    
    // Check file type
    const fileType = uploadedFile.mimetype;
    if (!(fileType === "application/pdf" || 
          fileType === "image/jpeg" || 
          fileType === "image/png" || 
          fileType === "image/gif")) {
      
      return res.status(415).json({
        status: "error",
        message: "Invalid file type. Only PDF, JPEG, PNG, and GIF files are allowed."
      });
    }
    
    // Get email and chatId from the request body
    const { email, chatId } = req.body;
    
    if (!email || !chatId) {
      return res.status(400).json({
        status: "error",
        message: "Email and chatId are required"
      });
    }
    
    // Find the user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found with the provided email"
      });
    }
    
    // Check if the user is a teacher
    if (!user.isteacher) {
      return res.status(403).json({
        status: "error",
        message: "Only teachers can upload files"
      });
    }
    
    // Find the chat
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        status: "error",
        message: "Chat not found"
      });
    }
    
    // Check if user is a member of the chat
    const isUserInChat = chat.users.some(
      userId => userId.toString() === user._id.toString()
    );
    
    if (!isUserInChat) {
      return res.status(403).json({
        status: "error",
        message: "User is not a member of this chat"
      });
    }
    
    // Upload the file to Cloudinary
    try {
      // Determine if it's a PDF or image
      const resourceType = fileType.includes('pdf') ? 'raw' : 'image';
      
      const cloudinaryResponse = await cloudinary.uploader.upload(
        uploadedFile.tempFilePath, 
        {
          resource_type: resourceType,
          folder: "chat_files"
        }
      );
      
      // Clean up the temporary file
      fs.unlinkSync(uploadedFile.tempFilePath);
      
      // Create the message content with the file URL
      const dataName=uploadedFile.name;
      const fileTypeLabel = fileType.includes('pdf') ? `PDF ${dataName}` : 'Image';
      const content = `${fileTypeLabel}: ${cloudinaryResponse.secure_url}`;
      
      // Create a new message
      const newMessage = await Message.create({
        sender: user._id,
        content: content,
        chat: chatId,
        readBy: [user._id]
      });
      
      // Populate the message with sender info
      const populatedMessage = await Message.findById(newMessage._id)
        .populate("sender", "name pic email")
        .populate("chat");
      
      // Update the latestMessage field in the chat
      await Chat.findByIdAndUpdate(chatId, {
        latestMessage: newMessage._id
      });
      
      return res.status(201).json({
        status: "success",
        message: "File uploaded and sent as message successfully",
        data: populatedMessage
      });
      
    } catch (cloudinaryError) {
      console.error("Cloudinary upload error:", cloudinaryError);
      
      // Try to clean up the temp file if it exists
      try {
        if (uploadedFile.tempFilePath && fs.existsSync(uploadedFile.tempFilePath)) {
          fs.unlinkSync(uploadedFile.tempFilePath);
        }
      } catch (cleanupError) {
        console.error("Failed to clean up temp file:", cleanupError);
      }
      
      return res.status(500).json({
        status: "error",
        message: "Failed to upload file to cloud storage"
      });
    }
    
  } catch (error) {
    console.error("Server error:", error);
    
    // Attempt to clean up temp files if they exist
    if (req.files && req.files.file && req.files.file.tempFilePath) {
      try {
        if (fs.existsSync(req.files.file.tempFilePath)) {
          fs.unlinkSync(req.files.file.tempFilePath);
        }
      } catch (cleanupError) {
        console.error("Failed to clean up temp file:", cleanupError);
      }
    }
    
    return res.status(500).json({
      status: "error",
      message: "An unexpected error occurred"
    });
  }
};

module.exports = { teacherFileMessage };