import mongoose from "mongoose";

const yogaSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        generatedPlan: {
            type: Object, // Stores JSON structure
            required: true
        },
        week: Number
    },
    { timestamps: true }
);

const Yoga = mongoose.model("Yoga", yogaSchema);
export default Yoga;
