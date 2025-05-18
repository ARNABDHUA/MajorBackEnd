const Notice=require('../model/noticeModel');
const cloudinary =require("./cloudinary.js");
const fs = require("fs");

const createNotice = async (req, res) => {
    try {
      const {
        sender,
        email,
        student,
        label,
        short_description,
        long_description
      } = req.body;
  
      // Validate required fields
      if (!sender || !email || !label || !short_description || !long_description) {
        return res.status(400).json({
          status: "error",
          message: "All required fields must be provided: sender, email, label, short_description, long_description"
        });
      }
  
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: "error",
          message: "Please provide a valid email address"
        });
      }
  
      // Check if files are provided
    //   if (!req.files || !req.files.file) {
    //     return res.status(400).json({
    //       status: "error",
    //       message: "No file was received. Please upload a file."
    //     });
    //   }
  
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
  
      // Determine if it's a PDF or image
      const resourceType = fileType.includes('pdf') ? 'image' : 'image';
      
      try {
        // Upload to Cloudinary
        const cloudinaryResponse = await cloudinary.uploader.upload(
          uploadedFile.tempFilePath, 
          {
            resource_type: resourceType,
            folder: "chat_files"
          }
        );
        
        // Clean up the temporary file
        if (fs.existsSync(uploadedFile.tempFilePath)) {
          fs.unlinkSync(uploadedFile.tempFilePath);
        }
  
        // Create new notice document
        const notice = new Notice({
          sender: sender.trim(),
          email,
          student: student === 'true' || student === true || student === 'on',
          label,
          short_description,
          long_description,
          pdf_file: cloudinaryResponse.secure_url
        });
  
        const savedNotice = await notice.save();
  
        res.status(201).json({ 
          status: "success",
          message: 'Notice created successfully', 
          data: savedNotice 
        });
  
      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);
        
        // Clean up temp file in case of upload error
        if (uploadedFile.tempFilePath && fs.existsSync(uploadedFile.tempFilePath)) {
          try {
            fs.unlinkSync(uploadedFile.tempFilePath);
          } catch (cleanupError) {
            console.error('Error cleaning up temp file:', cleanupError);
          }
        }
  
        return res.status(500).json({
          status: "error",
          message: "Error uploading file to cloud storage",
          error: uploadError.message
        });
      }
  
    } catch (error) {
      console.error('Error creating notice:', error);
      
      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          status: "error",
          message: "Validation error",
          errors: validationErrors
        });
      }
  
      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({
          status: "error",
          message: "Notice with similar data already exists"
        });
      }
  
      res.status(500).json({ 
        status: "error",
        message: 'Server error',
        error: error.message 
      });
    }
  };

  const getAllNotices = async (req, res) => {
    try {
      const notices = await Notice.find().sort({ createdAt: -1 });
      res.status(200).json({
        status: "success",
        message: 'Notices fetched successfully',
        data: notices,
        count: notices.length
      });
    } catch (error) {
      console.error('Error fetching notices:', error);
      res.status(500).json({
        status: "error",
        message: 'Error fetching notices',
        error: error.message
      });
    }
  };

  const getNoticeById = async (req, res) => {
    try {
      const notice = await Notice.findById(req.params.id);
      
      if (!notice) {
        return res.status(404).json({
          status: "error",
          message: 'Notice not found'
        });
      }
  
      res.status(200).json({
        status: "success",
        message: 'Notice fetched successfully',
        data: notice
      });
    } catch (error) {
      console.error('Error fetching notice:', error);
      res.status(500).json({
        status: "error",
        message: 'Error fetching notice',
        error: error.message
      });
    }
  };

  const updateNotice = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
  
      // Handle file upload if new file is provided
      if (req.files && req.files.file) {
        const uploadedFile = req.files.file;
        
        // Validate file
        if (uploadedFile.size > 5 * 1024 * 1024) {
          return res.status(413).json({
            status: "error",
            message: "File is too large. Maximum size is 5MB."
          });
        }
  
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
  
        // Upload new file to Cloudinary
        const resourceType = fileType.includes('pdf') ? 'raw' : 'image';
        const cloudinaryResponse = await cloudinary.uploader.upload(
          uploadedFile.tempFilePath, 
          {
            resource_type: resourceType,
            folder: "chat_files"
          }
        );
        
        // Clean up temp file
        if (fs.existsSync(uploadedFile.tempFilePath)) {
          fs.unlinkSync(uploadedFile.tempFilePath);
        }
  
        updateData.pdf_file = cloudinaryResponse.secure_url;
      }
  
      const updatedNotice = await Notice.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
  
      if (!updatedNotice) {
        return res.status(404).json({
          status: "error",
          message: 'Notice not found'
        });
      }
  
      res.status(200).json({
        status: "success",
        message: 'Notice updated successfully',
        data: updatedNotice
      });
    } catch (error) {
      console.error('Error updating notice:', error);
      res.status(500).json({
        status: "error",
        message: 'Error updating notice',
        error: error.message
      });
    }
  };

  const deleteNotice = async (req, res) => {
    try {
      const { id } = req.params;
      
      const deletedNotice = await Notice.findByIdAndDelete(id);
      
      if (!deletedNotice) {
        return res.status(404).json({
          status: "error",
          message: 'Notice not found'
        });
      }
  
      res.status(200).json({
        status: "success",
        message: 'Notice deleted successfully',
        data: deletedNotice
      });
    } catch (error) {
      console.error('Error deleting notice:', error);
      res.status(500).json({
        status: "error",
        message: 'Error deleting notice',
        error: error.message
      });
    }
  };
  

  module.exports={createNotice,getAllNotices,getNoticeById,updateNotice,deleteNotice}