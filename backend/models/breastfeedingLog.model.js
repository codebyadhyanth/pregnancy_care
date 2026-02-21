import mongoose from "mongoose";

const breastfeedingLogSchema = new mongoose.Schema(
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
        morning: {
            type: Boolean,
            default: false,
        },
        afternoon: {
            type: Boolean,
            default: false,
        },
        evening: {
            type: Boolean,
            default: false,
        },
        notes: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

breastfeedingLogSchema.index({ baby: 1, date: -1 });

const BreastfeedingLog = mongoose.model("BreastfeedingLog", breastfeedingLogSchema);
export default BreastfeedingLog;
