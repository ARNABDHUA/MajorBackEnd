const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmailService = async (receiverEmail, name, teach_id, password) => {
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
    subject: "Welcome to E-college Teaching Team",
    text: `Congratulations ${name}! You are selected as a teacher. We are happy to join you in our team (E-college).
    
    Your Credentials:
    Name: ${name}
    Teacher ID: ${teach_id}
    Password: ${password}
    
    Please use these credentials to log in to our system.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Welcome to E-college!</h2>
        <p>Congratulations <strong>${name}</strong>! You are selected as a teacher. We are happy to join you in our team (E-college).</p>
        
        <div style="background-color: #f2f2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Your Credentials</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Teacher ID:</strong> ${teach_id}</p>
          <p><strong>Password:</strong> ${password}</p>
        </div>
        
        <p>Please use these credentials to log in to our system.</p>
        <p>We look forward to your valuable contribution!</p>
        
        <p style="color: #777; font-size: 12px; margin-top: 20px;">Check out our website:
        <a href="https://e-college-nu.vercel.app">https://e-college-nu.vercel.app</a>.</p>
        <p style="color: #777; font-size: 12px;">If you have any questions, please contact our support team.</p>
      </div>
    `,
  });

  // Return success message
  return { success: true, message: "Welcome email sent successfully" };
};

module.exports = { sendEmailService };