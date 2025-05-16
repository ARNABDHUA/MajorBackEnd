const Teacher = require('../models/teacherModel');
const Applyteacher=require('../models/applyteacher');
const chat=require('../../chatApi/models/userModel');
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const cloudinary =require("./cloudinary.js");
const fs = require("fs");

const SECRET_KEY="helloArnab";

const createTeacher = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      email// get password from request body
    } = req.body;

    const existingEmail = await Teacher.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists!' });
    }
    const existingEmailInApply = await Applyteacher.findOne({ email:email,verify:true, rejected:false});
    if(! existingEmailInApply){
      return res.status(400).json({ message: 'Teacher is not verify' });
    }

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

    const existingCRoll = await Teacher.findOne({ c_roll });
    if (existingCRoll) {
      return res.status(400).json({ message: 'c_roll already exists! Please try again.' });
    }

    
    const saltRounds = 10;
    const passData=`Data@${phoneNumber}`
    const hashedPassword = await bcrypt.hash(passData, saltRounds);

    
    const newTeacher = new Teacher({
      name,
      c_roll, // using generated c_roll
      phoneNumber,
      email,
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

// Get All Teachers by course_code
const getAllTeachersByCourseCode = async (req, res) => {
  const{course_code}=req.body
  try {
    const teachers = await Teacher.find({course_code});
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

    // Find the teacher first
    const teacher = await Teacher.findOne({ c_roll: c_roll });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const updates = {};
    let message = ''; // Store any messages to send back

    // Optional fields to update
    if (phoneNumber) updates.phoneNumber = phoneNumber;

    // Qualification handling
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

    // Expertise handling (assuming it's an array now)
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
    
    // Handle image upload with Cloudinary if file is present
    if (req.files && req.files.image) {
      try {
        if (!cloudinary || !cloudinary.uploader) {
          throw new Error("Cloudinary configuration is missing or incorrect");
        }
        
        // Extract the public_id from the existing image URL if possible
        // This is a basic extraction and might need adjustment based on your URL structure
        let oldPublicId = null;
        if (teacher.image && teacher.image !== "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg") {
          // Try to extract public_id from URL
          const urlParts = teacher.image.split('/');
          const filenamePart = urlParts[urlParts.length - 1];
          const publicIdParts = filenamePart.split('.');
          if (publicIdParts.length > 1) {
            oldPublicId = `teachers/profile_images/${publicIdParts[0]}`;
          }
        }
        
        // Delete the old image if we could extract a public_id
        if (oldPublicId) {
          try {
            await cloudinary.uploader.destroy(oldPublicId);
          } catch (deleteError) {
            console.log("Failed to delete old image, continuing with upload:", deleteError.message);
            // Continue even if deletion fails
          }
        }
        
        // Upload new image to Cloudinary
        const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
          folder: 'teachers/profile_images',
          resource_type: "image",
        });
        
        // Clean up the temp file
        fs.unlinkSync(req.files.image.tempFilePath);
        
        // Store only the URL as per your schema
        updates.image = result.secure_url;
        
        message += 'Profile image updated successfully. ';
      } catch (imageError) {
        console.error("Cloudinary upload error:", imageError);
        return res.status(400).json({ 
          message: 'Image upload failed.', 
          error: imageError.message 
        });
      }
    }

    // If there are no updates, don't proceed
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
    console.error("Update teacher error:", error);
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

  const removeQualification = async (req, res) => {
    try {
      const { c_roll } = req.params;
      const { degree, expertise } = req.body;
  
      // Validate input
      if (!degree && !expertise) {
        return res.status(400).json({ 
          message: 'Either degree or expertise must be provided to remove data.' 
        });
      }
  
      // Find the teacher first
      const teacher = await Teacher.findOne({ c_roll: c_roll });
  
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
  
      let updateOperation = {};
      let message = '';
  
      // Handle qualification removal
      if (degree) {
        // Check if the qualification exists
        const qualificationExists = teacher.qualification.some(
          (qual) => qual.degree.toLowerCase() === degree.toLowerCase()
        );
  
        if (!qualificationExists) {
          return res.status(404).json({ message: 'Qualification with this degree not found.' });
        }
  
        updateOperation = {
          $pull: { 
            qualification: { 
              degree: { $regex: new RegExp(`^${degree}$`, 'i') } 
            } 
          }
        };
        message = 'Qualification removed successfully!';
      }
  
      // Handle expertise removal
      if (expertise) {
        // Check if the expertise exists
        const expertiseExists = teacher.expertise.some(
          (exp) => exp.toLowerCase() === expertise.toLowerCase()
        );
  
        if (!expertiseExists) {
          return res.status(404).json({ message: 'Expertise not found.' });
        }
  
        updateOperation = {
          $pull: { 
            expertise: { $regex: new RegExp(`^${expertise}$`, 'i') } 
          }
        };
        message = 'Expertise removed successfully!';
      }
  
      // If both degree and expertise are provided, handle both
      if (degree && expertise) {
        updateOperation = {
          $pull: { 
            qualification: { 
              degree: { $regex: new RegExp(`^${degree}$`, 'i') } 
            },
            expertise: { $regex: new RegExp(`^${expertise}$`, 'i') }
          }
        };
        message = 'Qualification and expertise removed successfully!';
      }
  
      const updatedTeacher = await Teacher.findOneAndUpdate(
        { c_roll: c_roll },
        updateOperation,
        { new: true }
      );
  
      res.status(200).json({
        message,
        data: updatedTeacher
      });
  
    } catch (error) {
      console.error("Error removing teacher data:", error);
      res.status(500).json({ message: error.message });
    }
  };

  const updateTeacherCourseCode = async (req, res) => {
    try {
      const { c_roll, courseCodes } = req.body;
      
      // Validate inputs
      if (!c_roll) {
        return res.status(400).json({ success: false, message: 'Teacher c_roll is required' });
      }
      
      if (!courseCodes || !Array.isArray(courseCodes)) {
        return res.status(400).json({ success: false, message: 'courseCodes must be an array' });
      }
      const teacher = await Teacher.findOne({ c_roll });
      
      if (!teacher) {
        return res.status(404).json({ success: false, message: `Teacher with c_roll ${c_roll} not found` });
      }

    
        // teacher.course_code = courseCodes;
       
        // Add new course codes while avoiding duplicates
        courseCodes.forEach(code => {
          if (!teacher.course_code.includes(code)) {
            teacher.course_code.push(code);
          }
        });
    
      const updatedTeacher = await teacher.save();
      return res.status(200).json({
        success: true,
        message: 'Teacher course codes updated successfully',
        data: updatedTeacher
      });
      
    } catch (error) {
      console.error('Error updating teacher course codes:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update teacher course codes',
        error: error.message
      });
    }
  };
  

const makeTeacherHOD = async (req, res) => {
  try {
    const { c_roll,course_code } = req.body;
    
    if (!c_roll) {
      return res.status(400).json({ success: false, message: "c_roll is required" });
    }
    
    const hodCheck=await Teacher.findOne({course_code :course_code,hod:true})
    if(hodCheck){
      return res.status(404).json({ success: false, message: `Teacher ${hodCheck.name} is already Hod for the course_code ${course_code}` });
    }
    const updatedTeacher = await Teacher.findOneAndUpdate(
      { c_roll },
      { hod: true },
      { new: true }
    );
    
    if (!updatedTeacher) {
      return res.status(404).json({ success: false, message: "Teacher not found with this c_roll" });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: "Teacher successfully appointed as HOD", 
      data: updatedTeacher 
    });
    
  } catch (error) {
    console.error("Error making teacher HOD:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    });
  }
};

const applyTeacher = async (req, res) => {
  try {
    // Extract teacher data from request body
    const {
      name,
      phoneNumber,
      email,
      address,
      tenth_marks,
      tenth_year,
      twelfth_marks,
      twelfth_year,
      ug_name,
      ug_marks,
      ug_start,
      ug_end,
      other_course,
      other_course_marks,
      other_course_start,
      other_course_end
    } = req.body;

    // Validate required fields
    if (!name || !phoneNumber || !email ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, phoneNumber and email"
      });
    }

    // Check if email already exists
    const existing = await chat.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: " This email already exists"
      });
    }
    const existingTeacher = await Applyteacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: " This email already exists "
      });
    }
    const existingphone = await Applyteacher.findOne({ phoneNumber });
    if (existingphone) {
      return res.status(400).json({
        success: false,
        message: " This phoneNumber already exists "
      });
    }

    // Initialize teacher data
    const teacherData = {
      name,
      phoneNumber,
      email,
      address,
      tenth_marks: tenth_marks || null,
      tenth_year: tenth_year || null,
      twelfth_marks: twelfth_marks || null,
      twelfth_year: twelfth_year || null,
      ug_name: ug_name || null,
      ug_marks: ug_marks || null,
      ug_start: ug_start || null,
      ug_end: ug_end || null,
      other_course: other_course || null,
      other_course_marks: other_course_marks || null,
      other_course_start: other_course_start || null,
      other_course_end: other_course_end || null,
      submit:true
    };

    // Handle CV file upload if present
    if (req.files && req.files.cv_file) {
      const uploadedFile = req.files.cv_file;
      const fileType = uploadedFile.mimetype;
      
      // Validate file type (PDF only)
      if (!fileType.includes('pdf')) {
        return res.status(400).json({
          success: false,
          message: "Please upload CV in PDF format only"
        });
      }

      // Determine resource type based on file type
      const resourceType = fileType.includes('pdf') ? 'raw' : 'image';
      
      // Upload file to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(
        uploadedFile.tempFilePath, 
        {
          resource_type: resourceType,
          folder: "teacher_cvs" // Keeping original folder for teacher CVs
        }
      );
      
      // Clean up the temporary file
      const fs = require('fs');
      fs.unlinkSync(uploadedFile.tempFilePath);
      
      // Add Cloudinary URL to teacher data
      teacherData.cv_file = cloudinaryResponse.secure_url;
    }

    // Create new teacher application
    const newTeacher = await Applyteacher.create(teacherData);

    return res.status(201).json({
      success: true,
      message: "Teacher application submitted successfully",
      data: newTeacher
    });
  } catch (error) {
    console.error("Error making apply teach:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    });
  }
};

