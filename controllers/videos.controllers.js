import videoModel from "../model/videoModel.js";
import uploadResult from "../config/cloudinary.js";
import userModel from "../model/userModel.js";

export const addVideo = async (req, res, next) => {
  const userId = req.user._id;

  if (!userId) {
    const error = new Error("Please Login to continue");
    res.statusCode = 401;
    return next(error);
  }

  const user = await userModel.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    res.statusCode = 404;
    return next(error);
  }

  if (!user.roles.includes("admin")) {
    const error = new Error("You cannot perform this operation");
    res.statusCode = 403;
    return next(error);
  }

  const { title, description } = req.body;
  if (!title || !description) {
    const error = new Error("Title and description are required");
    res.statusCode = 400;
    return next(error);
  }

  if (!req.file) {
    const error = new Error("Please upload the video file");
    res.statusCode = 400;
    return next(error);
  }

  const video = await videoModel.create({
    title,
    description,
    video: uploadResult.secure_url,
    cloudinary_id: uploadResult.public_id,
  });

  const newVideo = await videoModel.findById(video._id);
  if (!newVideo) {
    const error = new Error(
      "Error while uploading the video, Please try again"
    );
    res.statusCode = 500;
    return next(error);
  }

  res.status(201).json({
    success: true,
    message: "Video upload successful",
  });
};

export const fetchAllVideos = async (req, res, next) => {
  const userId = req.user._id;
  if (!userId) {
    const error = new Error("Please Login to continue");
    res.statusCode = 401;
    return next(error);
  }
};
