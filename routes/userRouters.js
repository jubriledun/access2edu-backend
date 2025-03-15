import { Router } from "express";
import upload from "../config/multer.js";
import { Login, Signup } from "../controllers/users.controllers.js";
import {
  forgotPassword,
  sendForgotPasswordOTP,
} from "../controllers/forgotPassword.controllers.js";

const userRouter = Router();

userRouter.post("/signup", upload.single("profilePicture"), Signup);
userRouter.post("/login", Login);
userRouter.post("/forgot_password_otp", sendForgotPasswordOTP);
userRouter.post("/forgot_password", forgotPassword);

export default userRouter;
