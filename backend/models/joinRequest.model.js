import mongoose from "mongoose";

const joinRequestSchema = new mongoose.Schema(
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
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },
        notes: {
            type: String
        }
    },
    { timestamps: true }
);

// Ensure a mom can only have one pending request per center
joinRequestSchema.index({ mom: 1, anganwadi: 1, status: 1 }, { unique: true, partialFilterExpression: { status: "pending" } });

const JoinRequest = mongoose.model("JoinRequest", joinRequestSchema);
export default JoinRequest;
