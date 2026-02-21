import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getHomeContent,
  getAboutContent
} from "../controllers/content.controller.js";

const router = express.Router();

// Home page content
router.get("/home", protectRoute, getHomeContent);

// About page content
router.get("/about", protectRoute, getAboutContent);

export default router;
