import videoModel from "../model/videoModel.js";
import cloudinary from "../config/cloudinary.config.js";
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

  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    stream.end(req.file.buffer);
  });

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

  const user = await userModel.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    res.statusCode = 404;
    return next(error);
  }

  const page = parseInt(req.params.page);
  const limit = parseInt(req.params.limit);
  const skip = (page - 1) * limit;

  const totalVideos = await videoModel.countDocuments();
  if (!totalVideos) {
    const error = new Error("No videos found");
    res.statusCode = 404;
    return next(error);
  }

  const videos = await videoModel
    .find()
    .skip(skip)
    .limit(limit)
    .select("video title description");

  if (videos.length === 0) {
    const error = new Error("No more page available");
    res.statusCode = 404;
    return next(error);
  }

  res.status(200).json({
    page,
    limit,
    totalVideos,
    totalPages: Math.ceil(totalUsers / limit),
    data: videos,
  });
};

export const fetchAllVideosByCourse = async (req, res, next) => {
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

  const page = parseInt(req.params.page);
  const limit = parseInt(req.params.limit);
  const skip = (page - 1) * limit;

  const { course } = req.params;
  if (!course) {
    const error = new Error("Course name is required");
    res.statusCode = 400;
    return next(error);
  }
  const totalVideos = await videoModel.countDocuments({
    course: { $regex: course, $options: "i" },
  });
  if (!totalVideos) {
    const error = new Error("No videos found");
    res.statusCode = 404;
    return next(error);
  }

  const videos = await videoModel
    .find({ course: { $regex: course, $options: "i" } })
    .skip(skip)
    .limit(limit)
    .select("video title description");

  if (videos.length === 0) {
    const error = new Error("No more page available");
    res.statusCode = 404;
    return next(error);
  }

  res.status(200).json({
    page,
    limit,
    totalVideos,
    totalPages: Math.ceil(totalUsers / limit),
    data: videos,
  });
};

export const updateVideo = async (req, res, next) => {
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

  const { id } = req.params;
  if (!id) {
    const error = new Error("Please go to the video you want to update");
    res.statusCode = 400;
    return next(error);
  }

  const video = await videoModel.findById(id);
  if (!video) {
    const error = new Error("Video not found");
    res.statusCode = 404;
    return next(error);
  }

  let uploadResult = { secure_url: "", public_id: "" }; // Default values

  if (req.file) {
    uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });
  }
  const videoToUpdate = await videoModel.findByIdAndUpdate(
    video._id,
    {
      $set: {
        title,
        description,
        video: uploadResult.secure_url,
        cloudinary_id: uploadResult.public_id,
      },
    },
    { new: true, runValidators: true }
  );

  res.status(201).json({
    success: true,
    message: "Video update successful",
    videoToUpdate,
  });
};

export const deleteVideo = async (req, res, next) => {
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

  const { id } = req.params;
  if (!id) {
    const error = new Error("Please go to the video you want to update");
    res.statusCode = 400;
    return next(error);
  }

  const video = await videoModel.findById(id);
  if (!video) {
    const error = new Error("Video not found");
    res.statusCode = 404;
    return next(error);
  }

  const videoToDelete = await videoModel.findByIdAndDelete(video._id);
  if (!video) {
    const error = new Error("Video not found");
    res.statusCode = 404;
    return next(error);
  }
  res.status(200).json({
    success: true,
    message: "Video deleted successfully",
  });
};
