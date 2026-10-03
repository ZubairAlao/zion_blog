import express from "express";

import {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  deleteAccount,
  resendVerification
} from "../controllers/auth.controller.js";
import {
  authLimiter,
  refreshLimiter,
} from '../middleware/rate-limit.middleware.js';

import { requireAuth } from "../middleware/auth.middleware.js";

import { validate } from "../middleware/validate.middleware.js";

import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
} from "../validators/auth.validator.js";

const router = express.Router();

router.post(
  "/register", authLimiter,
  validate(registerSchema),
  register
);

router.post(
  "/login", authLimiter,
  validate(loginSchema),
  login
);

router.post(
  "/refresh", refreshLimiter,
  refresh
);

router.post(
  "/logout",
  logout
);

router.post(
  "/verify-email", authLimiter,
  verifyEmail
);

router.post("/resend-verification", resendVerification);

router.post(
  "/forgot-password", authLimiter,
  validate(forgotPasswordSchema),
  forgotPassword
);

router.post(
  "/reset-password", authLimiter,
  validate(resetPasswordSchema),
  resetPassword
);

router.patch(
  "/change-password",
  requireAuth,
  validate(changePasswordSchema),
  changePassword
);

router.delete(
  "/account",
  requireAuth,
  deleteAccount
);

export default router;