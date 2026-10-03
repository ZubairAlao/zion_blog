import express from "express";

import {
  createPost,
  getPosts,
  getPost, updatePost, deletePost
} from "../controllers/post.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getPosts);

router.get("/:slug", getPost); 

router.post("/",requireAuth, createPost);
router.patch("/:id", requireAuth, updatePost);
router.delete("/:id", requireAuth, deletePost);

export default router;