import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
import {
  createPost,
  getPosts,
  deletePost,
  likePost,
  replyPost
} from "../controllers/community.controller.js";

const router = express.Router();

// Create a community post with media
router.post("/post", protectRoute, upload.array('media', 5), createPost);

// Get all community posts
router.get("/posts", protectRoute, getPosts);

// Like a post
router.put("/post/:id/like", protectRoute, likePost);

// Reply to a post
router.post("/post/:id/reply", protectRoute, replyPost);

// Delete a post
router.delete("/post/:id", protectRoute, deletePost);

export default router;
