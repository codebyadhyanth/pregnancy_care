import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    medicineName: {
      type: String,
      required: true
    },
    dosage: String,
    time: String,
    frequency: String,
    reminderEnabled: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Medication = mongoose.model("Medication", medicationSchema);
export default Medication;
