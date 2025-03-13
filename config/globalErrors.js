import logger from "./logger.js";

const globalError = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode: err.status || 500,
    route: req.originalUrl,
    method: req.method,
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default globalError;
