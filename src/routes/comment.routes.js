import express from "express";

import {
  createComment,
  getPostComments,
  updateComment,
  deleteComment
} from "../controllers/comment.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();


// Public
router.get(
  "/posts/:postId", 
  getPostComments
);


// Authenticated
router.post(
  "/posts/:postId", 
  requireAuth,
  createComment
);

router.patch(
  "/:id",
  requireAuth,
  updateComment
);

router.delete(
  "/:id",
  requireAuth,
  deleteComment
);


export default router;