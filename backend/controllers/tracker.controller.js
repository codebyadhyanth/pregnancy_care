import Medication from "../models/medication.model.js";
import Exercise from "../models/exercise.model.js";

/* ================= MEDICATION ================= */

export const addMedication = async (req, res) => {
  try {
    const medication = await Medication.create({
      user: req.user._id,
      ...req.body
    });

    res.status(201).json(medication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMedications = async (req, res) => {
  try {
    const meds = await Medication.find({ user: req.user._id });
    res.json(meds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMedication = async (req, res) => {
  try {
    await Medication.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id, // 🔒 ensures user can delete only their own
    });

    res.json({ message: "Medication removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= EXERCISE ================= */

export const addExercise = async (req, res) => {
  try {
    const exercise = await Exercise.create({
      user: req.user._id,
      ...req.body
    });

    res.status(201).json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find({ user: req.user._id });
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExercise = async (req, res) => {
  try {
    await Exercise.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    res.json({ message: "Exercise removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
