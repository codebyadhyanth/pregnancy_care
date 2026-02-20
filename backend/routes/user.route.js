import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getProfile,
  updateProfile
} from "../controllers/user.controller.js";

const router = express.Router();

// Get user profile
router.get("/profile", protectRoute, getProfile);

// Update user profile
router.put("/profile", protectRoute, updateProfile);

export default router;
