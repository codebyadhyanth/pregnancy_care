import mongoose from "mongoose";

/**
 * CRITICAL: Do not edit without reviewing related modules.
 * This affects pregnancy/baby lifecycle logic.
 * Baby record is created upon delivery confirmation.
 * Linked to mother (User) via mother_id.
 */
const babySchema = new mongoose.Schema(
    {
        mother: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        dob: {
            type: Date,
            required: true,
        },
        timeOfBirth: {
            type: String, // "HH:MM" 24h format
            required: true,
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
            required: true,
        },
        birthWeight: {
            type: Number, // in kg
            required: true,
        },
        name: {
            type: String,
            default: "",
        },
        // Anganwadi linkage (inherited from mother at creation time)
        linkedAnganwadi: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AnganwadiCenter",
        },
        // Health notes from Anganwadi
        healthRemarks: [
            {
                remark: String,
                addedBy: { type: String, enum: ["mother", "anganwadi"], default: "mother" },
                date: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

const Baby = mongoose.model("Baby", babySchema);
export default Baby;
