const Student=require("../models/studentLogInModels");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");

const SECRET_KEY="helloApSfS";

const singupStudents = async (req, res) => {
  const { name, phoneNumber, email, password, address, pincode } = req.body;

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
      pincode: pincode
    });

    const token = jwt.sign(
      { email: result.email, id: result._id },
      SECRET_KEY,
      { expiresIn: "3h" }  // Token valid for 3 hours
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
      { expiresIn: "3h" }  // Token valid for 3 hours
    );

    res.status(201).json({ user: existingUser, token: token });

  } catch (error) {
    console.error('Signin Error:', error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = { singupStudents, singinStudents };