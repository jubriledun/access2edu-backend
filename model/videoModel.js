import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    video: {
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
    cloudinary_id: {
      type: String,
    },
  },
  { timestamps: true }
);

const videoModel = mongoose.model("Video", videoSchema);

export default videoModel;
