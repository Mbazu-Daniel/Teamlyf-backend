import pkg from "@prisma/client";
import asyncHandler from "express-async-handler";
import Joi from "joi";
const { UserRole } = pkg;

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid(UserRole.BASIC).default(UserRole.BASIC),
});

const validateRegister = asyncHandler(async (req, res, next) => {
  try {
    await registerSchema.validateAsync(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const registerAdminSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid(UserRole.ADMIN).required(),
});

const validateRegisterAdmin = asyncHandler(async (req, res, next) => {
  try {
    await registerAdminSchema.validateAsync(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const forgetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

// Middleware for validating password reset request
const validateForgetPassword = asyncHandler(async (req, res, next) => {
  try {
    await forgetPasswordSchema.validateAsync(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required(),
});

const validateResetPassword = asyncHandler(async (req, res, next) => {
  try {
    await resetPasswordSchema.validateAsync(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

const validateChangePassword = asyncHandler(async (req, res, next) => {
  try {
    await changePasswordSchema.validateAsync(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export {
  validateChangePassword,
  validateForgetPassword,
  validateRegister,
  validateRegisterAdmin,
  validateResetPassword,
};
