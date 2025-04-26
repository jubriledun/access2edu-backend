import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  secure: false, // Use true for port 465, false for port 587
});

const mailOptions = {
  from: process.env.SMTP_USER,
  to: "recipient@example.com", // Replace with the recipient's email
  subject: "Test Email",
  text: "This is a test email sent from Access2Edu backend.",
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Error sending email:", error);
  } else {
    console.log("Email sent successfully:", info.response);
  }
});