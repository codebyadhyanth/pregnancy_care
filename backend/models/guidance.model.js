import mongoose from "mongoose";

const guidanceSchema = new mongoose.Schema(
    {
        anganwadi: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AnganwadiCenter",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ["guidance", "announcement"],
            default: "guidance"
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

// Index for efficient lookup by centre
guidanceSchema.index({ anganwadi: 1, createdAt: -1 });

const Guidance = mongoose.model("Guidance", guidanceSchema);
export default Guidance;
