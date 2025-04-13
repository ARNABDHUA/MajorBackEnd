const User = require("../models/userModel");
const cloudinary =require("./cloudinary.js");
const fs = require("fs");

const registerUser = async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
       return res.status(400).json({ message: "Please Enter all the Fields" })
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            name,
            email,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
            });
        } else {
            res.status(400);
            throw new Error("User not created");
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const chatUser = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if (user) {
            return res.status(200).json({user});
        }
        else {
            return res.status(400).json({message:"User Not Found"});
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const allUsers = async (req, res) => {
    const {useId}=req.body;
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};
  
    const users = await User.find(keyword).find({ _id: { $ne: useId } });
    res.send(users);
  };

  const updateUserImage = async (req, res) => {
    try {
      const { email } = req.body;
  
      // Check required fields
      if (!email || !req.files || !req.files.image) {
        return res.status(400).json({ error: "Email and image are required" });
      }
  
      // Upload image to Cloudinary
      const imageResult = await cloudinary.uploader.upload(
        req.files.image.tempFilePath,
        {
          folder: "users/profile_images",
          resource_type: "image",
        }
      );
  
      // Delete temp file
      fs.unlinkSync(req.files.image.tempFilePath);
  
      // Find user by email and update pic
      const updatedUser = await User.findOneAndUpdate(
        { email },
        { pic: imageResult.secure_url },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res
        .status(200)
        .json({ message: "Profile picture updated", user: updatedUser });
    } catch (error) {
      console.error("Error updating user image:", error);
      res.status(500).json({ error: "Server error" });
    }
  };

  module.exports = { registerUser,chatUser ,allUsers,updateUserImage};