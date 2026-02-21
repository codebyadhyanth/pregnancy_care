import mongoose from "mongoose";

const babyReminderSchema = new mongoose.Schema(
    {
        baby: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Baby",
            required: true,
        },
        createdBy: {
            type: String,
            enum: ["mother", "anganwadi"],
            default: "mother",
        },
        createdByUser: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "createdBy" === "anganwadi" ? "AnganwadiCenter" : "User",
        },
        title: {
            type: String,
            required: true,
        },
        description: String,
        date: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "completed", "dismissed"],
            default: "pending",
        },
    },
    { timestamps: true }
);

babyReminderSchema.index({ baby: 1, date: 1 });

const BabyReminder = mongoose.model("BabyReminder", babyReminderSchema);
export default BabyReminder;
