import asyncHandler from "../config/asyncHandler.js";
import studentModel from "../model/studentModel.js";
import cloudinary from "../config/cloudinary.config.js";
import transporter from "../utils/nodemailer.js";
import jwt from "jsonwebtoken";
import subjectModel from "../model/subjectModel.js";
import Flutterwave from "flutterwave-node-v3";

export const registerStudent = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    otherName,
    level,
    parent_guardian,
    email,
    password,
    confirmPassword,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !level ||
    !parent_guardian ||
    !email ||
    !password ||
    !confirmPassword
  ) {
    const error = new Error("This fields are required");
    res.statusCode = 400;
    return next(error);
  }

  const existingStudent = await studentModel.findOne({ email });
  if (existingStudent) {
    const error = new Error("Student already register. Please login");
    res.statusCode = 401;
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

  const subjects = await subjectModel.find({ className: level });

  const student = await studentModel.create({
    firstName,
    lastName,
    otherName,
    level,
    parent_guardian,
    email,
    password,
    confirmPassword,
    profilePicture: uploadResult.secure_url,
    cloudinary_id: uploadResult.public_id,
    subjects: subjects.map((subject) => subject._id),
  });

  const newStudent = await studentModel.findById(student._id);
  if (!newStudent) {
    const error = new Error("Account not created. Pleae try again");
    error.statusCode = 500;
    return next(error);
  }

  const token = jwt.sign({ id: newStudent._id }, process.env.JWT_SECRET, {
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
    to: newStudent.email,
    subject: "Registration Sucessful on Access2edu",
    text: `Welcome ${newStudent.firstName}, You are successfully registered on our educational platform Access2edu. Congrats on taken the right decision`,
  };
  await transporter.sendMail(mailOptions);

  res.status(201).json({
    success: true,
    message: "Account creation successful",
    newStudent,
  });
});

export const Login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    return next(error);
  }

  const student = await studentModel.findOne({ email });
  if (!student) {
    const error = new Error("Invalid Credentials");
    error.statusCode = 404;
    return next(error);
  }

  const isMatch = await user.comparePassword(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid Credentials");
    error.statusCode = 401;
    return next(error);
  }

  const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
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
    student,
  });
});

export const Logout = asyncHandler(async (req, res, next) => {
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
});

export const updateStudent = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  if (!studentId) {
    const error = new Error("Please Login to continue");
    res.statusCode = 401;
    return next(error);
  }

  const student = await studentModel.findById(studentId);
  if (!student) {
    const error = new Error("Student not found");
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
  const studentToUpdate = await studentModel.findByIdAndUpdate(
    student._id,
    {
      $set: {
        firstName,
        lastName,
        otherName,
        parent_guardian,
        email,
        profilePicture: uploadResult.secure_url,
        cloudinary_id: uploadResult.public_id,
      },
    },
    { new: true, runValidators: true }
  );

  res.status(201).json({
    success: true,
    message: "Profile update successful",
    studentToUpdate,
  });
});

export const deleteStudent = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  if (!studentId) {
    const error = new Error("Please Login to continue");
    res.statusCode = 401;
    return next(error);
  }

  const student = await studentModel.findById(studentId);
  if (!student) {
    const error = new Error("Stuent not found");
    res.statusCode = 404;
    return next(error);
  }

  const studentToDelete = await studentModel.findByIdAndDelete(student._id);
  if (!studentToDelete) {
    const error = new Error("Student not found");
    res.statusCode = 404;
    return next(error);
  }
  res.status(200).json({
    success: true,
    message: "Student deleted successfully",
  });
});

export const fetchAllSubject = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  if (!studentId) {
    const error = new Error("Please login to continue");
    res.statusCode = 401;
    return next(error);
  }

  const page = parseInt(req.params.page);
  const limit = parseInt(req.params.limit);
  const skip = (page - 1) * limit;

  const student = await studentModel
    .findById(studentId)
    .populate("subjects")
    .skip(skip)
    .limit(limit);

  if (!student) {
    const error = new Error("Student not found");
    res.statusCode = 404;
    return next(error);
  }

  // const totalSubject = await subjectModel.countDocuments({
  //   level: { $regex: level, $options: "i" },
  //   level: student.level,
  // });

  // if (!totalSubject) {
  //   const error = new Error("No subject found");
  //   res.statusCode = 404;
  //   return next(error);
  // }

  // const subjects = await subjectModel
  //   .find({
  //     level: { $regex: level, $options: "i" },
  //     level: student.level,
  //   })
  //   .skip(skip)
  //   .limit(limit);

  if (student.subjects.length === 0) {
    const error = new Error("No more page available");
    res.statusCode = 404;
    return next(error);
  }

  if (!student.hasPaid) {
    const subjects = student.subjects.map((subject) => ({
      name: subject.name,
      className: subject.className,
      title: subject.title,
      description: subject.description,
    }));

    return res.status(200).json({
      page,
      limit,
      subjects,
    });
  }

  const Allsubjects = student.subjects.map((subject) => ({
    page,
    limit,
    name: subject.name,
    className: subject.className,
    title: subject.title,
    description: subject.description,
    videoUrl: subject.videoUrl,
  }));

  res.status(200).json({
    page,
    limit,
    Allsubjects,
  });
});

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

