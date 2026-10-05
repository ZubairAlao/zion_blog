import express from "express";

import {
  getMe,
  getUserProfile,
  getMyPosts,
  updateEmail, updateUsername
} from "../controllers/user.controller.js";



import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Logged-in user
router.get(
  "/me",
  requireAuth,
  getMe
);

router.get(
  "/me/posts",
  requireAuth,
  getMyPosts
);

router.patch("/me/username",requireAuth,
  updateUsername,  updateUsername);

router.patch("/me/email", requireAuth,
  updateEmail,  updateEmail);

// Public author profile
router.get(
  "/:username",
  getUserProfile
);

export default router;