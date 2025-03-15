import { Router } from "express";
import upload from "../config/multer.js";
import {
  deleteUser,
  Login,
  Logout,
  Signup,
  updateUser,
} from "../controllers/users.controllers.js";
import {
  forgotPassword,
  sendForgotPasswordOTP,
} from "../controllers/forgotPassword.controllers.js";
import userAuth from "../authentication/userAuth.js";

const userRouter = Router();

userRouter.post("/signup", upload.single("profilePicture"), Signup);
userRouter.post("/login", Login);
userRouter.post("/forgot_password_otp", sendForgotPasswordOTP);
userRouter.post("/forgot_password", forgotPassword);
userRouter.post("/logout", Logout);
userRouter.post("/update", userAuth, updateUser);
userRouter.post("/delete", userAuth, deleteUser);

export default userRouter;
