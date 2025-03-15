import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    first_lastName: {
      type: String,
      required: true,
    },
    other_names: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    parent_guardian_name: {
      type: String,
      required: true,
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
    roles: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);

  this.confirmPassword = null;
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("User", userSchema);

export default userModel;
