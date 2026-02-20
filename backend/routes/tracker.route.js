import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  addMedication,
  getMedications,
  deleteMedication,
  addExercise,
  getExercises
} from "../controllers/tracker.controller.js";

const router = express.Router();

/* ================= MEDICATION ================= */

// Add medication
router.post("/medication", protectRoute, addMedication);

// Get medications
router.get("/medication", protectRoute, getMedications);

// Delete medication
router.delete("/medication/:id", protectRoute, deleteMedication);

/* ================= EXERCISE ================= */

// Add exercise
router.post("/exercise", protectRoute, addExercise);

// Get exercises
router.get("/exercise", protectRoute, getExercises);

export default router;