const applyTeacherCheck=async(req,res)=>{
  try{
  const {phoneNumber,email}=req.body;
  const exist = await Applyteacher.findOne({ email,phoneNumber });
  if (!exist) {
    return res.status(400).json({
      success:false,
      message: " User not found"
    });
  }
  
  return res.status(201).json({
    success: true,
    message: "Teacher application fatch successfully",
    data: exist
  });
  }catch (error) {
    console.error("Error making apply fatch teach:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    });
  }


}

const vaidateTeacher=async(req,res)=>{
  const {email}=req.body
  try{
    const record = await Applyteacher.findOneAndUpdate(
      { email: email },      
      { verify:true },          // update
      { new: true, } 
    )
    if (!record) {
      return res.status(400).json({ success: false, message: "new Teacher not found" });
    }
    return res.status(200).json({ success: true, message: "verify the Teacher" ,data:record});

  } catch (error) {
  console.error(error);
  return res.status(500).json({ success: false, message: "Server error applycation!" });
}
 }

 const rejected= async(req,res)=>{
  const {email}=req.body
  try{
    const record = await Applyteacher.findOneAndUpdate(
      { email: email },      
      { $set: { rejected: true, verify: false } },         // update
      { new: true, } 
    )
    if (!record) {
      return res.status(400).json({ success: false, message: "new Teacher not found" });
    }
    return res.status(200).json({ success: true, message: "Rejected the Teacher" ,data:record});

  } catch (error) {
  console.error(error);
  return res.status(500).json({ success: false, message: "Server error applycation!" });
}

 }

 const teacherNotSelected= async(req,res)=>{
  const {email}=req.body
  try{
    const record = await Applyteacher.findOneAndUpdate(
      { email: email ,verify:true},      
      { not_selected:true },          // update
      { new: true, } 
    )
    if (!record) {
      return res.status(400).json({ success: false, message: "new Teacher not found" });
    }
    return res.status(200).json({ success: true, message: " The Teacher was not selected" ,data:record});

  } catch (error) {
  console.error(error);
  return res.status(500).json({ success: false, message: "Server error applycation!" });
}

 }


 const applyTeacherData=async(req,res)=>{
  try{
    const record = await Applyteacher.find({submit:true,rejected:false });
    if (!record) {
      return res.status(400).json({ success: false, message: "new Teacher not found" });
    }
    return res.status(200).json({ success: true, message: "apply teacher data found" ,data:record});

  } catch (error) {
  console.error(error);
  return res.status(500).json({ success: false, message: "Server error applycation!" });
}
}

const paymentUpdate = async (req, res) => {
  try {
    const{c_roll,salary}=req.body;
    const teacher = await Teacher.findOne({c_roll});
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

const record = await Teacher.findOneAndUpdate(
      { c_roll: c_roll },      
      { salary:salary },          // update
      { new: true, } // important: upsert!
    )
    if (!record) {
      return res.status(400).json({ success: false, message: "Teacher data not found" });
    }
    return res.status(200).json({ success: true, message: "Salary update" ,data:record});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createTeacher, getAllTeachers , getTeacherById , updateTeacher, deleteTeacher , updateTeacherCourseByCRoll,logInTeacher,removeQualification,updateTeacherCourseCode,makeTeacherHOD,getAllTeachersByCourseCode,applyTeacher ,applyTeacherCheck,vaidateTeacher,rejected,applyTeacherData,paymentUpdate};