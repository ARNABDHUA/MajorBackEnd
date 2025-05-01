// import Paper from "../model/Paper.js"
// import cloudinary from '../lib/cloudinary.js';
// import fs from 'fs';
const Paper=require("../models/videoModel.js");
const cloudinary =require("./cloudinary.js");
const fs = require("fs");

const createPaper = async (req, res) => {
    // console.log("ooooooooooooooooooooooooooooooooooooooooooooooooooo",req.body)
  try {
    const {
      paper_code,
      course_code,
      topic_name,
      paper_name,
      sem,
      teacher_name,
      teacher_id,
    } = req.body;

    // console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",req.files.image);
    // Check if files are provided
    if (!req.files || !req.files.image || !req.files.video) {
      return res
        .status(400)
        .json({ error: 'Image and video files are required' });
    }

    // Upload image to Cloudinary
    const imageResult = await cloudinary.uploader.upload(
      req.files.image.tempFilePath,
      {
        folder: 'papers/images',
        resource_type: 'image',
      }
    );

    // Upload video to Cloudinary
    const videoResult = await cloudinary.uploader.upload(
      req.files.video.tempFilePath,
      {
        folder: 'papers/videos',
        resource_type: 'video',
      }
    );

    // Clean up temp files
    fs.unlinkSync(req.files.image.tempFilePath);
    fs.unlinkSync(req.files.video.tempFilePath);

    // Create new paper document
    const paper = new Paper({
      paper_code,
      course_code,
      topic_name,
      image: imageResult.secure_url,
      video: videoResult.secure_url,
      paper_name,
      sem,
      teacher_name,
      teacher_id,
    });

    await paper.save();

    res.status(201).json({ message: 'Paper created successfully', paper });
  } catch (error) {
    console.error('Error creating paper:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {createPaper };