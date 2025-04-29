const { v4: uuidv4 } = require('uuid');
const Teacher = require('../models/teacherModel');
const Teacherattendance=require('../models/attendance');

const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };
  
  // Modified recordAttendance function
  const recordAttendance = async (req, res) => {
    try {
      const { c_roll, paper_code, course_code } = req.body;
      
      // Find teacher
      const teacher = await Teacher.findOne({ c_roll });
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found. Please provide valid teacher credentials.'
        });
      }
      
      // Check if teacher is assigned to this course
      if (!teacher.teacher_course.includes(paper_code)) {
        return res.status(400).json({
          success: false,
          message: 'Teacher is not assigned to this course'
        });
      }
      
      // Get current time in Indian Standard Time (Kolkata)
      const now = new Date();
      // Convert to IST (UTC+5:30)
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      
      // Format time as [hh:mm am/pm]
      const formattedTime = formatTime(istTime);
      
      // Format date as day-month-year for display purposes
      const formattedDate = `${istTime.getDate()}-${istTime.getMonth() + 1}-${istTime.getFullYear()}`;
      
      // Create attendance record
      const attendance = await Teacherattendance.create({
        teacher: teacher.name,
        paper_code,
        email: teacher.email,
        c_roll: teacher.c_roll,
        course_code,
        jointime: formattedTime,
        status: 'absent',  // Default status is now 'absent'
        date: istTime,     // Store the Date object, not the string
        formatted_date: formattedDate  // Store the formatted string in a separate field
      });
      
      // Return only the attendance_id in the response
      res.status(201).json({
        success: true,
        data: {
          attendance_id: attendance.attendance_id
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Could not record attendance',
        error: error.message
      });
    }
  };
  
  // Modified updateExitTime function
  const updateExitTime = async (req, res) => {
    try {
      const { attendance_id } = req.body;
      
      // Find attendance by attendance_id
      const attendance = await Teacherattendance.findOne({ attendance_id });
      
      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found'
        });
      }
      
      // Get current time in Indian Standard Time (Kolkata)
      const now = new Date();
      // Convert to IST (UTC+5:30)
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      
      // Format time as [hh:mm am/pm]
      const formattedTime = formatTime(istTime);
      
      // Update exit time and status
      attendance.exittime = formattedTime;
      attendance.status = 'present';
      await attendance.save();
      
      res.status(200).json({
        success: true,
        message: 'Exit time recorded successfully',
        data: {
          attendance
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Could not update exit time',
        error: error.message
      });
    }
  };
  

  module.exports = {recordAttendance,updateExitTime}