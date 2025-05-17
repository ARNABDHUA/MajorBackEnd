const Student=require("../models/studentLogInModels");
const CoursePaper= require('../../adminRoutineApi/models/paperCodeModel');
const User = require("../../chatApi/models/userModel");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const cloudinary =require("./cloudinary.js");
const fs = require("fs");
const emailotpsignup=require('../models/emailsender');
require("dotenv").config();

const { sendEmailService } = require("../Service/emailService");

const SECRET_KEY="helloApSfS";

const singupStudents = async (req, res) => {
  const { name, phoneNumber, email, password, address, pincode,gender,city,state } = req.body;

  try {
    const existingUser = await Student.findOne({ email: email });
    const existingUserPhone = await Student.findOne({ phoneNumber: phoneNumber });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (existingUserPhone) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await Student.create({
      name: name,
      phoneNumber: phoneNumber,
      email: email,
      password: hashedPassword,
      address: address,
      pincode: pincode,
      gender:gender,
      city:city,
      state:state
    });

    const token = jwt.sign(
      { email: result.email, id: result._id },
      SECRET_KEY,
      { expiresIn: "5h" }  // Token valid for 5 hours
    );

    res.status(201).json({ user: result, token: token });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: error.message });
  }
};


const singinStudents = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await Student.findOne({ email: email });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const matchPassword = await bcrypt.compare(password, existingUser.password);

    if (!matchPassword) {
      return res.status(400).json({ message: "Password not match" });
    }

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      SECRET_KEY,
      { expiresIn: "5h" }
    );

    const {
      name,
      email: userEmail,
      phoneNumber,
      c_roll,
      e_roll,
      address,
      state,
      city,
      pincode,
      gender,
      course_code,
      pic,
      payment,
      sem,
      paper_code,
      admit,
      submit,
      verify,
      select_offline,
      rejected,
      sem_payment
    } = existingUser;

    res.status(201).json({
      user: {
        name,
        email: userEmail,
        phoneNumber,
        c_roll,
        e_roll,
        address,
        state,
        city,
        pincode,
        gender,
        course_code,
        pic,
        payment,
        sem,
      paper_code,
      admit,
      submit,
      verify,
      select_offline,
      rejected,
      sem_payment
      },
      token,
    });

  } catch (error) {
    console.error('Signin Error:', error);
    res.status(500).json({ error: error.message });
  }
};


const addStudentAcademicDetails = async (req, res) => {
  const {
    email,
    course_code,
    select_offline,
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
    other_course_end,
    rank,
  } = req.body;

  try {
    const updateData = {
      course_code,
      select_offline,
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
      other_course_end,
      rank,
      submit:true
    };

    const fileFields = ['tenth_file', 'twelfth_marks_file', 'ug_marks_file', 'other_marks_file', 'rank_file'];
    
    for (const field of fileFields) {
      if (req.files && req.files[field]) {
        const file = req.files[field];
        
        // Validate file size (2MB limit)
        if (file.size > 2 * 1024 * 1024) {
          return res.status(400).json({ 
            message: `${field} exceeds the maximum file size of 2MB`
          });
        }
        
        // Validate file type (PDF only)
        if (!file.mimetype.includes('pdf')) {
          return res.status(400).json({
            message: `${field} must be a PDF file`
          });
        }
        
        try {
          // Upload to Cloudinary
          const cloudinaryResponse = await cloudinary.uploader.upload(
            file.tempFilePath,
            {
              resource_type: 'raw',
              folder: 'student_academic_documents',
              format: 'pdf'
            }
          );
          
          // Add the secure URL to update data
          updateData[field] = cloudinaryResponse.secure_url;
          
          // Clean up temp file
          fs.unlinkSync(file.tempFilePath);
        } catch (uploadError) {
          console.error(`Error uploading ${field}:`, uploadError);
          return res.status(500).json({ 
            message: `Error uploading ${field}`,
            error: uploadError.message 
          });
        }
      }
    }

    // Update student record with all data
    const updatedStudent = await Student.findOneAndUpdate(
      { email: email },
      updateData,
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Academic details updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: error.message });
  }
};


