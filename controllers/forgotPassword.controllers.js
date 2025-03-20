import adminModel from "../model/adminModel.js";
import transporter from "../utils/nodemailer.js";
import studentModel from "../model/studentModel.js";

export const sendForgotPasswordOTPAdmin = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    const error = new Error("E-mail is required to continue");
    error.statusCode = 400;
    return next(error);
  }

  const admin = await adminModel.findOne({ email });
  if (!admin) {
    const error = new Error("Admin not found");
    error.statusCode = 404;
    return next(error);
  }

  const OTP = Math.floor(100_000 + Math.random() * 900_000).toString();
  admin.forgotPasswordOTP = OTP;
  admin.forgotPasswordOTPExpireAt = Date.now() + 15 * 60 * 1000;
  admin.save();

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: admin.email,
    subject: "Forgot Password OTP",
    text: `Your forgot password OTP is ${OTP}`,
  };

  await transporter.sendMail(mailOptions);

  res.status(200).json({
    success: true,
    message: "Forgot password OTP sent successfully to your E-mail address",
  });
};

export const forgotPasswordAdmin = async (req, res, next) => {
  const { email, OTP, newPassword } = req.body;

  if (!email || !OTP || !newPassword) {
    const error = new Error("E-mail, OTP and new Password are required field");
    error.statusCode = 400;
    return next(error);
  }

  const admin = await adminModel.findOne({ email });
  if (!admin) {
    const error = new Error("Admin not found");
    error.statusCode = 404;
    return next(error);
  }

  if (admin.forgotPasswordOTP === "" || admin.forgotPasswordOTP !== OTP) {
    const error = new Error("Invalid OTP. Please try again");
    error.statusCode = 401;
    return next(error);
  }

  if (admin.forgotPasswordOTPExpireAt < Date.now()) {
    const error = new Error("Expired OTP. Please try again");
    error.statusCode = 401;
    return next(error);
  }

  admin.forgotPasswordOTP = "";
  admin.forgotPasswordOTPExpireAt = Date.now();
  admin.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
};

export const sendForgotPasswordOTPStudent = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    const error = new Error("E-mail is required to continue");
    error.statusCode = 400;
    return next(error);
  }

  const student = await studentModel.findOne({ email });
  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    return next(error);
  }

  const OTP = Math.floor(100_000 + Math.random() * 900_000).toString();
  student.forgotPasswordOTP = OTP;
  student.forgotPasswordOTPExpireAt = Date.now() + 15 * 60 * 1000;
  student.save();

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: student.email,
    subject: "Forgot Password OTP",
    text: `Your forgot password OTP is ${OTP}`,
  };

  await transporter.sendMail(mailOptions);

  res.status(200).json({
    success: true,
    message: "Forgot password OTP sent successfully to your E-mail address",
  });
};

export const forgotPasswordStudent = async (req, res, next) => {
  const { email, OTP, newPassword } = req.body;

  if (!email || !OTP || !newPassword) {
    const error = new Error("E-mail, OTP and new Password are required field");
    error.statusCode = 400;
    return next(error);
  }

  const student = await studentModel.findOne({ email });
  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    return next(error);
  }

  if (student.forgotPasswordOTP === "" || student.forgotPasswordOTP !== OTP) {
    const error = new Error("Invalid OTP. Please try again");
    error.statusCode = 401;
    return next(error);
  }

  if (student.forgotPasswordOTPExpireAt < Date.now()) {
    const error = new Error("Expired OTP. Please try again");
    error.statusCode = 401;
    return next(error);
  }

  student.forgotPasswordOTP = "";
  student.forgotPasswordOTPExpireAt = Date.now();
  student.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
};
