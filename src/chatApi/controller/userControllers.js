const User = require("../models/userModel");

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


  module.exports = { registerUser,chatUser ,allUsers};