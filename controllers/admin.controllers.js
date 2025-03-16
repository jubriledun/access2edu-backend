import { validateLogin, validateSignup } from "../config/validation.js";
import adminModel from "../model/adminModel.js";
import jwt from "jsonwebtoken";
import transporter from "../utils/nodemailer.js";
import cloudinary from "../config/cloudinary.config.js";
import asyncHandler from "../config/asyncHandler.js";

export const registerAdmin = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    return next(error);
  }

  const existingAdmin = await adminModel.findOne({ email });
  if (existingAdmin) {
    const error = new Error("Admin already exist. Please login");
    error.statusCode = 400;
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

  const admin = await adminModel.create({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    profilePicture: uploadResult.secure_url,
    cloudinary_id: uploadResult.public_id,
  });

  const newAdmin = await adminModel.findById(admin._id);
  if (!newAdmin) {
    const error = new Error("Account not created. Pleae try again");
    error.statusCode = 500;
    return next(error);
  }

  const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: newAdmin.email,
    subject: "Registration Sucessful on Access2edu",
    text: `Welcome ${newAdmin.firstName}, You are successfully registered on our educational platform Access2edu. Congrats on taken the right decision`,
  };
  await transporter.sendMail(mailOptions);

  res.status(201).json({
    success: true,
    message: "Account creation successful",
    newAdmin,
  });
});

export const Login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    return next(error);
  }

  const admin = await adminModel.findOne({ email });
  if (!admin) {
    const error = new Error("Invalid Credentials");
    error.statusCode = 404;
    return next(error);
  }

  const isMatch = await admin.comparePassword(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid Credentials");
    error.statusCode = 401;
    return next(error);
  }

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    admin,
  });
};

export const Logout = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    const error = new Error("You are not logged in");
    error.statusCode = 400;
    return next(error);
  }

  res.clearCookie("token", token, {
    httpOnly: true,
    sameSite: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

// export const updateUser = async (req, res, next) => {
//   const userId = req.user._id;
//   if (!userId) {
//     const error = new Error("Please Login to continue");
//     res.statusCode = 401;
//     return next(error);
//   }

//   const user = await userModel.findById(userId);
//   if (!user) {
//     const error = new Error("User not found");
//     res.statusCode = 404;
//     return next(error);
//   }

//   let uploadResult = { secure_url: "", public_id: "" }; // Default values

//   if (req.file) {
//     uploadResult = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { resource_type: "auto" },
//         (error, result) => {
//           if (error) {
//             return reject(error);
//           }
//           resolve(result);
//         }
//       );
//       stream.end(req.file.buffer);
//     });
//   }
//   const userToUpdate = await userModel.findByIdAndUpdate(
//     user._id,
//     {
//       $set: {
//         first_lastName,
//         other_names,
//         parent_guardian_name,
//         profilePicture: uploadResult.secure_url,
//         cloudinary_id: uploadResult.public_id,
//       },
//     },
//     { new: true, runValidators: true }
//   );

//   res.status(201).json({
//     success: true,
//     message: "Profile update successful",
//     userToUpdate,
//   });
// };

// export const deleteUser = async (req, res, next) => {
//   const userId = req.user._id;
//   if (!userId) {
//     const error = new Error("Please Login to continue");
//     res.statusCode = 401;
//     return next(error);
//   }

//   const user = await userModel.findById(userId);
//   if (!user) {
//     const error = new Error("User not found");
//     res.statusCode = 404;
//     return next(error);
//   }

//   const userToDelete = await userModel.findByIdAndDelete(user._id);
//   if (!userToDelete) {
//     const error = new Error("User not found");
//     res.statusCode = 404;
//     return next(error);
//   }
//   res.status(200).json({
//     success: true,
//     message: "User deleted successfully",
//   });
// };
