const CoursePaper = require('../models/paperCodeModel');

 const createCoursePaper = async (req, res) => {
    try {
      const { course_code, sem, papers } = req.body;
  
      // Check if record already exists
      const existingCoursePaper = await CoursePaper.findOne({ course_code, sem });
      if (existingCoursePaper) {
        return res.status(400).json({
          success: false,
          message: 'Course with this ID and semester already exists'
        });
      }
  
      // Create new course paper record
      const coursePaper = new CoursePaper({
        course_code,
        sem,
        papers
      });
  
      const savedCoursePaper = await coursePaper.save();
      
      res.status(201).json({
        success: true,
        data: savedCoursePaper
      });
    } catch (error) {
      console.error('Error creating course paper:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };

  
 const getAllCoursePapers = async (req, res) => {
    try {
      const coursePapers = await CoursePaper.find();
      
      res.status(200).json({
        success: true,
        count: coursePapers.length,
        data: coursePapers
      });
    } catch (error) {
      console.error('Error getting course papers:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };

 const getCoursePaper = async (req, res) => {
    try {
      const { course_code, sem } = req.body;
      
      const coursePaper = await CoursePaper.findOne({ 
        course_code: (course_code), 
        sem 
      });
      
      if (!coursePaper) {
        return res.status(404).json({
          success: false,
          message: 'Course paper not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: coursePaper
      });
    } catch (error) {
      console.error('Error getting course paper:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };

 const getPaperByCode = async (req, res) => {
    try {
      const { paper_code } = req.body;
      
      const coursePaper = await CoursePaper.findOne({
        'papers.paper_code': paper_code
      });
      
      if (!coursePaper) {
        return res.status(404).json({
          success: false,
          message: 'Paper not found with this code'
        });
      }
      
      // Find the specific paper in the papers array
      const paper = coursePaper.papers.find(p => p.paper_code === paper_code);
      
      res.status(200).json({
        success: true,
        data: {
          course_code: coursePaper.course_code,
          sem: coursePaper.sem,
          paper_details: paper
        }
      });
    } catch (error) {
      console.error('Error getting paper by code:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };

  
 const updateCoursePaper = async (req, res) => {
    try {
      const { course_code,papers } = req.body;
      
      const coursePaper = await CoursePaper.findOne({ 
        course_code: (course_code), 
        sem 
      });
      
      if (!coursePaper) {
        return res.status(404).json({
          success: false,
          message: 'Course paper not found'
        });
      }
      
      // Update papers array
      if (papers) {
        coursePaper.papers = papers;
      }
      
      const updatedCoursePaper = await coursePaper.save();
      
      res.status(200).json({
        success: true,
        data: updatedCoursePaper
      });
    } catch (error) {
      console.error('Error updating course paper:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };

  
 const addPaper = async (req, res) => {
    try {
      const { paper_code, paper_name ,course_code, sem} = req.body;
      
      if (!paper_code || !paper_name) {
        return res.status(400).json({
          success: false,
          message: 'Paper code and name are required'
        });
      }
      
      const coursePaper = await CoursePaper.findOne({ 
        course_code: (course_code), 
        sem 
      });
      
      if (!coursePaper) {
        return res.status(404).json({
          success: false,
          message: 'Course paper not found'
        });
      }
      
      // Check if paper with this code already exists
      const paperExists = coursePaper.papers.some(p => p.paper_code === paper_code);
      if (paperExists) {
        return res.status(400).json({
          success: false,
          message: 'Paper with this code already exists'
        });
      }
      
      // Add new paper
      coursePaper.papers.push({ paper_code, paper_name });
      
      const updatedCoursePaper = await coursePaper.save();
      
      res.status(200).json({
        success: true,
        data: updatedCoursePaper
      });
    } catch (error) {
      console.error('Error adding paper:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };

  
 const updatePaper = async (req, res) => {
    try {
      const { paper_name, new_paper_code ,course_code, sem, paper_code} = req.body;
      
      const coursePaper = await CoursePaper.findOne({ 
        course_code: course_code, 
        sem 
      });
      
      if (!coursePaper) {
        return res.status(404).json({
          success: false,
          message: 'Course paper not found'
        });
      }
      
      // Find the paper index
      const paperIndex = coursePaper.papers.findIndex(p => p.paper_code === paper_code);
      if (paperIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Paper not found with this code'
        });
      }
      
      // Update the paper
      if (paper_name) {
        coursePaper.papers[paperIndex].paper_name = paper_name;
      }
      
      if (new_paper_code) {
        // Check if new code already exists
        const newCodeExists = coursePaper.papers.some(p => p.paper_code === new_paper_code);
        // if (newCodeExists) {
        //   return res.status(400).json({
        //     success: false,
        //     message: 'New paper code already exists'
        //   });
        // }
        coursePaper.papers[paperIndex].paper_code = new_paper_code;
      }
      
      const updatedCoursePaper = await coursePaper.save();
      
      res.status(200).json({
        success: true,
        data: updatedCoursePaper
      });
    } catch (error) {
      console.error('Error updating paper:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };

  
 const removePaper = async (req, res) => {
    try {
      const { course_code, sem, paper_code } = req.body;
      
      const coursePaper = await CoursePaper.findOne({ 
        course_code:(course_code), 
        sem 
      });
      
      if (!coursePaper) {
        return res.status(404).json({
          success: false,
          message: 'Course paper not found'
        });
      }
      
      // Filter out the paper to remove
      const initialLength = coursePaper.papers.length;
      coursePaper.papers = coursePaper.papers.filter(p => p.paper_code !== paper_code);

      if(initialLength===1 && coursePaper.papers=== 0 ){// add

        const result = await CoursePaper.findOneAndDelete({ 
          course_code:(course_code), 
          sem 
        });
        return res.status(200).json({
          success: true,
          message: 'All Papers in the sem is deleted'
        });
      }//add
      
      // Check if paper was found and removed
      if (coursePaper.papers.length === initialLength) {
        return res.status(404).json({
          success: false,
          message: 'Paper not found with this code'
        });
      }
      
      const updatedCoursePaper = await coursePaper.save();
      
      res.status(200).json({
        success: true,
        message: 'Paper removed successfully',
        data: updatedCoursePaper
      });
    } catch (error) {
      console.error('Error removing paper:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };

 const deleteCoursePaper = async (req, res) => {
    try {
      const { course_code, sem } = req.body;
      
      const result = await CoursePaper.findOneAndDelete({ 
        course_code:(course_code), 
        sem 
      });
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Course paper not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Course paper deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting course paper:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };

  module.exports={createCoursePaper,getAllCoursePapers,getCoursePaper,getPaperByCode,updateCoursePaper,addPaper,updatePaper,removePaper,deleteCoursePaper}