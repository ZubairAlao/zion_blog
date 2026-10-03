import express from "express";

import {
  getMe,
  getUserProfile,
  getMyPosts,
  updateProfile
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

router.patch(
  "/me",
  requireAuth,
  updateProfile
);

// Public author profile
router.get(
  "/:username",
  getUserProfile
);

export default router;