import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    activity: {
      type: String,
      required: true
    },
    duration: {
      type: Number, // in minutes
      required: true
    },
    aiRecommendation: Object // Stores JSON structure
  },
  { timestamps: true }
);

const Exercise = mongoose.model("Exercise", exerciseSchema);
export default Exercise;
