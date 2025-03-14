const adminUser = (...roles) => {
  return (req, res, next) => {
    if (
      !req.user?.role ||
      !req.user.role.some((role) => roles.includes(role))
    ) {
      return next(
        new Error("You are not authorized to perform this operation", {
          statusCode: 403,
        })
      );
    }

    next();
  };
};

export default adminUser;
