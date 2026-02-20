import express from "express";
import { attachMcpId, completeVisit, getMcpData } from "../controllers/mcp.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute); // User MUST be logged in

router.post("/attach", attachMcpId);
router.patch("/visit-complete", completeVisit);
router.get("/me", getMcpData);

export default router;
