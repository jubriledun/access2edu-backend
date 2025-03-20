import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      // minlength: 8,
      // maxlength: 255,
    },
    confirmPassword: {
      type: String,
      required: true,
      // minlength: 8,
      // maxlength: 255,
      validate: function (value) {
        return this.password === value;
      },
      message: "Check Password",
    },
    forgotPasswordOTP: {
      type: String,
      default: "",
    },
    forgotPasswordOTPExpireAt: {
      type: Date,
      default: Date.now,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    cloudinary_id: {
      type: String,
    },
  },
  { timestamps: true }
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);

  this.confirmPassword = null;
  next();
});

adminSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const adminModel = mongoose.model("Admin", adminSchema);

export default adminModel;
