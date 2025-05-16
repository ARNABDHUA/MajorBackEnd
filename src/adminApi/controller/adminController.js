const Admin = require('../model/adminModel');
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");


const SECRET_KEY="helloArnab";

const createAdmin = async (req, res) => {
    try {
      const {
        name,
        phoneNumber,
        email
      } = req.body;
  
      const existingEmail = await Admin.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists!' });
      }

      const saltRounds = 10;
      const passData=`Data@${phoneNumber}`
      const hashedPassword = await bcrypt.hash(passData, saltRounds);
  
      
      const newAdmin = new Admin({
        name,
        phoneNumber,
        email,
        password: hashedPassword // save hashed password
      });
  
      await newAdmin.save();
  
      res.status(201).json({
        message: 'Admin created successfully',
        data: newAdmin
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const logInAdmin= async(req,res)=>{

    const { email, password } = req.body;
  
    try {
      const existingUser = await Admin.findOne({ email: email });
  
      if (!existingUser) {
        return res.status(404).json({ message: "Admin not found" });
      }
  
      const matchPassword = await bcrypt.compare(password, existingUser.password);
  
      if (!matchPassword) {
        return res.status(400).json({ message: "Password not match" });
      }
  
      const token = jwt.sign(
        { email: existingUser.email, id: existingUser._id },
        SECRET_KEY,
        { expiresIn: "5h" }  // Token valid for 5 hours
      );
  
      res.status(201).json({message:"login successfull", user: existingUser, token: token });
  
    } catch (error) {
      console.error('Signin Error:', error);
      res.status(500).json({ error: error.message });
    }
  };

module.exports={createAdmin,logInAdmin}