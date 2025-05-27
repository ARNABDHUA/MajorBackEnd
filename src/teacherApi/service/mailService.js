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

const sendInterviewEmailService = async (receiverEmail, name) => {
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
    subject: "Interview Invitation - E-college Teaching Position",
    text: `Congratulations ${name}! You are shortlisted for interview.
    
We are pleased to inform you that you have been shortlisted for the teaching position at E-college. Please ensure you report to the following location on the scheduled date:

Address: EM-4/1, Sector-V, Salt Lake, Kolkata – 700091

Documents to Carry:
- All mark sheets starting from 10th grade up to your most recent degree
- Updated resume
- Valid ID proof

We look forward to meeting you!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Interview Invitation - E-college</h2>
        <p>Congratulations <strong>${name}</strong>! You are shortlisted for interview.</p>
        
        <p>We are pleased to inform you that you have been shortlisted for the teaching position at E-college. Please ensure you report to the following location on the scheduled date:</p>
        
        <div style="background-color: #f2f2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Interview Details</h3>
          <p><strong>Address:</strong> EM-4/1, Sector-V, Salt Lake, Kolkata – 700091</p>
          <p><strong>Interview Date:</strong> 28-05-2025 (Tomorrow)</p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="margin-top: 0; color: #333;">Documents to Carry</h3>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>All mark sheets starting from 10th grade up to your most recent degree</li>
            <li>Updated resume</li>
            <li>Valid ID proof</li>
          </ul>
        </div>
        
        <p>We look forward to meeting you!</p>
        
        <p style="color: #777; font-size: 12px; margin-top: 20px;">Check out our website:
        <a href="https://e-college-nu.vercel.app">https://e-college-nu.vercel.app</a>.</p>
        <p style="color: #777; font-size: 12px;">If you have any questions, please contact our support team.</p>
      </div>
    `,
  });

  // Return success message
  return { success: true, message: "Interview invitation email sent successfully" };
};

const sendRejectEmailService = async (receiverEmail, name) => {
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
    subject: "Thank You for Your Interest - E-college Teaching Position",
    text: `Dear ${name},

Thank you for your interest in the teaching position at E-college and for taking the time to submit your application.

After careful consideration of all applications, we regret to inform you that we have decided not to move forward with your application at this time. This decision was not easy, as we received many qualified applications.

We encourage you to continue pursuing opportunities that align with your skills and interests. We will keep your application on file and may reach out if suitable positions become available in the future.

Thank you again for considering E-college as a potential employer. We wish you the best of luck in your job search and future endeavors.

Best regards,
E-college Recruitment Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Application Status Update - E-college</h2>
        <p>Dear <strong>${name}</strong>,</p>
        
        <p>Thank you for your interest in the teaching position at E-college and for taking the time to submit your application.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #6c757d;">
          <p>After careful consideration of all applications, we regret to inform you that we have decided not to move forward with your application at this time. This decision was not easy, as we received many qualified applications.</p>
        </div>
        
        <p>We encourage you to continue pursuing opportunities that align with your skills and interests. We will keep your application on file and may reach out if suitable positions become available in the future.</p>
        
        <p>Thank you again for considering E-college as a potential employer. We wish you the best of luck in your job search and future endeavors.</p>
        
        <p style="margin-top: 30px;"><strong>Best regards,</strong><br>
        E-college Recruitment Team</p>
        
        <p style="color: #777; font-size: 12px; margin-top: 20px;">Visit our website:
        <a href="https://e-college-nu.vercel.app">https://e-college-nu.vercel.app</a></p>
        <p style="color: #777; font-size: 12px;">If you have any questions, please contact our support team.</p>
      </div>
    `,
  });

  // Return success message
  return { success: true, message: "Rejection email sent successfully" };
};
module.exports = { sendEmailService ,sendInterviewEmailService,sendRejectEmailService};