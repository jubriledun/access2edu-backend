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
import Exam from "../model/examModel.js";

const adminRouter = Router();

/**
 * @swagger
 * /api/v1/admin/register-admin:
 *   post:
 *     summary: Register a new admin
 *     tags: [Admin]
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
 *         description: Admin registered successfully
 *       400:
 *         description: Bad request
 */
adminRouter.post(
  "/register-admin",
  upload.single("profilePicture"),
  registerAdmin
);

/**
 * @swagger
 * /api/v1/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
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
 *        description: Login successful
 *       401:
 *         description: Unauthorized
 */
adminRouter.post("/login", Login);

/**
 * @swagger
 * /api/v1/admin/logout:
 *   post:
 *     summary: Admin logout
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Logout successful
 */
adminRouter.post("/logout", Logout);

/**
 * @swagger
 * /api/v1/admin/send-forgot-password-otp:
 *   post:
 *     summary: Send OTP for admin password recovery
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Bad request
 */
adminRouter.post("/send-forgot-password-otp", sendForgotPasswordOTPAdmin);


/**
 * @swagger
 * /api/v1/admin/forgot-password:
 *   post:
 *     summary: Reset admin password
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Bad request
 */
adminRouter.post("/forgot-password", forgotPasswordAdmin);

/**
 * @swagger
 * /api/v1/admin/exams:
 *   post:
 *     summary: Create a new exam
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionText:
*                       type: string
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                     correctAnswer:
 *                       type: string
 *     responses:
 *       201:
 *         description: Exam created successfully
 *       400:
 *         description: Bad request
 */
adminRouter.post("/exams", async (req, res) => {
  try {
    const { title, description, questions } = req.body;

    const exam = new Exam({
      title,
      description,
      questions,
    });

    await exam.save();
    res.status(201).json({ message: "Exam created successfully", exam });
  } catch (error) {
    res.status(500).json({ message: "Error creating exam", error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/exams/{examId}/questions:
 *   put:
 *     summary: Add questions to an existing exam
 *     tags: [Admin]
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
 *               questions:
 *                 type: array
*                 items:
 *                   type: object
 *                   properties:
 *                     questionText:
 *                       type: string
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                     correctAnswer:
 *                       type: string
 *     responses:
 *       200:
 *         description: Questions added successfully
 *       404:
 *         description: Exam not found
 */
adminRouter.put("/exams/:examId/questions", async (req, res) => {
  try {
    const { examId } = req.params;
    const { questions } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    exam.questions.push(...questions);
    await exam.save();

    res.status(200).json({ message: "Questions added successfully", exam });
  } catch (error) {
    res.status(500).json({ message: "Error adding questions", error: error.message });
  }
});

export default adminRouter;