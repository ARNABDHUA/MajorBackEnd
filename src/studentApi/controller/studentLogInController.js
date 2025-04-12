const Student=require("../models/studentLogInModels");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");

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
    const updatedStudent = await Student.findOneAndUpdate(
      { email: email },
      {
        course_code,
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
      },
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
        payment: student.payment
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

    student.c_roll = c_roll;
    student.course_code = course_code; // optionally update course_code
    await student.save();

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
      payment: student.payment
    });

  } catch (error) {
    console.error("Roll Generation Error:", error);
    res.status(500).json({ error: error.message });
  }
};





module.exports = { singupStudents, singinStudents , addStudentAcademicDetails,generateCRoll};