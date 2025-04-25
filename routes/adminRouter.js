import { Router } from "express";
import upload from "../config/multer.js";
import {
  Login,
  Logout,
  registerAdmin,
} from "../controllers/admin.controllers.js";
import {
  forgotPasswordAdmin,
  sendForgotPasswordOTPAdmin,
} from "../controllers/forgotPassword.controllers.js";

const adminRouter = Router();

adminRouter.post(
  "/register-admin",
  upload.single("profilePicture"),
  registerAdmin
);
adminRouter.post("/login", Login);
adminRouter.post("/logout", Logout);
adminRouter.post("/send-forgot-password-otp", sendForgotPasswordOTPAdmin);
adminRouter.post("/forgot-password", forgotPasswordAdmin);

export default adminRouter;