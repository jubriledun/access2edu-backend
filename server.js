import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "express-async-errors";
import globalError from "./config/globalErrors.js";
import logger from "./config/logger.js";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRouters.js";
import videoRouter from "./routes/videoRouter.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);

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
