const Teacher = require('../models/teacherModel');

const createTeacher = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      email,
      salary,
      teacher_course
    } = req.body;

    // Step 1️⃣: Check if the email already exists
    const existingEmail = await Teacher.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists!' });
    }

    // Step 2️⃣: Generate the c_roll
    const currentYear = new Date().getFullYear().toString().slice(-2); // last two digits of the year
    const phoneDigits = phoneNumber.slice(0, 2); // first two digits of phone number

    // Find the last teacher to get the last auto-increment number
    const lastTeacher = await Teacher.findOne().sort({ createdAt: -1 });

    let lastIncrement = 0;
    if (lastTeacher) {
      const lastCRoll = lastTeacher.c_roll;
      lastIncrement = parseInt(lastCRoll.slice(-3)); // get last 3 digits
    }

    const newIncrement = (lastIncrement + 1).toString().padStart(3, '0');

    const c_roll = `7${currentYear}${phoneDigits}${newIncrement}`;

    // Step 3️⃣: Extra check if c_roll already exists (very unlikely)
    const existingCRoll = await Teacher.findOne({ c_roll });
    if (existingCRoll) {
      return res.status(400).json({ message: 'c_roll already exists! Please try again.' });
    }

    // Step 4️⃣: Create new teacher
    const newTeacher = new Teacher({
      name,
      c_roll, // using generated c_roll
      phoneNumber,
      email,
      salary,
      teacher_course
    });

    await newTeacher.save();

    res.status(201).json({
      message: 'Teacher created successfully',
      data: newTeacher
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get All Teachers
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Single Teacher
const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    res.status(200).json(teacher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Teacher
const updateTeacher = async (req, res) => {
    try {
      const { phoneNumber, qualification, address, expertise } = req.body;
      const updates = {};
  
      // ✅ Optional fields to update
      if (phoneNumber) updates.phoneNumber = phoneNumber;
      if (qualification) updates.qualification = qualification;
      if (address) updates.address = address;
      if (expertise) updates.expertise = expertise;
  
      // ✅ Handle image upload if file is present
      if (req.file) {
        updates.image = req.file.filename; // You can adjust to `req.file.path` or full URL
      }
  
      // ✅ Find teacher by ID and update the specified fields
      const updatedTeacher = await Teacher.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true } // returns the updated document
      );
  
      if (!updatedTeacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
  
      res.status(200).json({
        message: 'Teacher updated successfully!',
        data: updatedTeacher
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

const updateTeacherCourseByCRoll = async (req, res) => {
    try {
      const { c_roll } = req.params; // Get c_roll from URL params
      const { teacher_course } = req.body; // Get new teacher_course array from body
  
      // Step 1️⃣: Find teacher by c_roll
      const teacher = await Teacher.findOne({ c_roll });
  
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found with the given c_roll!' });
      }
  
      // Step 2️⃣: Update the teacher_course field
      teacher.teacher_course = teacher_course;
  
      // Step 3️⃣: Save the updated teacher
      await teacher.save();
  
      res.status(200).json({
        message: 'Teacher course updated successfully!',
        data: teacher
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// Delete Teacher
const deleteTeacher = async (req, res) => {
  try {
    const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!deletedTeacher) return res.status(404).json({ message: 'Teacher not found' });

    res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { createTeacher, getAllTeachers , getTeacherById , updateTeacher, deleteTeacher , updateTeacherCourseByCRoll};