import jwt from "jsonwebtoken";
import userModel from "../model/userModel.js";

const userAuth = async (req, res, next) => {
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
  const loggedInUser = await userModel.findById(decoded.id);
  if (!loggedInUser) {
    const error = new Error("Invalid User information");
    error.statusCode = 404;
    return next(error);
  }

  req.user = loggedInUser;
  next();
};

export default userAuth;