// Initiate Payment (Flutterwave)
export const initiatePaymentWithCard = async (req, res) => {
  try {
    const studentId = req.user._id;
    if (!studentId) {
      const error = new Error("Please login to continue");
      res.statusCode = 401;
      return next(error);
    }

    const { email, amount, paymentMethod } = req.body;
    const student = await studentModel.findById(studentId);

    if (!student) {
      const error = new Error("Student not found");
      res.statusCode = 404;
      return next(error);
    }

    // Flutterwave Payment Payload
    const payload = {
      tx_ref: `STU-${Date.now()}`,
      amount,
      currency: "NGN",
      redirect_url: `${process.env.FRONTEND_URL}/payment-success`, // Update with your frontend route
      customer: { email },
      payment_options: paymentMethod, // "card", "bank_transfer", "googlepay"
      customizations: {
        title: "School Payment",
        description: "Pay for video access",
      },
    };

    const response = await flw.Charge.card(payload);

    if (response.status === "success") {
      res.json({
        message: "Payment initiated",
        paymentLink: response.data.link,
      });
    } else {
      res
        .status(400)
        .json({ message: "Payment failed", error: response.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const initiatePaymentWithBankTransfer = async (req, res) => {
  try {
    const studentId = req.user._id;
    if (!studentId) {
      const error = new Error("Please login to continue");
      res.statusCode = 401;
      return next(error);
    }

    const { email, amount, paymentMethod } = req.body;
    const student = await studentModel.findById(studentId);

    if (!student) {
      const error = new Error("Student not found");
      res.statusCode = 404;
      return next(error);
    }

    // Flutterwave Payment Payload
    const payload = {
      tx_ref: `STU-${Date.now()}`,
      amount,
      currency: "NGN",
      redirect_url: `${process.env.FRONTEND_URL}/payment-success`, // Update with your frontend route
      customer: { email },
      payment_options: paymentMethod, // "card", "bank_transfer", "googlepay"
      customizations: {
        title: "School Payment",
        description: "Pay for video access",
      },
    };

    const response = await flw.Charge.bank_transfer(payload);

    if (response.status === "success") {
      res.json({
        message: "Payment initiated",
        paymentLink: response.data.link,
      });
    } else {
      res
        .status(400)
        .json({ message: "Payment failed", error: response.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const initiatePaymentWithApplePay = async (req, res) => {
  try {
    const studentId = req.user._id;
    if (!studentId) {
      const error = new Error("Please login to continue");
      res.statusCode = 401;
      return next(error);
    }

    const { email, amount, paymentMethod } = req.body;
    const student = await studentModel.findById(studentId);

    if (!student) {
      const error = new Error("Student not found");
      res.statusCode = 404;
      return next(error);
    }

    // Flutterwave Payment Payload
    const payload = {
      tx_ref: `STU-${Date.now()}`,
      amount,
      currency: "NGN",
      redirect_url: `${process.env.FRONTEND_URL}/payment-success`, // Update with your frontend route
      customer: { email },
      payment_options: paymentMethod, // "card", "bank_transfer", "googlepay"
      customizations: {
        title: "School Payment",
        description: "Pay for video access",
      },
    };

    const response = await flw.Charge.applepay(payload);

    if (response.status === "success") {
      res.json({
        message: "Payment initiated",
        paymentLink: response.data.link,
      });
    } else {
      res
        .status(400)
        .json({ message: "Payment failed", error: response.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { transactionId, studentId } = req.body;
    const response = await flw.TransactionVerify({ id: transactionId });

    if (
      response.status === "success" &&
      response.data.status === "successful"
    ) {
      await studentModel.findByIdAndUpdate(studentId, { hasPaid: true });
      res.json({ message: "Payment successful! You can now access videos." });
    } else {
      res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
