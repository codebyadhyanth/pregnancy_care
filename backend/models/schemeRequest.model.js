import mongoose from "mongoose";

const schemeRequestSchema = new mongoose.Schema(
  {
    mother: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    anganwadi: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AnganwadiCenter",
      required: true,
    },
    schemeId: {
      type: String,
      required: true,
    },
    schemeTitle: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const SchemeRequest = mongoose.model("SchemeRequest", schemeRequestSchema);
export default SchemeRequest;

