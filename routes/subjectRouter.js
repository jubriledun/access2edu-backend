import { Router } from "express";
import { adminAuth } from "../authentication/auth.js";
import upload from "../config/multer.js";
import {
  addSubject,
  deleteSubject,
  fetchAllVideosByLevel,
  fetchAllVideosByNameAndLevel,
  updateSubject,
} from "../controllers/subject.controllers.js";

const subjectRouter = Router();

/**
 * @swagger
 * /api/v1/subjects/add-subject:
 *   post:
 *     summary: Add a new subject
 *     tags: [Subject]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               level:
 *                 type: string
 *               videoUrl:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Subject added successfully
 *       400:
 *         description: Bad request
 */
subjectRouter.post(
  "/add-subject",
  adminAuth,
  upload.array("videoUrl", 5),
  addSubject
);

/**
 * @swagger
 * /api/v1/subjects/update-subject:
 *   post:
 *     summary: Update an existing subject
 *     tags: [Subject]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subjectId:
 *                 type: string
 *               name:
 *                 type: string
 *               level:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *       404:
 *         description: Subject not found
 */
subjectRouter.post("/update-subject", adminAuth, updateSubject);

/**
 * @swagger
 * /api/v1/subjects/delete-subject:
 *   post:
 *     summary: Delete a subject
 *     tags: [Subject]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subjectId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 *       404:
 *         description: Subject not found
 */
subjectRouter.post("/delete-subject", adminAuth, deleteSubject);

/**
 * @swagger
 * /api/v1/subjects/get-video-by-level:
 *   get:
 *     summary: Fetch all videos by level
 *     tags: [Subject]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: level
 *         required: true
 *         schema:
 *           type: string
 *         description: The level to filter videos by
 *     responses:
 *       200:
 *         description: List of videos by level
 *       404:
 *         description: No videos found for the specified level
 */
subjectRouter.get("/get-video-by-level", adminAuth, fetchAllVideosByLevel);

/**
 * @swagger
 * /api/v1/subjects/get-subjects-by-name-level:
 *   get:
 *     summary: Fetch all subjects by name and level
 *     tags: [Subject]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the subject
 *       - in: query
 *         name: level
 *         required: true
 *         schema:
 *           type: string
 *         description: The level of the subject
 *     responses:
 *       200:
 *         description: List of subjects by name and level
 *       404:
 *         description: No subjects found for the specified name and level
 */
subjectRouter.get(
  "/get-subjects-by-name-level",
  adminAuth,
  fetchAllVideosByNameAndLevel
);

export default subjectRouter;