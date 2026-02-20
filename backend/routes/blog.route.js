import express from "express";
import { getBlogs, createBlog } from "../controllers/blog.controller.js";
// import { protectRoute } from "../middleware/auth.middleware.js"; // Optional if blogs are public

const router = express.Router();

router.get("/", getBlogs);
router.post("/", createBlog); // For admin or seeding

export default router;
