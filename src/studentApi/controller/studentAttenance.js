const { v4: uuidv4 } = require('uuid');
const Student = require('../models/studentLogInModels');
const Studentattendance=require('../models/studentAttendance');
const Teacherattendance=require('../../teacherApi/models/attendance');
  
  
  const recordAttendance = async (req, res) => {
    try {
      const { c_roll, paper_code, course_code } = req.body;
      
      // Find Student
      const student = await Student.findOne({ c_roll });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found. Please provide valid Student credentials.'
        });
      }
      
      const now = new Date();
      
      // Format time as [hh:mm am/pm] 
      const timeOptions = { 
        timeZone: 'Asia/Kolkata', 
        hour12: true,
        hour: '2-digit', 
        minute: '2-digit'
      };
      const formattedTime = now.toLocaleTimeString('en-US', timeOptions);
      
      const istOptions = { timeZone: 'Asia/Kolkata' };
      const istNow = new Date(now.toLocaleString('en-US', istOptions));
      
      // Format date as dd-mm-yyyy
      const day = String(istNow.getDate()).padStart(2, '0');
      const month = String(istNow.getMonth() + 1).padStart(2, '0'); // January is 0
      const year = istNow.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      
      // Check if attendance record already exists for this Student, paper_code and date
      let attendance = await Studentattendance.findOne({
        c_roll,
        paper_code,
        course_code,
        date: formattedDate
      });
      
      // If attendance record exists, DO NOT update the jointime 
      if (attendance) {
      } else {
        // Create new attendance record with IST date
        attendance = await Studentattendance.create({
          name: student.name,
          paper_code,
          email: student.email,
          c_roll: student.c_roll,
          course_code,
          jointime: formattedTime,
          status: 'absent',  
          date: formattedDate      
        });
      }
      
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
  
  const updateExitTime = async (req, res) => {
    try {
      const { attendance_id } = req.body;
      
      const attendance = await Studentattendance.findOne({ attendance_id });
      
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

  const todayRecordStudent=async(req,res)=>{
    const {c_roll}=req.body;

    const now = new Date();
    const istOptions = { timeZone: 'Asia/Kolkata' };
      const istNow = new Date(now.toLocaleString('en-US', istOptions));
      
      // Format date as dd-mm-yyyy
      const day = String(istNow.getDate()).padStart(2, '0');
      const month = String(istNow.getMonth() + 1).padStart(2, '0'); // January is 0
      const year = istNow.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;

      const attendanceRecords = await Studentattendance.find({
        date: formattedDate,
        c_roll: c_roll
      });
  
      try
      {
        if (attendanceRecords.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No attendance records found for today for this student"
        });
      }

      return res.status(200).json({
        success: true,
        count: attendanceRecords.length,
        data: attendanceRecords
      });
    }
    catch (error) {
        res.status(400).json({
          success: false,
          message: 'current attendance record error ',
          error: error.message
        });
      }

  }
  
