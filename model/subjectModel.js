import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    cloudinary_id: {
      type: String,
    },
  },
  { timestamps: true }
);

const subjectModel = mongoose.model("Subject", subjectSchema);

export default subjectModel;
