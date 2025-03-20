import subjectModel from "../model/subjectModel.js";
import cloudinary from "../config/cloudinary.config.js";
import asyncHandler from "../config/asyncHandler.js";
import adminModel from "../model/adminModel.js";

export const addSubject = asyncHandler(async (req, res, next) => {
  const adminId = req.user._id;

  if (!adminId) {
    const error = new Error("Please Login to continue");
    res.statusCode = 401;
    return next(error);
  }

  const admin = await adminModel.findById(adminId);
  if (!admin) {
    const error = new Error("Admin not found");
    res.statusCode = 404;
    return next(error);
  }

  // if (!user.roles.includes("admin")) {
  //   const error = new Error("You cannot perform this operation");
  //   res.statusCode = 403;
  //   return next(error);
  // }

  const { name, className, title, description } = req.body;
  if (!name || !className || !title || !description) {
    const error = new Error("All fields are required");
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

  const subject = await subjectModel.create({
    name,
    className,
    title,
    description,
    videoUrl: uploadResult.secure_url,
    cloudinary_id: uploadResult.public_id,
  });

  const newSubject = await subjectModel.findById(subject._id);
  if (!newSubject) {
    const error = new Error(
      "Error while uploading the subject, Please try again"
    );
    res.statusCode = 500;
    return next(error);
  }

  res.status(201).json({
    success: true,
    message: "Subject upload successful",
  });
});

export const fetchAllVideosByLevel = asyncHandler(async (req, res, next) => {
  const adminId = req.user._id;
  if (!adminId) {
    const error = new Error("Please Login to continue");
    res.statusCode = 401;
    return next(error);
  }

  const admin = await adminModel.findById(adminId);
  if (!admin) {
    const error = new Error("Admin not found");
    res.statusCode = 404;
    return next(error);
  }

  const page = parseInt(req.params.page);
  const limit = parseInt(req.params.limit);
  const skip = (page - 1) * limit;

  const { className } = req.params;

  const totalSubject = await subjectModel.countDocuments({
    className: { $regex: className, $options: "i" },
  });
  if (!totalSubject) {
    const error = new Error("No subject found");
    res.statusCode = 404;
    return next(error);
  }

  const subjects = await subjectModel
    .find({ className: { $regex: className, $options: "i" } })
    .skip(skip)
    .limit(limit)
    .select("name level videoUrl title description");

  if (subjects.length === 0) {
    const error = new Error("No more page available");
    res.statusCode = 404;
    return next(error);
  }

  res.status(200).json({
    page,
    limit,
    totalSubject,
    totalPages: Math.ceil(totalSubject / limit),
    data: subjects,
  });
});

export const fetchAllVideosByNameAndLevel = asyncHandler(
  async (req, res, next) => {
    const adminId = req.user._id;
    if (!adminId) {
      const error = new Error("Please Login to continue");
      res.statusCode = 401;
      return next(error);
    }

    const admin = await adminModel.findById(adminId);
    if (!admin) {
      const error = new Error("Admin not found");
      res.statusCode = 404;
      return next(error);
    }

    const page = parseInt(req.params.page);
    const limit = parseInt(req.params.limit);
    const skip = (page - 1) * limit;

    const { name, className } = req.body;
    if (!name || !className) {
      const error = new Error("All fields are required");
      res.statusCode = 400;
      return next(error);
    }
    const totalSubject = await subjectModel.countDocuments({
      name: { $regex: name, $options: "i" },
      className: { $regex: className, $options: "i" },
    });

    if (!totalSubject) {
      const error = new Error("No Subject found");
      res.statusCode = 404;
      return next(error);
    }

    const subjects = await subjectModel
      .find({
        name: { $regex: name, $options: "i" },
        className: { $regex: className, $options: "i" },
      })
      .skip(skip)
      .limit(limit)
      .select("name level videoUrl title description");

    if (subjects.length === 0) {
      const error = new Error("No more page available");
      res.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      page,
      limit,
      totalSubject,
      totalPages: Math.ceil(totalSubject / limit),
      data: subjects,
    });
  }
);

export const updateSubject = asyncHandler(async (req, res, next) => {
  const adminId = req.user._id;
  if (!adminId) {
    const error = new Error("Please Login to continue");
    res.statusCode = 401;
    return next(error);
  }

  const admin = await adminModel.findById(adminId);
  if (!admin) {
    const error = new Error("Admin not found");
    res.statusCode = 404;
    return next(error);
  }

  // if (!user.roles.includes("admin")) {
  //   const error = new Error("You cannot perform this operation");
  //   res.statusCode = 403;
  //   return next(error);
  // }

  const { subjectId } = req.params;
  if (!subjectId) {
    const error = new Error("Please go to the subject you want to update");
    res.statusCode = 400;
    return next(error);
  }

  const subject = await subjectModel.findById(subjectId);
  if (!subject) {
    const error = new Error("Subject not found");
    res.statusCode = 404;
    return next(error);
  }

  const subjectToUpdate = await subjectModel.findById(subject._id);
  if (!subjectToUpdate) {
    const error = new Error("Subject not found");
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
  const updatedSubject = await subjectModel.findByIdAndUpdate(
    video._id,
    {
      $set: {
        name,
        className,
        title,
        description,
        videoUrl: uploadResult.secure_url,
        cloudinary_id: uploadResult.public_id,
      },
    },
    { new: true, runValidators: true }
  );

  res.status(201).json({
    success: true,
    message: "Subject update successful",
    updatedSubject,
  });
});

export const deleteSubject = asyncHandler(async (req, res, next) => {
  const adminId = req.user._id;
  if (!adminId) {
    const error = new Error("Please Login to continue");
    res.statusCode = 401;
    return next(error);
  }

  const admin = await adminModel.findById(adminId);
  if (!admin) {
    const error = new Error("Admin not found");
    res.statusCode = 404;
    return next(error);
  }
  // if (!user.roles.includes("admin")) {
  //   const error = new Error("You cannot perform this operation");
  //   res.statusCode = 403;
  //   return next(error);
  // }

  const { subjectId } = req.params;
  if (!subjectId) {
    const error = new Error("Please go to the subject you want to update");
    res.statusCode = 400;
    return next(error);
  }

  const subject = await subjectModel.findById(subjectId);
  if (!subject) {
    const error = new Error("Subject not found");
    res.statusCode = 404;
    return next(error);
  }

  const subjectToDelete = await subjectModel.findByIdAndDelete(subject._id);
  if (!subjectToDelete) {
    const error = new Error("Error deleting subject");
    res.statusCode = 500;
    return next(error);
  }
  res.status(200).json({
    success: true,
    message: "Subject deleted successfully",
  });
});
