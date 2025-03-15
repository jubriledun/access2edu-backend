import { Router } from "express";
import userAuth from "../authentication/userAuth.js";
import adminUser from "../authentication/adminAuth.js";
import upload from "../config/multer.js";
import {
  addVideo,
  fetchAllVideos,
  fetchAllVideosByCourse,
  updateVideo,
} from "../controllers/videos.controllers.js";

const videoRouter = Router();

videoRouter.post(
  "/add-video",
  userAuth,
  adminUser,
  upload.array("video", 5),
  addVideo
);
videoRouter.get("/fetch-all-videos", userAuth, fetchAllVideos);
videoRouter.get("/fetch-video-course", userAuth, fetchAllVideosByCourse);
videoRouter.post(
  "/update-video",
  userAuth,
  adminUser,
  upload.single("video"),
  updateVideo
);
videoRouter.post("/delete-video", userAuth, adminUser);

export default videoRouter;
