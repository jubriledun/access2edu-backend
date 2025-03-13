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
    return next(new Error(401, "User already exist. Please Login"));
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
    return next(new Error(500, "Error while signup"));
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
    return next(new Error(404, "User Not found"));
  }

  const isMatch = await user.comparePassword(password, user.password);
  if (!isMatch) {
    return next(new Error("Invalid Credentials"));
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
