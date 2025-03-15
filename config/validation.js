import Joi from "joi";

const schema = Joi.object({
  first_lastName: Joi.string().required(),
  other_names: Joi.string(),
  email: Joi.string().required().email(),
  password: Joi.string().required(),
  confirmPassword: Joi.string().required(),
});

export const validateSignup = (user) => {
  return (req, res, next) => {
    const { error } = schema.validate(user);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    next();
  };
};

const loginSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8).max(255),
});

export const validateLogin = (user) => {
  const { error } = loginSchema.validate(user);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
};
