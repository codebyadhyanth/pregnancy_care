import mongoose from "mongoose";

const trackingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        week: {
            type: Number,
            required: true
        },
        motherWeight: Number,
        weightLog: [Number], // Deprecated but kept for compatibility
        steps: {
            type: Number,
            default: 0
        },
        distanceKm: {
            type: Number,
            default: 0
        },
        waterIntakeLiters: {
            type: Number,
            default: 0
        },
        symptoms: [String],
        notes: String
    },
    { timestamps: true }
);

const Tracking = mongoose.model("Tracking", trackingSchema);
export default Tracking;
