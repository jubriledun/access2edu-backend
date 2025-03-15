import Joi from "joi";

const schema = Joi.object({
  first_lastName: Joi.string().required(),
  other_names: Joi.string(),
  email: Joi.string().required().email(),
  password: Joi.string().required(),
  confirmPassword: Joi.string().required(),
});

export const validateSignup = (user) => {
  schema.validate(user);
};

const loginSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8).max(255),
});

export const validateLogin = (user) => {
  loginSchema.validate(user);
};
