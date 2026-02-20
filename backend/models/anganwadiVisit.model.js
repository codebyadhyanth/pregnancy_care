import mongoose from "mongoose";

const anganwadiVisitSchema = new mongoose.Schema(
    {
        mom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        anganwadi: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AnganwadiCenter",
            required: true
        },
        nextVisitDate: {
            type: Date,
            required: true
        },
        type: {
            type: String,
            enum: ["checkup", "nutrition", "counseling", "general"],
            default: "general"
        },
        status: {
            type: String,
            enum: ["scheduled", "completed", "cancelled"],
            default: "scheduled"
        },
        notes: {
            type: String
        },
        completed: {
            type: Boolean,
            default: false
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AnganwadiCenter"
        }
    },
    { timestamps: true }
);

const AnganwadiVisit = mongoose.model("AnganwadiVisit", anganwadiVisitSchema);
export default AnganwadiVisit;