const generateCRoll = async (req, res) => {
  const { course_code, email } = req.body;

  try {
    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // If c_roll already exists
    if (student.c_roll) {
          // Find the course paper record
          const newSem=student.sem//add
          const coursePaper = await CoursePaper.findOne({ 
            course_code: course_code, 
            sem :newSem//add
          });
          const paperCodes = coursePaper.papers.map(paper => paper.paper_code);
      student.paper_code=paperCodes;
      student.sem=newSem;//add
      student.course_code=course_code;
      student.sem_payment=true;
      student.regular=true;
      student.payment=true;//add
      await student.save();
      return res.status(200).json({
        name: student.name,
        email: student.email,
        phoneNumber: student.phoneNumber,
        c_roll: student.c_roll,
        e_roll: student.e_roll,
        address: student.address,
        state: student.state,
        city: student.city,
        pincode: student.pincode,
        gender: student.gender,
        course_code: student.course_code,
        pic: student.pic,
        sem:student.sem,
        paper_code:student.paper_code,
        payment: student.payment,
        sem_payment:student.sem_payment,
        regular:student.regular
      });
    }

    const year = new Date().getFullYear().toString(); // e.g., "2025"
    const rollPrefix = `${course_code}${year}`;

    const regex = new RegExp(`^${rollPrefix}`);
    const lastStudent = await Student.findOne({ c_roll: { $regex: regex } })
      .sort({ c_roll: -1 });

    let newRollNumber = 1;

    if (lastStudent && lastStudent.c_roll) {
      const lastRoll = lastStudent.c_roll.slice(-4);
      newRollNumber = parseInt(lastRoll) + 1;
    }

    const paddedRoll = String(newRollNumber).padStart(4, '0');
    const c_roll = `${rollPrefix}${paddedRoll}`;

      // Find the course paper record
      const coursePaper = await CoursePaper.findOne({ 
        course_code: course_code, 
        sem :"1"
      });
      const paperCodes = coursePaper.papers.map(paper => paper.paper_code);

    student.paper_code=paperCodes;
    student.sem="1";
    student.payment= true;
    student.c_roll = c_roll;
    student.course_code = course_code; 
    student.sem_payment=true;
    student.regular=true;
    await student.save();

    const user = await User.findOne({ email });//add for chat user
    user.isteacher = true;
    user.isstudent=true;
    user.isvalide=true;
    await user.save();

    res.status(200).json({
      name: student.name,
      email: student.email,
      phoneNumber: student.phoneNumber,
      c_roll: student.c_roll,
      e_roll: student.e_roll,
      address: student.address,
      state: student.state,
      city: student.city,
      pincode: student.pincode,
      gender: student.gender,
      course_code: student.course_code,
      pic: student.pic,
      payment: student.payment,
      sem:student.sem,
      paper_code:student.paper_code,
      sem_payment:student.sem_payment,
      regular:student.regular
    });

  } catch (error) {
    console.error("Roll Generation Error:", error);
    res.status(500).json({ error: error.message });
  }
};


