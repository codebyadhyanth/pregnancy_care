import mongoose from "mongoose";

const babyWeightLogSchema = new mongoose.Schema(
    {
        baby: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Baby",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        weight: {
            type: Number, // kg
            required: true,
        },
    },
    { timestamps: true }
);

babyWeightLogSchema.index({ baby: 1, date: -1 });

const BabyWeightLog = mongoose.model("BabyWeightLog", babyWeightLogSchema);
export default BabyWeightLog;
