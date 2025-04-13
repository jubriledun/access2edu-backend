import { Router } from "express";
import upload from "../config/multer.js";
import {
  deleteStudent,
  fetchAllSubject,
  initiatePaymentWithBankTransfer,
  initiatePaymentWithCard,
  Login,
  Logout,
  registerStudent,
  updateStudent,
  verifyPayment,
} from "../controllers/student.controllers.js";
import { studentAuth } from "../authentication/auth.js";
import {
  forgotPasswordStudent,
  sendForgotPasswordOTPStudent,
} from "../controllers/forgotPassword.controllers.js";

const studentRouter = Router();

studentRouter.post(
  "/register",
  upload.single("profilePicture", registerStudent)
);
studentRouter.post("/login", Login);
studentRouter.post("/logout", Logout);
studentRouter.post("/update-student/:studentId", studentAuth, updateStudent);
studentRouter.post("/delete-student/:studentId", studentAuth, deleteStudent);
studentRouter.get("/get-all-subject", studentAuth, fetchAllSubject);
studentRouter.post("/card-payment", studentAuth, initiatePaymentWithCard);
studentRouter.post(
  "/bank-payment",
  studentAuth,
  initiatePaymentWithBankTransfer
);
studentRouter.post("/verify-payment", studentAuth, verifyPayment);
studentRouter.post("/send-forgot-password-otp", sendForgotPasswordOTPStudent);
studentRouter.post("/forgot-password", forgotPasswordStudent);

export default studentRouter;
