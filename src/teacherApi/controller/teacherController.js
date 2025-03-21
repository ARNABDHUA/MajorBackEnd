const Teacher = require('../models/teacherModel');
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");

const SECRET_KEY="helloArnab";

const createTeacher = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      email,
      salary,
      teacher_course,
      password // get password from request body
    } = req.body;

    // Step 1️⃣: Check if the email already exists
    const existingEmail = await Teacher.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists!' });
    }

    // Step 2️⃣: Generate the c_roll
    const currentYear = new Date().getFullYear().toString().slice(-2); // last two digits of the year
    const phoneDigits = phoneNumber.slice(0, 2); // first two digits of phone number

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

    // Step 4️⃣: Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Step 5️⃣: Create new teacher
    const newTeacher = new Teacher({
      name,
      c_roll, // using generated c_roll
      phoneNumber,
      email,
      salary,
      teacher_course,
      password: hashedPassword // save hashed password
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
    const{c_roll}=req.params;
    const teacher = await Teacher.findOne({c_roll});
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    res.status(200).json(teacher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Teacher
const updateTeacher = async (req, res) => {
  try {
    const { phoneNumber, degree, institution, year, expertise } = req.body;
    const { c_roll } = req.params;

    // ✅ Find the teacher first
    const teacher = await Teacher.findOne({ c_roll: c_roll });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const updates = {};
    let message = ''; // Store any messages to send back

    // ✅ Optional fields to update
    if (phoneNumber) updates.phoneNumber = phoneNumber;

    // ✅ Qualification handling
    if (degree || institution || year) {
      const newQualification = {
        ...(degree && { degree }),
        ...(institution && { institution }),
        ...(year && { year })
      };

      // Check if the degree already exists
      const degreeExists = (teacher.qualification || []).some(
        (q) => q.degree.toLowerCase() === degree.toLowerCase()
      );

      if (degreeExists) {
        return res.status(400).json({ message: 'Degree already present.' });
      } else {
        // Append the new qualification
        updates.qualification = [
          ...(teacher.qualification || []),
          newQualification
        ];
        message += 'Qualification added successfully. ';
      }
    }

    // ✅ Expertise handling (assuming it's an array now)
    if (expertise) {
      const existingExpertise = teacher.expertise || [];

      // Check if expertise is already present
      const expertiseExists = existingExpertise.some(
        (exp) => exp.toLowerCase() === expertise.toLowerCase()
      );

      if (expertiseExists) {
        return res.status(400).json({ message: 'Expertise already present.' });
      } else {
        updates.expertise = [...existingExpertise, expertise];
        message += 'Expertise added successfully. ';
      }
    }

    // ✅ Handle image upload if file is present
    if (req.file) {
      updates.image = req.file.filename;
    }

    // ✅ If there are updates, proceed with updating the teacher
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid updates provided.' });
    }

    const updatedTeacher = await Teacher.findOneAndUpdate(
      { c_roll: c_roll },
      { $set: updates },
      { new: true }
    );

    res.status(200).json({
      message: message || 'Teacher updated successfully!',
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
    const{c_roll}=req.params
    const deletedTeacher = await Teacher.findOneAndDelete({c_roll});
    if (!deletedTeacher) return res.status(404).json({ message: 'Teacher not found' });

    res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const logInTeacher= async(req,res)=>{

    const { c_roll, password } = req.body;
  
    try {
      const existingUser = await Teacher.findOne({ c_roll: c_roll });
  
      if (!existingUser) {
        return res.status(404).json({ message: "Teacher not found" });
      }
  
      const matchPassword = await bcrypt.compare(password, existingUser.password);
  
      if (!matchPassword) {
        return res.status(400).json({ message: "Password not match" });
      }
  
      const token = jwt.sign(
        { c_roll: existingUser.c_roll, id: existingUser._id },
        SECRET_KEY,
        { expiresIn: "5h" }  // Token valid for 5 hours
      );
  
      res.status(201).json({message:"login successfull", user: existingUser, token: token });
  
    } catch (error) {
      console.error('Signin Error:', error);
      res.status(500).json({ error: error.message });
    }
  };


module.exports = { createTeacher, getAllTeachers , getTeacherById , updateTeacher, deleteTeacher , updateTeacherCourseByCRoll,logInTeacher};