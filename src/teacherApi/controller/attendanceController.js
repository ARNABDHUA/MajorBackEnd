const { v4: uuidv4 } = require('uuid');
const Teacher = require('../models/teacherModel');
const Teacherattendance=require('../models/attendance');
  
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
      
      // Get current date and time in Indian Standard Time (Kolkata)
      const now = new Date();
      
      // Format time as [hh:mm am/pm] using proper locale formatting for IST
      const timeOptions = { 
        timeZone: 'Asia/Kolkata', 
        hour12: true,
        hour: '2-digit', 
        minute: '2-digit'
      };
      const formattedTime = now.toLocaleTimeString('en-US', timeOptions);
      
      // Create a date object in IST
      const istOptions = { timeZone: 'Asia/Kolkata' };
      const istNow = new Date(now.toLocaleString('en-US', istOptions));
      
      // Format date as dd-mm-yyyy
      const day = String(istNow.getDate()).padStart(2, '0');
      const month = String(istNow.getMonth() + 1).padStart(2, '0'); // January is 0
      const year = istNow.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      
      // Check if attendance record already exists for this teacher, paper_code and date
      let attendance = await Teacherattendance.findOne({
        c_roll,
        paper_code,
        date: formattedDate
      });
      
      // If attendance record exists, update the jointime
      if (attendance) {
        attendance.jointime = formattedTime;
        await attendance.save();
      } else {
        // Create new attendance record with IST date
        attendance = await Teacherattendance.create({
          teacher: teacher.name,
          paper_code,
          email: teacher.email,
          c_roll: teacher.c_roll,
          course_code,
          jointime: formattedTime,
          status: 'absent',  // Default status is 'absent'
          date: formattedDate      // Store the IST Date object
        });
      }
      
      // Return attendance_id and formatted date in the response
      res.status(201).json({
        success: true,
        data: {
          attendance_id: attendance.attendance_id,
          date: attendance.date
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
      
      // Format time as [hh:mm am/pm] using proper locale formatting for IST
      const timeOptions = { 
        timeZone: 'Asia/Kolkata', 
        hour12: true,
        hour: '2-digit', 
        minute: '2-digit'
      };
      const formattedTime = now.toLocaleTimeString('en-US', timeOptions);
      
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

  const getAttendanceByPaperAndRoll = async (req, res) => {
    try {
      const { paper_code, c_roll } = req.body;

      if (!paper_code || !c_roll) {
        return res.status(400).json({ 
          success: false, 
          message: 'Both paper_code and c_roll are required' 
        });
      }
      const attendanceRecords = await Teacherattendance.find({
        paper_code: paper_code,
        c_roll: c_roll
      }).sort({ date: -1}); // Sort by date most recent first
      
      if (!attendanceRecords || attendanceRecords.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No attendance records found for the given paper code and roll number'
        });
      }
      return res.status(200).json({
        success: true,
        count: attendanceRecords.length,
        data: attendanceRecords
      });
      
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching attendance records',
        error: error.message
      });
    }
  };
  

  module.exports = {recordAttendance,updateExitTime,getAttendanceByPaperAndRoll}