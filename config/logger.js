import winston from 'winston';
import 'winston-mongodb';

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
    new winston.exceptions.handle({
      filename: "exceptions.log",
      level: "error",
    }),
    new winston.exceptions.MongoDB({
      db: process.env.MONGO_URI,
      collection: "exceptions",
    }),
  ],
  rejectionHandlers: [
    new winston.rejections.handle({
      filename: "exceptions.log",
      level: "error",
    }),
    new winston.rejections.MongoDB({
      db: process.env.MONGO_URI,
      collection: "exceptions",
    }),
  ],
});

export default logger;