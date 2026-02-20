import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        dueAt: {
            type: Date,
            required: true,
            index: true
        },
        source: {
            type: String,
            enum: ["user", "anganwadi", "system"],
            default: "user"
        },
        refType: {
            type: String,
            enum: ["appointment", "medication", "custom", "checkup"],
            default: "custom"
        },
        refId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "refType"
        },
        status: {
            type: String,
            enum: ["pending", "completed", "cancelled"],
            default: "pending"
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "createdByModel"
        },
        createdByModel: {
            type: String,
            enum: ["User", "AnganwadiCenter"]
        }
    },
    { timestamps: true }
);

// Indexes for efficient queries
reminderSchema.index({ user: 1, status: 1, dueAt: 1 });
reminderSchema.index({ refId: 1, refType: 1 });

const Reminder = mongoose.model("Reminder", reminderSchema);
export default Reminder;
