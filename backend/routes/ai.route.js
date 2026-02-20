import express from "express";
import "dotenv/config";
import { generateOllamaResponse } from "../controllers/ai.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/advice", protectRoute, generateOllamaResponse);

export default router;
