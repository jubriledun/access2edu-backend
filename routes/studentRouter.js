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

/**
 * @swagger
 * /api/students/register:
 *   post:
 *     summary: Register a new student
 *     tags: [Student]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Student registered successfully
 *       400:
 *         description: Bad request
 */
studentRouter.post(
  "/register",
  upload.single("profilePicture", registerStudent)
);

/**
 * @swagger
 * /api/students/login:
 *   post:
 *     summary: Student login
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */
studentRouter.post("/login", Login);

/**
 * @swagger
 * /api/students/logout:
 *   post:
 *     summary: Student logout
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: Logout successful
 */
studentRouter.post("/logout", Logout);

/**
 * @swagger
 * /api/students/update-student/{studentId}:
 *   post:
 *     summary: Update student details
 *     tags: [Student]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the student to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student updated successfully
 *       404:
 *         description: Student not found
 */
studentRouter.post("/update-student/:studentId", studentAuth, updateStudent);

/**
 * @swagger
 * /api/students/delete-student/{studentId}:
 *   post:
 *     summary: Delete a student
 *     tags: [Student]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the student to delete
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *       404:
 *         description: Student not found
 */
studentRouter.post("/delete-student/:studentId", studentAuth, deleteStudent);

/**
 * @swagger
 * /api/students/get-all-subject:
 *   get:
 *     summary: Fetch all subjects
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: List of subjects
 */
studentRouter.get("/get-all-subject", studentAuth, fetchAllSubject);

/**
 * @swagger
 * /api/students/card-payment:
 *   post:
 *     summary: Initiate payment with a card
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
studentRouter.post("/card-payment", studentAuth, initiatePaymentWithCard);

/**
 * @swagger
 * /api/students/bank-payment:
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

/**
 * @swagger
 * /api/students/verify-payment:
 *   post:
 *     summary: Verify a payment
 *     tags: [Student]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reference:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       404:
 *         description: Payment not found
 */
studentRouter.post("/verify-payment", studentAuth, verifyPayment);

/**
 * @swagger
 * /api/students/exams:
 *   get:
 *     summary: Fetch all available exams
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: List of exams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 */
studentRouter.get("/exams", studentAuth, async (req, res) => {
  try {
    const exams = await Exam.find({}, { title: 1, description: 1 });
    res.status(200).json({ exams });
  } catch (error) {
    res.status(500).json({ message: "Error fetching exams", error: error.message });
  }
});

/**
 * @swagger
 * /api/students/exams/{examId}/submit:
 *   post:
 *     summary: Submit answers for an exam
 *     tags: [Student]
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the exam
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *     responses:
 *       200:
 *         description: Exam submitted successfully
 *       404:
 *         description: Exam not found
 */
studentRouter.post("/exams/:examId/submit", studentAuth, async (req, res) => {
  try {
    const { examId } = req.params;
    const { answers } = req.body; // { questionId: selectedOption }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    let score = 0;
    exam.questions.forEach((question) => {
      if (answers[question._id] === question.correctAnswer) {
        score++;
      }
    });

    res.status(200).json({ message: "Exam submitted successfully", score });
  } catch (error) {
    res.status(500).json({ message: "Error submitting exam", error: error.message });
  }
});

export default studentRouter;