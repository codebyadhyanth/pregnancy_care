import express from "express";
import "dotenv/config";
import {
  checkAuth,
  login,
  logout,
  signup,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
// router.post("/onboarding", protectRoute, onboard);

router.get("/me", protectRoute, checkAuth);

export default router;
