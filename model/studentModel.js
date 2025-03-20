import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const studentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    otherName: {
      type: String,
    },
    parent_guardian: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    confirmPassword: {
      type: String,
      validate: function (value) {
        return this.password === value;
      },
      message: "Password not match",
    },
    level: {
      type: String,
      required: true,
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
      },
    ],
    profilePicture: {
      type: String,
      default: "",
    },
    cloudinary_id: {
      type: String,
    },
    forgotPasswordOTP: {
      type: String,
      default: "",
    },
    forgotPasswordOTPExpireAt: {
      type: Date,
      default: Date.now,
    },
    hasPaid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);

  this.confirmPassword = null;
  next();
});

studentSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const studentModel = mongoose.model("Student", studentSchema);

export default studentModel;
