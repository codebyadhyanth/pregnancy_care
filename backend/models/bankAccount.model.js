import mongoose from "mongoose";

const bankAccountSchema = new mongoose.Schema(
    {
        mother: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        bankName: {
            type: String,
            required: true,
            trim: true,
        },
        accountNumber: {
            type: String,
            required: true,
            trim: true,
        },
        ifscCode: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },
        isPrimary: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Compound index to prevent duplicate accounts
bankAccountSchema.index({ mother: 1, accountNumber: 1 }, { unique: true });

const BankAccount = mongoose.model("BankAccount", bankAccountSchema);
export default BankAccount;
