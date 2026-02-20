import mongoose from "mongoose";

/**
 * CRITICAL: Do not edit without reviewing related modules.
 * This affects pregnancy/baby lifecycle logic.
 * Vaccination schedule is auto-calculated from baby DOB.
 * Reminders can be set by mother or Anganwadi worker.
 */

// Pre-defined vaccination schedule for Indian immunization programme
// CRITICAL: Do not edit without reviewing related modules.
// This affects pregnancy/baby lifecycle logic.
export const VACCINATION_SCHEDULE = [
    { name: "BCG", weeksDue: 0, description: "Bacillus Calmette-Guérin – Tuberculosis prevention" },
    { name: "OPV-0", weeksDue: 0, description: "Oral Polio Vaccine – Birth dose" },
    { name: "Hepatitis B – Birth Dose", weeksDue: 0, description: "Hepatitis B prevention – Birth dose" },
    { name: "OPV-1", weeksDue: 6, description: "Oral Polio Vaccine – 1st dose" },
    { name: "Pentavalent-1", weeksDue: 6, description: "DPT + Hep B + Hib – 1st dose" },
    { name: "Rotavirus-1", weeksDue: 6, description: "Rotavirus – 1st dose" },
    { name: "IPV-1", weeksDue: 6, description: "Injectable Polio Vaccine – 1st dose" },
    { name: "PCV-1", weeksDue: 6, description: "Pneumococcal conjugate vaccine – 1st dose" },
    { name: "OPV-2", weeksDue: 10, description: "Oral Polio Vaccine – 2nd dose" },
    { name: "Pentavalent-2", weeksDue: 10, description: "DPT + Hep B + Hib – 2nd dose" },
    { name: "Rotavirus-2", weeksDue: 10, description: "Rotavirus – 2nd dose" },
    { name: "OPV-3", weeksDue: 14, description: "Oral Polio Vaccine – 3rd dose" },
    { name: "Pentavalent-3", weeksDue: 14, description: "DPT + Hep B + Hib – 3rd dose" },
    { name: "Rotavirus-3", weeksDue: 14, description: "Rotavirus – 3rd dose" },
    { name: "IPV-2", weeksDue: 14, description: "Injectable Polio Vaccine – 2nd dose" },
    { name: "PCV-2", weeksDue: 14, description: "Pneumococcal conjugate vaccine – 2nd dose" },
    { name: "Measles/MR-1", weeksDue: 39, description: "Measles/Rubella – 1st dose (9 months)" },
    { name: "Vitamin A – 1st Dose", weeksDue: 39, description: "Vitamin A supplementation – 9 months" },
    { name: "JE-1", weeksDue: 39, description: "Japanese Encephalitis – 1st dose (endemic areas)" },
    { name: "PCV – Booster", weeksDue: 39, description: "Pneumococcal conjugate – booster" },
    { name: "DPT Booster-1", weeksDue: 72, description: "DPT Booster – 1st (16-24 months)" },
    { name: "OPV Booster", weeksDue: 72, description: "Oral Polio – Booster (16-24 months)" },
    { name: "Measles/MR-2", weeksDue: 72, description: "Measles/Rubella – 2nd dose (16-24 months)" },
    { name: "JE-2", weeksDue: 72, description: "Japanese Encephalitis – 2nd dose" },
    { name: "Vitamin A – 2nd-9th Dose", weeksDue: 72, description: "Vitamin A – every 6 months from 16 months" },
];

const vaccinationSchema = new mongoose.Schema(
    {
        baby: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Baby",
            required: true,
        },
        vaccineName: {
            type: String,
            required: true,
        },
        dueDate: {
            type: Date,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["pending", "completed", "overdue", "skipped"],
            default: "pending",
        },
        completedAt: Date,
        notes: String,
    },
    { timestamps: true }
);

vaccinationSchema.index({ baby: 1, dueDate: 1 });

const Vaccination = mongoose.model("Vaccination", vaccinationSchema);
export default Vaccination;
