import mongoose from "mongoose";

const personalSuggestionSchema = new mongoose.Schema(
    {
        motherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        anganwadiId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AnganwadiCenter",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true
        },
        category: {
            type: String,
            enum: ["nutrition", "medication", "appointment", "general"],
            default: "general"
        },
        scheduleDate: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            enum: ["pending", "completed"],
            default: "pending"
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

// Indexes for efficient queries
personalSuggestionSchema.index({ motherId: 1, status: 1 });
personalSuggestionSchema.index({ anganwadiId: 1 });
personalSuggestionSchema.index({ motherId: 1, isActive: 1, createdAt: -1 });

const PersonalSuggestion = mongoose.model("PersonalSuggestion", personalSuggestionSchema);
export default PersonalSuggestion;
