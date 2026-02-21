import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    completeOnboarding,
    updateTracking,
    getTracking,
    logNutrition,
    getNutrition,
    logExercise,
    getExercise,
    generateYogaPlan,
    getYogaPlans,
    addMedication,
    getMedications,
    deleteMedication,
    getAlertStatus,
    getNutritionSuggestions,
    addAppointment,
    getAppointments,
    deleteAppointment,
    getUpdatesSlider
} from "../controllers/dashboard.controller.js";

import { checkOnboarding } from "../middleware/onboarding.middleware.js";

const router = express.Router();

// Onboarding route (No check needed, obviously)
router.post("/onboarding", protectRoute, completeOnboarding);

// Tracking routes (Allow access without strict onboarding check)
router.get("/tracking", protectRoute, getTracking);
router.post("/tracking", protectRoute, updateTracking);

// Updates Slider (5th Card data)
router.get("/updates-slider", protectRoute, getUpdatesSlider);

// All other dashboard routes require onboarding.
// NOTE: protectRoute MUST stay here — routes below this line do NOT have protectRoute individually.
// router.use() here is what authenticates (sets req.user) AND checks onboarding for all of them.
router.use(protectRoute, checkOnboarding);

router.post("/nutrition", logNutrition);
router.post("/nutrition/suggestions", getNutritionSuggestions);
router.get("/nutrition", getNutrition);

router.get("/alerts/status", getAlertStatus);

router.post("/exercise", logExercise);
router.get("/exercise", getExercise);

router.post("/yoga", generateYogaPlan);
router.get("/yoga", getYogaPlans);

router.post("/medication", addMedication);
router.get("/medication", getMedications);
router.delete("/medication/:id", deleteMedication);

router.post("/appointments", addAppointment);
router.get("/appointments", getAppointments);
router.delete("/appointments/:id", deleteAppointment);

export default router;
