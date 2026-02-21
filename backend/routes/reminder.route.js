import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    getMyReminders,
    updateReminderStatus,
    getUpcomingReminders
} from "../controllers/reminder.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

router.get("/me", getMyReminders);
router.get("/upcoming", getUpcomingReminders);
router.patch("/:id", updateReminderStatus);

export default router;
