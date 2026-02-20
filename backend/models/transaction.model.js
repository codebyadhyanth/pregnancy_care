import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
    {
        mother: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        schemeId: {
            type: String,
            required: true,
        },
        schemeName: {
            type: String,
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        installmentCount: {
            type: Number,
            required: true,
            default: 3,
        },
        installments: [
            {
                installmentNumber: { type: Number, required: true },
                amount: { type: Number, required: true },
                status: {
                    type: String,
                    enum: ["pending", "processing", "credited"],
                    default: "pending",
                },
                creditedAt: { type: Date },
            },
        ],
        bankAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BankAccount",
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "completed", "cancelled"],
            default: "active",
        },
    },
    { timestamps: true }
);

// Prevent duplicate scheme applications by the same mother
transactionSchema.index({ mother: 1, schemeId: 1 }, { unique: true });

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
