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

subjectRouter.post(
  "/add-subject",
  adminAuth,
  upload.array("videoUrl", 5),
  addSubject
);
subjectRouter.post("/update-subject", adminAuth, updateSubject);
subjectRouter.post("/delete-subject", adminAuth, deleteSubject);
subjectRouter.get("/get-video-by-level", adminAuth, fetchAllVideosByLevel);
subjectRouter.get(
  "/get-subjects-by-name-level",
  adminAuth,
  fetchAllVideosByNameAndLevel
);

export default subjectRouter;