const getTotalClassesCount = async (req, res) => {
    try {
      const { c_roll, paper_code } = req.body;
  
      // Validate required parameters
      if (!c_roll && !paper_code) {
        return res.status(400).json({
          success: false,
          message: "Both c_roll and paper_code are required"
        });
      }
  
      // Count total classes for this student and paper code
      const totalClasses = await Teacherattendance.countDocuments({
        paper_code: paper_code,
        status: 'present'
      });
  
      // Get list of dates when classes occurred
      const classDates = await Teacherattendance.distinct('date', {
        c_roll: c_roll,
        paper_code: paper_code
      });
  
      // Get attendance status statistics
      const presentCount = await Studentattendance.countDocuments({
        c_roll: c_roll,
        paper_code: paper_code,
        status: 'present'
      });
  
      const absentCount = totalClasses-presentCount
  
  
      return res.status(200).json({
        success: true,
        totalClasses: totalClasses,
        classDates: classDates,
        attendanceStats: {
          present: presentCount,
          absent: absentCount
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error counting total classes',
        error: error.message
      });
    }
  };
  

const getPresentStudentsByPaperCode = async (req, res) => {
    try {
      const { paper_code ,course_code } = req.body;
  
      // Validate paper_code parameter
      if (!paper_code && course_code) {
        return res.status(400).json({
          success: false,
          message: "paper_code and course_code both are required"
        });
      }
      
      const now = new Date();
      const istOptions = { timeZone: 'Asia/Kolkata' };
      const istNow = new Date(now.toLocaleString('en-US', istOptions));
      
      // Format date as dd-mm-yyyy
      const day = String(istNow.getDate()).padStart(2, '0');
      const month = String(istNow.getMonth() + 1).padStart(2, '0'); // January is 0
      const year = istNow.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
  
      // Find all students who are present for this paper code today
      const presentStudents = await Studentattendance.find({
        paper_code: paper_code,
        date: formattedDate,
        status: 'present'
      }).select('name email c_roll jointime exittime');
  
      if (presentStudents.length === 0) {
        return res.status(200).json({
          success: true,
          message: `No present students found for paper code ${paper_code} on ${formattedDate}`
        });
      }
  
      // Get total number of students (present or not) for this paper code today
      const totalStudents = await Student.countDocuments({
        payment:true, 
        course_code:course_code
      });
  
      return res.status(200).json({
        success: true,
        date: formattedDate,
        paper_code: paper_code,
        presentCount: presentStudents.length,
        totalStudents: totalStudents,
        attendancePercentage: ((presentStudents.length / totalStudents) * 100).toFixed(2) + '%',
        presentStudents: presentStudents
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving present students',
        error: error.message
      });
    }
  };


const getStudentAttendanceStats = async (req, res) => {
    try {
      const { course_code, paper_code } = req.body;
   
      // Validate required parameters
      if (!course_code || !paper_code) {
        return res.status(400).json({
          success: false,
          message: "course_code and paper_code are required"
        });
      }
   
      // Get total students enrolled in this course who have made payment
      const totalStudents = await Student.countDocuments({
        payment: true,
        course_code: course_code
      });
   
      // Get all unique dates when classes were conducted for this paper code
      const classDates = await Teacherattendance.distinct('date', {
        paper_code: paper_code,
        status: 'present'
      });
   
      // Total classes count is the number of unique dates
      const totalClasses = classDates.length;
   
      // Get all unique students enrolled in the course
      const enrolledStudents = await Student.find({
        payment: true,
        course_code: course_code
      }).select('name email c_roll');
   
      // Create attendance statistics for each student
      const attendanceStats = [];
      
      for (const student of enrolledStudents) {
        // Get attendance records for this student
        const studentAttendance = await Studentattendance.find({
          c_roll: student.c_roll,
          paper_code: paper_code,
          status: 'present'
        }).select('date');
        
        // Count present days
        const presentCount = studentAttendance.length;
        
        // Count absent days (total classes minus present days)
        const absentCount = totalClasses - presentCount;
        
        // Calculate attendance percentage
        const attendancePercentage = totalClasses > 0 
          ? ((presentCount / totalClasses) * 100).toFixed(2) 
          : 0;
        
        // Get dates student was present
        const presentDates = studentAttendance.map(record => record.date);
        
        // Get dates student was absent
        const absentDates = classDates.filter(date => !presentDates.includes(date));
   
        attendanceStats.push({
          name: student.name,
          email: student.email,
          c_roll: student.c_roll,
          totalClasses: totalClasses,
          presentCount: presentCount,
          absentCount: absentCount,
          attendancePercentage: attendancePercentage + '%',
          presentDates: presentDates,
          absentDates: absentDates
        });
      }
   
      return res.status(200).json({
        success: true,
        course_code: course_code,
        paper_code: paper_code,
        totalEnrolledStudents: totalStudents,
        totalClassesConducted: totalClasses,
        classDates: classDates,
        attendanceData: attendanceStats
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving attendance statistics',
        error: error.message
      });
    }
   };

  

  module.exports = {recordAttendance,updateExitTime,todayRecordStudent,getTotalClassesCount,getPresentStudentsByPaperCode,getStudentAttendanceStats}