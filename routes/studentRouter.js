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
import Exam from "../model/examModel.js";

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

/**
 * @swagger
 * /api/student/bank-payment:
 *   post:
 *     summary: Initiate payment with a bank transfer
 *     tags: [Student]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Payment initiated successfully
 *       400:
 *         description: Bad request
 */
studentRouter.post(
  "/bank-payment",
  studentAuth,
  initiatePaymentWithBankTransfer
);
studentRouter.post("/verify-payment", studentAuth, verifyPayment);
studentRouter.post("/send-forgot-password-otp", sendForgotPasswordOTPStudent);
studentRouter.post("/forgot-password", forgotPasswordStudent);

export default studentRouter;