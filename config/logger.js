import winston from "winston";
import "winston-mongodb";

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "errors.log", level: "error" }),
    new winston.transports.MongoDB({
      db: process.env.MONGO_URI,
      collection: "error_logs",
      level: "error",
    }),
  ],
  exceptionHandlers: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "exceptions.log",
    }),
    new winston.transports.MongoDB({
      db: process.env.MONGO_URI,
      collection: "exceptions",
    }),
  ],
  rejectionHandlers: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "rejections.log",
    }),
    new winston.transports.MongoDB({
      db: process.env.MONGO_URI,
      collection: "rejections",
    }),
  ],
});

export default logger;
