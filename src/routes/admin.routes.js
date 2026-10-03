import express from "express";

import {
  getAllUsers,
  getAllPosts,
  getAllComments,
  deleteUser,
  deletePost,
  deleteComment
} from "../controllers/admin.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("ADMIN"));

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

router.get("/posts", getAllPosts);
router.delete("/posts/:id", deletePost);

router.get("/comments", getAllComments);
router.delete("/comments/:id", deleteComment);

export default router;