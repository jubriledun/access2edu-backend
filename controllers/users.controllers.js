import { validateLogin, validateSignup } from "../config/validation.js";
import userModel from "../model/userModel.js";
import jwt from "jsonwebtoken";
import transporter from "../utils/nodemailer.js";

export const Signup = async (req, res, next) => {
  const { error } = validateSignup(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    const error = new Error("User already exist. Please login");
    error.statusCode = 400;
    return next(error);
  }

  const user = await userModel.create({
    first_lastName,
    other_names,
    email,
    parent_guardian_name,
    password,
    confirmPassword,
  });

  const newUser = userModel.findById(user._id);
  if (!newUser) {
    const error = new Error("Account not created. Pleae try again");
    error.statusCode = 500;
    return next(error);
  }

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    message: "Account creation successful",
    newUser,
  });
};

export const Login = async (req, res, next) => {
  const { error } = validateLogin(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const user = await userModel.findOne({ email });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    return next(error);
  }

  const isMatch = await user.comparePassword(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid Credentials");
    error.statusCode = 401;
    return next(error);
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    user,
  });
};
