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

const showAllBaseOnPaperCode = async (req, res) => {
  try {
    const { course_code, paper_code } = req.body;
    
    // Validate required parameters
    if (!course_code || !paper_code) {
      return res.status(400).json({
        success: false,
        message: 'Both course_code and paper_code are required parameters'
      });
    }

    // Find all paper documents that match the criteria
    const papers = await Paper.find({
      course_code: course_code,
      paper_code: paper_code
    });

    // Check if papers were found
    if (!papers || papers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No papers found with the provided course and paper codes'
      });
    }

    // Map through papers to format each one with required fields
    const formattedPapers = papers.map(paper => ({
      paper_code: paper.paper_code,
      course_code: paper.course_code,
      topic_name: paper.topic_name,
      image: paper.image,
      video: paper.video,
      paper_name: paper.paper_name,
      sem: paper.sem,
      teacher_name: paper.teacher_name,
      teacher_id: paper.teacher_id,
      createdAt:paper.createdAt
    }));

    // Return all matching papers
    return res.status(200).json({
      success: true,
      count: papers.length,
      data: formattedPapers
    });
  } catch (error) {
    console.error('Error finding papers:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving paper data',
      error: error.message
    });
  }
};

const deleteByCreatedTime=async(req,res)=>{
  const{topic_name}=req.body

  try {
    
  
    // Validate required parameters
    if ( !topic_name) {
      return res.status(400).json({
        success: false,
        message: 'Both createdAt and topic_name are required parameters'
      });
    }
    const exist= await Paper.findOne({
      topic_name: topic_name
    });

    // Find all paper documents that match the criteria
    const papers = await Paper.deleteOne({
      topic_name: topic_name
    });
    if(!exist){
      return res.status(400).json({
        success: false,
        message:`Topic Name : ${topic_name} is not exist in database`
      });
    }

    return res.status(200).json({
      success: true,
      message:`Topic Name :  ${topic_name} deleted successfully`
    });
  }
    catch (error) {
      console.error('Error finding papers:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while retrieving paper data',
        error: error.message
      });
    }
}

module.exports = {createPaper ,showAllBaseOnPaperCode,deleteByCreatedTime};