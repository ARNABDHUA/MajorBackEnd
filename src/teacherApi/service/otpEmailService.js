const nodemailer = require("nodemailer");
require("dotenv").config();
// Generate a random 4-digit OTP
const generateOTP = () => {
  // Generate a random number between 1000 and 9999
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const sendEmailServices = async (receiverEmail) => {
  // Generate the OTP
  const otp = generateOTP();

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ecollege.helper@gmail.com",
      pass: process.env.PASS_DATA,
    },
  });

  await transporter.sendMail({
    from: '"E-college" <ecollege.helper@gmail.com>',
    to: receiverEmail,
    subject: "Your OTP Verification Code",
    text: `Your OTP verification code is: ${otp} for ecollege Sign up. This code will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">E-college Sign up OTP</h2>
        <p>Your one-time password (OTP) is:</p>
        <h1 style="background-color: #f2f2f2; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p style="color: #777; font-size: 12px; margin-top: 20px;">Check Out our website:
        { https://e-college-nu.vercel.app }.</p>
        <p style="color: #777; font-size: 12px; margin-top: 20px;">This is an automated message, please do not reply to this email.</p>
        
      </div>
    `,
  });

  // Return the OTP so it can be stored and verified later
  return otp;
};

module.exports = { sendEmailServices, generateOTP };