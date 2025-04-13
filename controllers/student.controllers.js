import asyncHandler from "../config/asyncHandler.js";
import studentModel from "../model/studentModel.js";
import cloudinary from "../config/cloudinary.config.js";
import transporter from "../utils/nodemailer.js";
import jwt from "jsonwebtoken";
import subjectModel from "../model/subjectModel.js";
import Paystack from 'paystack-node'; // Import Paystack SDK

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY); // Initialize Paystack with secret key

export const registerStudent = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, otherName, level, parent_guardian, email, password, confirmPassword } = req.body;

  if (!firstName || !lastName || !level || !parent_guardian || !email || !password || !confirmPassword) {
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
      const stream = cloudinary.uploader.upload_stream({ resource_type: "auto" }, (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });
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
    const error = new Error("Account not created. Please try again");
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
    subject: "Registration Successful on Access2edu",
    text: `Welcome ${newStudent.firstName}, You are successfully registered on our educational platform Access2edu. Congrats on taking the right decision.`,
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

  const isMatch = await student.comparePassword(password, student.password);
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
    const error = new Error("Student not found");
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

//initiate Payment (Paystack)
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

    // Paystack Payment Payload
    const payload = {
      email,
      amount: amount * 100, // Paystack requires the amount in kobo (1 NGN = 100 kobo)
      currency: "NGN",
      callback_url: `${process.env.FRONTEND_URL}/payment-success`, 
      //Update the frontend route
      customer: { email},
      payment_options: paymentMethod,  //card, bank_transfer
      customizations: {
        title: "School Payment",
        description: "Pay for video access",
      },
    };

    // Initiate Paystack Payment
    paystack.transaction.initialize(payload, (error, body) => {
      if (error) {
        return res.status(400).json({ message: "Payment failed", error });
      }

      if (response.status === "success") {
        res.json({
          message: "Payment initiated",
          paymentLink: body.data.authorization_url,
        });
      } else {
        res.status(400).json({ message: "Payment failed", error: response.message });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const initiatePaymentWithBankTransfer = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    if (!studentId) {
      const error = new Error("Please login to continue");
      res.statusCode = 401;
      return next(error);
    }

    const { email, amount, paymentMethod } = req.body;

    if (!email || !amount || !paymentMethod) {
      const error = new Error("Missing required fields: email, amount, or paymentMethod");
      res.statusCode = 400;
      return next(error);
    }
    if (amount <= 0) {
      const error = new Error("Amount must be greater than zero");
      res.statusCode = 400;
      return next(error);
    }
    const student = await studentModel.findById(studentId);

    if (!student) {
      const error = new Error("Student not found");
      res.statusCode = 404;
      return next(error);
    }
    if (student.balance < amount) {
      const error = new Error("Insufficient balance");
      res.statusCode = 400;
      return next(error);
    }

    if (paymentMethod === 'bank_transfer') {
      const transferData = {
        source: 'balance',
        amount: amount * 100, 
        recipient: 'your_recipient_code_here',
        email: email, 
      };

      const paystackResponse = await axios.post('https://api.paystack.co/transfer', transferData, {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      });

      if (paystackResponse.data.status === 'success') {
        student.balance -= amount;
        await student.save();

        const newTransaction = new transactionModel({
          studentId,
          amount,
          transactionType: 'transfer',
          status: 'successful',
          paymentMethod,
          transactionDetails: paystackResponse.data.data,
        });
        await newTransaction.save();

        res.status(200).json({
          status: 'success',
          message: 'Payment successful',
          transactionDetails: paystackResponse.data.data,
        });
      } else {
        const error = new Error("Payment failed. Please try again.");
        res.statusCode = 500;
        return next(error);
      }
    } else {
      const error = new Error("Invalid payment method");
      res.statusCode = 400;
      return next(error);
    }
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    next(error);
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { reference, studentId } = req.body;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paymentData = response.data;

    if (
      paymentData.status === true &&
      paymentData.data.status === 'success'
    ) {
      await studentModel.findByIdAndUpdate(studentId, { hasPaid: true });
      return res.json({
        message: 'Payment successful! You can now access videos.',
      });
    } else {
      return res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Verification error:', error.message);
    return res.status(500).json({ error: 'Something went wrong during verification' });
  }
};

