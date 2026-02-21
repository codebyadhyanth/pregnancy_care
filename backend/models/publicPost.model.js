import mongoose from "mongoose";

const publicPostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            default: null
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AnganwadiCenter",
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

// Indexes for efficient queries
publicPostSchema.index({ isActive: 1, createdAt: -1 });
publicPostSchema.index({ createdBy: 1 });

const PublicPost = mongoose.model("PublicPost", publicPostSchema);
export default PublicPost;
