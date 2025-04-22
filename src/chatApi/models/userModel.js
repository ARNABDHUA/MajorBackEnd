const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      pic: {
        type: String,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
      },
      isAdmin: {
        type: Boolean,
        required: true,
        default: false,
      },
      isteacher: {
        type: Boolean,
        default: false,
      },
      c_roll: {
        type: String, default: null
      },
    },
    { timestamps: true }
  );
  

const User = mongoose.model("User", userSchema);

module.exports = User;
