import jwt from "jsonwebtoken";
import adminModel from "../model/adminModel.js";
import studentModel from "../model/studentModel.js";

export const adminAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    const error = new Error("You are not authorized. Please login to continue");
    error.statusCode = 401;
    return next(error);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded || !decoded.id) {
    const error = new Error("Invalid token");
    error.statusCode = 401;
    return next(error);
  }
  const loggedInUser = await adminModel.findById(decoded.id);
  if (!loggedInUser) {
    const error = new Error("Invalid admin information");
    error.statusCode = 404;
    return next(error);
  }

  req.user = loggedInUser;
  next();
};

export const studentAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    const error = new Error("You are not authorized. Please login to continue");
    error.statusCode = 401;
    return next(error);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded || !decoded.id) {
    const error = new Error("Invalid token");
    error.statusCode = 401;
    return next(error);
  }
  const loggedInUser = await studentModel.findById(decoded.id);
  if (!loggedInUser) {
    const error = new Error("Invalid student information");
    error.statusCode = 404;
    return next(error);
  }

  req.user = loggedInUser;
  next();
};
