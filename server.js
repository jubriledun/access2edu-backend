import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import globalError from "./config/globalErrors.js";
import logger from "./config/logger.js";
import connectDB from "./config/db.js";
<<<<<<< HEAD
import studentRouter from "./routes/studentRouter.js";
import subjectRouter from "./routes/subjectRouter.js";
import adminRouter from "./routes/adminRouter.js";
=======
import userRouter from "./routes/userRouters.js";
import paymentRoutes from './routes/paymentRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
>>>>>>> a52ef16b30fa8cc55f41f6f3086d2f39c296843e

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

<<<<<<< HEAD
app.use("/api/v1/students", studentRouter);
app.use("/api/v1/subjects", subjectRouter);
app.use("/api/v1/admin", adminRouter);
=======
app.use("/api/v1/users", userRouter);
app.use("/api/payments", paymentRoutes);
app.use("/webhooks", webhookRoutes);

app.get("/", (req, res) => res.send("Payment Gateway API Running"));
>>>>>>> a52ef16b30fa8cc55f41f6f3086d2f39c296843e

app.all("*", (req, res, next) => {
  res.status(400).json({
    success: false,
    message: `Can"t find ${req.originalUrl} on the server`,
  });
});

app.use(globalError);

await connectDB();
app.listen(process.env.PORT, () => {
  logger.info(`Server running on http://localhost:${process.env.PORT}`);
});
