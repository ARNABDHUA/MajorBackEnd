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
      
      // Format current time as [hh:mm am/pm]
      const now = new Date();
      const formattedTime = formatTime(now);
      
      // Create attendance record
      const attendance = await Teacherattendance.create({
        teacher: teacher.name,
        paper_code,
        email:teacher.email,
        c_roll: teacher.c_roll,
        course_code,
        jointime: formattedTime,
        status: 'absent',  // Default status is now 'absent'
        date: now
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
      
      // Format current time as [hh:mm am/pm]
      const formattedTime = formatTime(new Date());
      
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