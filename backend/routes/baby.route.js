import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    createBaby, getBabies, getBabyById,
    logBabyWeight, getBabyWeightLogs,
    logBreastfeeding, getBreastfeedingLogs,
    getVaccinations, updateVaccination,
    createBabyReminder, getBabyReminders, updateBabyReminder,
    addHealthRemark, getMonthlySummary,
    generateKundali, getDeliveryStatus,
} from "../controllers/baby.controller.js";

const router = express.Router();

// Delivery Status
router.get("/delivery-status", protectRoute, getDeliveryStatus);

// Baby CRUD
router.post("/", protectRoute, createBaby);
router.get("/", protectRoute, getBabies);
router.get("/:babyId", protectRoute, getBabyById);

// Weight
router.post("/:babyId/weight", protectRoute, logBabyWeight);
router.get("/:babyId/weight", protectRoute, getBabyWeightLogs);

// Breastfeeding
router.post("/:babyId/breastfeeding", protectRoute, logBreastfeeding);
router.get("/:babyId/breastfeeding", protectRoute, getBreastfeedingLogs);

// Vaccinations
router.get("/:babyId/vaccinations", protectRoute, getVaccinations);
router.put("/:babyId/vaccinations/:vaccinationId", protectRoute, updateVaccination);

// Reminders
router.post("/:babyId/reminders", protectRoute, createBabyReminder);
router.get("/:babyId/reminders", protectRoute, getBabyReminders);
router.put("/:babyId/reminders/:reminderId", protectRoute, updateBabyReminder);

// Health Remarks
router.post("/:babyId/remarks", protectRoute, addHealthRemark);

// Monthly Summary (AI)
router.get("/:babyId/monthly-summary", protectRoute, getMonthlySummary);

// Kundali + Name Generator (AI)
router.post("/:babyId/kundali", protectRoute, generateKundali);

export default router;
