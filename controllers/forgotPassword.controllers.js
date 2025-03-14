import userModel from "../model/userModel.js";
import transporter from "../utils/nodemailer.js";

export const sendForgotPasswordOTP = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    const error = new Error("E-mail is required to continue");
    error.statusCode = 400;
    return next(error);
  }

  const user = await userModel.findOne({ email });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    return next(error);
  }

  const OTP = Math.floor(100_000 + Math.random() * 900_000).toString();
  user.forgotPasswordOTP = OTP;
  user.forgotPasswordOTPExpireAt = Date.now() + 15 * 60 * 1000;
  user.save();

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: user.email,
    subject: "Forgot Password OTP",
    text: `Your forgot password OTP is ${OTP}`,
  };

  await transporter.sendMail(mailOptions);

  res.status(200).json({
    success: true,
    message: "Forgot password OTP sent successfully to your E-mail address",
  });
};

export const forgotPassword = async (req, res, next) => {
  const { email, OTP, newPassword } = req.body;

  if (!email || !OTP || !newPassword) {
    const error = new Error("E-mail, OTP and new Password are required field");
    error.statusCode = 400;
    return next(error);
  }

  const user = await userModel.findOne({ email });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    return next(error);
  }

  if (user.forgotPasswordOTP === "" || user.forgotPasswordOTP !== OTP) {
    const error = new Error("Invalid OTP. Please try again");
    error.statusCode = 401;
    return next(error);
  }

  if (user.forgotPasswordOTPExpireAt < Date.now()) {
    const error = new Error("Expired OTP. Please try again");
    error.statusCode = 401;
    return next(error);
  }

  user.forgotPasswordOTP = "";
  user.forgotPasswordOTPExpireAt = Date.now();
  user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
};
