import jwt from "jsonwebtoken";

const userAuth = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(
      new Error(401, "You are not authorized. Please login to continue")
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded || !decoded.id) {
    return next(new Error(401, "Invalid token"));
  }
  req.user = decoded;
  next();
};

export default userAuth;