const updateStudentProfile = async (req, res) => {
  try {
    const { email, address, pincode, state, city } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required to find student" });
    }

    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Upload new profile image if provided
    if (req.files && req.files.image) {
      try {
        if (!cloudinary || !cloudinary.uploader) {
          throw new Error("Cloudinary configuration is missing or incorrect");
        }
        let message = '';
        // Extract the public_id from the existing image URL if possible
        let oldPublicId = null;
        if (student.pic && student.pic !== "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg") {
          // Try to extract public_id from URL
          const urlParts = student.pic.split('/');
          const filenamePart = urlParts[urlParts.length - 1];
          const publicIdParts = filenamePart.split('.');
          if (publicIdParts.length > 1) {
            oldPublicId = `students/profile_images/${publicIdParts[0]}`;
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
          folder: 'students/profile_images',
          resource_type: "image",
        });
        
        // Clean up the temp file
        fs.unlinkSync(req.files.image.tempFilePath);
        
        // Store only the URL as per your schema
        student.pic = result.secure_url;
        
        message += 'Profile image updated successfully. ';
      } catch (imageError) {
        console.error("Cloudinary upload error:", imageError);
        return res.status(400).json({ 
          message: 'Image upload failed.', 
          error: imageError.message 
        });
      }
    }

    // Update other fields if provided
    // if (name) student.name = name;
    if (address) student.address = address;
    if (state) student.state = state;
    if (city) student.city = city;
    if (pincode) student.pincode = pincode;

    await student.save();

    // Custom response
    const response = {
      name: student.name,
      email: student.email,
      phoneNumber: student.phoneNumber,
      c_roll: student.c_roll,
      e_roll: student.e_roll,
      address: student.address,
      state: student.state,
      city: student.city,
      pincode: student.pincode,
      gender: student.gender,
      course_code: student.course_code,
      pic: student.pic,
      payment: student.payment,
    };

    res.status(200).json({ message: "Student profile updated", student: response });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const sendEmailController = async (req, res) => {
  const { email } = req.body;
  let data="arnabdhua74@gmail.com"

  const check = await Student.findOne({ email });
  if (!check && email!==data) {
    try {
      let otp = await sendEmailService(email);
      // console.log("otppppppppppppp", otp);
  
      const test = await emailotpsignup.findOneAndUpdate(
        { email: email },      // filter
        { otp: otp },          // update
        { new: true, upsert: true } // important: upsert!
      );
  
      res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
      console.error(error); // log the real error for debugging
      res.status(500).json({ error: "Email sending failed" });
    }
  } else {
    res.status(400).json({ message: "Email already exists !!" });
  }
  
};

const sendForgetPassword = async (req, res) => {
  const { email } = req.body;

  const check = await Student.findOne({ email });
  if (check) {
    try {
      let otp = await sendEmailService(email);
      // console.log("otppppppppppppp", otp);
  
      const test = await emailotpsignup.findOneAndUpdate(
        { email: email },      // filter
        { otp: otp },          // update
        { new: true, upsert: true } // important: upsert!
      );
  
      res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
      console.error(error); // log the real error for debugging
      res.status(500).json({ error: "Email sending failed" });
    }
  } else {
    res.status(400).json({ message: "User not exists !!" });
  }
  
};

const signupOtpValidate = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find the record matching email and otp
    const record = await emailotpsignup.findOne({ email: email, otp: otp });

    if (!record) {
      return res.status(400).json({ success: false, message: "Invalid OTP!" });
    }

    // Check if OTP is expired
    const otpGeneratedTime = record.updatedAt;
    const currentTime = new Date();
    const differenceInMinutes = (currentTime - otpGeneratedTime) / (1000 * 60); // milliseconds to minutes

    if (differenceInMinutes > 10) {
      return res.status(400).json({ success: false, message: "Your OTP has expired. Please request a new one." });
    }

    // If OTP is valid and not expired
    return res.status(200).json({ success: true, message: "OTP verified successfully!" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error during OTP verification!" });
  }
};

const applyStudents=async(req,res)=>{
  const {course_code}=req.body
  try{
    const record = await Student.find({ course_code: course_code,submit:true, c_roll: null,rejected:false });
    if (!record) {
      return res.status(400).json({ success: false, message: "new student not found" });
    }
    return res.status(200).json({ success: true, message: "course_code data found" ,data:record});

  } catch (error) {
  console.error(error);
  return res.status(500).json({ success: false, message: "Server error applycation!" });
}
}
 const vaidateStudent=async(req,res)=>{
  const {email}=req.body
  try{
    const record = await Student.findOneAndUpdate(
      { email: email },      
      { verify:true },          // update
      { new: true, } // important: upsert!
    )
    if (!record) {
      return res.status(400).json({ success: false, message: "new student not found" });
    }
    return res.status(200).json({ success: true, message: "verify the student" ,data:record});

  } catch (error) {
  console.error(error);
  return res.status(500).json({ success: false, message: "Server error applycation!" });
}
 }

 const rejected= async(req,res)=>{
  const {email}=req.body
  try{
  const verifyStudent= await Student.findOne({email:email,verify:true});
  if(verifyStudent){
    return res.status(400).json({ success: false, message: "new student already verify.Reject not possible !!" });
  }
    const record = await Student.findOneAndUpdate(
      { email: email },      
      { rejected:true },          // update
      { new: true, } // important: upsert!
    )
    if (!record) {
      return res.status(400).json({ success: false, message: "new student not found" });
    }
    return res.status(200).json({ success: true, message: "Rejected the student" ,data:record});

  } catch (error) {
  console.error(error);
  return res.status(500).json({ success: false, message: "Server error applycation!" });
}

 }

 const verifyApplyStudentsList=async(req,res)=>{
  const {course_code}=req.body
  try{
    const record = await Student.find({ course_code: course_code,submit:true, c_roll: null,rejected:false,verify:true });
    if (!record) {
      return res.status(400).json({ success: false, message: "new student not found" });
    }
    return res.status(200).json({ success: true, message: " verify student list found" ,data:record});

  } catch (error) {
  console.error(error);
  return res.status(500).json({ success: false, message: "Server error applycation!" });
}
}

const regularOfflineStudentsList=async(req,res)=>{
  const {course_code}=req.body
  try{
    const record = await Student.find({ course_code: course_code,submit:true,rejected:false,verify:true,select_offline:true ,regular:true});
    if (!record) {
      return res.status(400).json({ success: false, message: "new student not found" });
    }
    return res.status(200).json({ success: true, message: "new regular student list found" ,data:record});

  } catch (error) {
  console.error(error);
  return res.status(500).json({ success: false, message: "Server error applycation!" });
}
}

const regularOnlineStudentsList=async(req,res)=>{
  const {course_code}=req.body
  try{
    const record = await Student.find({ course_code: course_code,submit:true,rejected:false,verify:true,select_offline:false ,regular:true});
    if (!record) {
      return res.status(400).json({ success: false, message: "new student not found" });
    }
    return res.status(200).json({ success: true, message: "new regular student list found" ,data:record});

  } catch (error) {
  console.error(error);
  return res.status(500).json({ success: false, message: "Server error applycation!" });
}
}

const regularOnlineStudentsListDueSemPayment=async(req,res)=>{
  const {course_code}=req.body
  try{
    const record = await Student.find({ course_code: course_code,submit:true, payment: true,
      sem_payment:false,rejected:false,verify:true,select_offline:false ,regular:true});
    if (!record) {
      return res.status(400).json({ success: false, message: "new student not found" });
    }
    return res.status(200).json({ success: true, message: "new regular student list found" ,data:record});

  } catch (error) {
  console.error(error);
  return res.status(500).json({ success: false, message: "Server error applycation!" });
}
}

const regularOfflineStudentsListDueSemPayment=async(req,res)=>{
  const {course_code}=req.body
  try{
    const record = await Student.find({ course_code: course_code,submit:true, payment: true,
      sem_payment:false,rejected:false,verify:true,select_offline:true ,regular:true});
    if (!record) {
      return res.status(400).json({ success: false, message: "new student not found" });
    }
    return res.status(200).json({ success: true, message: "new regular student list found" ,data:record});

  } catch (error) {
  console.error(error);
  return res.status(500).json({ success: false, message: "Server error applycation!" });
}
}
const regularOfflineStudentsListDueSemPaymentReject=async(req,res)=>{
  const {email}=req.body
  try{
    const records = await Student.findOne({ email:email,sem_payment:false});
    if (!records) {
      return res.status(400).json({ success: false, message: " student not found" });
    }

    const record = await Student.findOneAndUpdate(
      { email: email },      
      { payment:false },          // update
      { new: true, } // important: upsert!
    )
    if (!record) {
      return res.status(400).json({ success: false, message: "new student not found" });
    }
    return res.status(200).json({ success: true, message: "Access restricted student" ,data:record});


  } catch (error) {
  console.error(error);
  return res.status(500).json({ success: false, message: "Server error applycation!" });
}
}

const getAllStudent=async(req,res)=>{
  const {course_code,sem}=req.body
  try{
    const records = await Student.find({ course_code:course_code,sem:sem,payment:true});
    if (!records) {
      return res.status(400).json({ success: false, message: " student not found" });
    }
    return res.status(200).json({ success: true,length:records.length ,message: "all student data" ,data:records});

  } catch (error) {
  console.error(error);
  return res.status(500).json({ success: false, message: "Server error applycation!" });
}
};

const upgradeStudent = async (req, res) => {
  try {
    const { course_code, sem } = req.body;
    
    // Validate input
    if (!course_code || !sem) {
      return res.status(400).json({ 
        success: false, 
        message: "Both course_code and sem are required" 
      });
    }

    const currentSem = String(sem);
    const newSem = String(Number(sem) + 1);
    
    // Find students in the current semester with the given course code
    const studentsToUpdate = await Student.find({ 
      course_code: course_code, 
      sem: currentSem 
    });
    
    if (studentsToUpdate.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No students found in the specified course and semester" 
      });
    }
    
    // Get the paper data for the next semester
    const nextSemPaperData = await CoursePaper.findOne({
      course_code: course_code,
      sem: newSem
    });
    
    if (!nextSemPaperData || !nextSemPaperData.papers || nextSemPaperData.papers.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No paper codes found for the next semester. Course may be completed." 
      });
    }
    
    const newPaperCodes = nextSemPaperData.papers.map(paper => paper.paper_code);
    
    // console.log(`Upgrading students from semester ${currentSem} to ${newSem}`);
    // console.log(`New paper codes: `, newPaperCodes);
    
   
    const result = await Student.updateMany(
      { course_code: course_code, sem: currentSem },
      { 
        $set: { 
          sem: newSem,
          paper_code: newPaperCodes,
           sem_payment:false
        } 
      }
    );
    
    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} student(s) updated from semester ${currentSem} to ${newSem}`,
      details: {
        previousSemester: currentSem,
        newSemester: newSem,
        updatedPaperCodes: newPaperCodes
      }
    });
    
  } catch (error) {
    console.error('Error upgrading students:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while upgrading students.',
      error: error.message
    });
  }
};

const sendEmailResetPassOtp = async (req, res) => {
  const { email ,phoneNumber} = req.body;
  // let data="arnabdhua74@gmail.com"

  const check = await Student.findOne({ email:email,phoneNumber:phoneNumber });
  if (check ) {
    try {
      let otp = await sendEmailService(email);
      // console.log("otppppppppppppp", otp);
  
      const test = await emailotpsignup.findOneAndUpdate(
        { email: email },      // filter
        { otp: otp },          // update
        { new: true, upsert: true } // important: upsert!
      );
  
      res.status(200).json({ message: "OTP send to your mail" });
    } catch (error) {
      console.error(error); // log the real error for debugging
      res.status(500).json({ error: "Email otp sending failed" });
    }
  } else {
    res.status(400).json({ message: "User not exists !!" });
  }
  
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validate input
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required.' });
    }

    // Find the student by email
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the student's password
    student.password = hashedPassword;
    await student.save();

    return res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = { singupStudents, singinStudents , addStudentAcademicDetails,generateCRoll,updateStudentProfile,sendEmailController,signupOtpValidate,sendForgetPassword,applyStudents,vaidateStudent,rejected,verifyApplyStudentsList,regularOfflineStudentsList,regularOnlineStudentsList,regularOnlineStudentsListDueSemPayment,regularOfflineStudentsListDueSemPayment,regularOfflineStudentsListDueSemPaymentReject,getAllStudent,upgradeStudent,sendEmailResetPassOtp,resetPassword };