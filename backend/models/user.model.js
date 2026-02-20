import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profilePic: {
    type: String,
    default: "",
  },
  dueDate: {
    type: Date
  },
  pregnancyStartDate: {
    type: Date
  },
  pregnancyWeek: {
    type: Number,
    default: 1
  },
  dietPreference: {
    type: String,
    enum: ["veg", "non-veg", "vegan"],
    default: "veg"
  },
  medicalConditions: {
    type: [String]
  },
  isOnboarded: {
    type: Boolean,
    default: false
  },
  profile: {
    age: Number,
    height: Number,
    weight: Number,
    pregnancyWeek: Number,
    trimester: String,
    previousPregnancies: Number,
    medicalConditions: [String],
    allergies: [String],
    dietaryPreference: String,
    activityLevel: String,
    bloodPressureHistory: String,
    diabetesHistory: Boolean,
    medicationsCurrentlyTaking: [String],
    doctorNotes: String
  },

  // --- Anganwadi Integration ---
  mcpId: { type: String, unique: true, sparse: true }, // Renamed/New field for National MCP
  // momId: { type: String }, // Legacy - keeping if needed, but switching focus to mcpId

  linkedAnganwadi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AnganwadiCenter"
  },
  linkageStatus: {
    type: String,
    enum: ["linked", "unlinked"],
    default: "unlinked"
  },

  // Consent & Legal
  aiConsent: { type: Boolean, default: false },
  termsAccepted: { type: Boolean, default: false },
  termsAcceptedAt: { type: Date },

  migrationStatus: {
    type: String,
    enum: ["active", "released"],
    default: "active"
  },
  currentDistrict: {
    type: String
  },
  anganwadiHistory: [{
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AnganwadiCenter"
    },
    district: String,
    linkedAt: Date,
    unlinkedAt: Date,
    reason: String
  }],

  // --- Contact & Kin ---
  address: String, // Current Address
  permanentAddress: String,
  jurisdiction: String, // Ward or Village
  motherPhone: String,
  husbandName: String,
  fatherName: String, // User's Father
  husbandPhone: String,

  // --- Post-Pregnancy (nullable, non-breaking) ---
  postPregnancy: { type: Boolean, default: false },
  activeBabyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Baby",
    default: null,
  },
}, { timestamps: true });


userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


userSchema.methods.matchPassword = async function (enteredPassword) {
  const isPasswordCorrect = await bcrypt.compare(
    enteredPassword,
    this.password
  );
  return isPasswordCorrect;
};

const User = mongoose.model("User", userSchema);

export default User;
