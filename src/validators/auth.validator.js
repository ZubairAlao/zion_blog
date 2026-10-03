import { z } from "zod";

export const registerSchema = z.object({
  email: z.email(),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  password: z.string().min(8).max(72)
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1)
});

export const forgotPasswordSchema = z.object({
  email: z.email()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8).max(72)
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72)
});