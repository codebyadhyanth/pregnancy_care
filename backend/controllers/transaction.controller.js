import BankAccount from "../models/bankAccount.model.js";
import Transaction from "../models/transaction.model.js";

// ==============================
// BANK ACCOUNT ENDPOINTS
// ==============================

/**
 * GET /api/transactions/bank-accounts
 * List all bank accounts of the logged-in mother (masked)
 */
export const getBankAccounts = async (req, res) => {
    try {
        const accounts = await BankAccount.find({ mother: req.user._id }).sort({ isPrimary: -1, createdAt: -1 });

        const masked = accounts.map((a) => ({
            _id: a._id,
            bankName: a.bankName,
            maskedAccount: "XXXX" + a.accountNumber.slice(-4),
            ifscCode: a.ifscCode,
            isPrimary: a.isPrimary,
        }));

        res.json(masked);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * POST /api/transactions/bank-accounts
 * Add a new bank account
 */
export const addBankAccount = async (req, res) => {
    try {
        const { bankName, accountNumber, ifscCode, isPrimary } = req.body;

        if (!bankName || !accountNumber || !ifscCode) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // If this is primary, un-primary others
        if (isPrimary) {
            await BankAccount.updateMany({ mother: req.user._id }, { isPrimary: false });
        }

        const account = await BankAccount.create({
            mother: req.user._id,
            bankName: bankName.trim(),
            accountNumber: accountNumber.trim(),
            ifscCode: ifscCode.trim().toUpperCase(),
            isPrimary: !!isPrimary,
        });

        res.status(201).json({
            _id: account._id,
            bankName: account.bankName,
            maskedAccount: "XXXX" + account.accountNumber.slice(-4),
            ifscCode: account.ifscCode,
            isPrimary: account.isPrimary,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "This account is already linked" });
        }
        res.status(500).json({ message: error.message });
    }
};

// ==============================
// SCHEME APPLICATION / TRANSACTIONS
// ==============================

// Scheme catalog (demo) — matches frontend GovernmentSupport.jsx SCHEMES
const SCHEME_CATALOG = {
    pmmvy: { name: "Pradhan Mantri Matru Vandana Yojana (PMMVY)", totalAmount: 5000, installmentCount: 3 },
    jsy: { name: "Janani Suraksha Yojana (JSY)", totalAmount: 6000, installmentCount: 3 },
    jssk: { name: "Janani Shishu Suraksha Karyakram (JSSK)", totalAmount: 4000, installmentCount: 2 },
    icds: { name: "ICDS Supplementary Nutrition", totalAmount: 3000, installmentCount: 3 },
    pmjjby: { name: "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)", totalAmount: 2000, installmentCount: 1 },
    "pmmvy-bank": { name: "Jan Dhan Yojana (PMJDY)", totalAmount: 2000, installmentCount: 1 },
};

/**
 * GET /api/transactions/scheme-catalog
 * Returns available schemes with amounts
 */
export const getSchemeCatalog = async (_req, res) => {
    try {
        const catalog = Object.entries(SCHEME_CATALOG).map(([id, s]) => ({
            scheme_id: id,
            scheme_name: s.name,
            total_amount: s.totalAmount,
            installment_count: s.installmentCount,
        }));
        res.json(catalog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * POST /api/transactions/apply
 * Apply to a scheme — creates transaction record
 */
export const applyToScheme = async (req, res) => {
    try {
        const { schemeId, bankAccountId, confirmed } = req.body;

        if (!confirmed) {
            return res.status(400).json({ message: "Please confirm your application" });
        }

        if (!schemeId || !bankAccountId) {
            return res.status(400).json({ message: "Scheme and bank account are required" });
        }

        const scheme = SCHEME_CATALOG[schemeId];
        if (!scheme) {
            return res.status(404).json({ message: "Scheme not found" });
        }

        // Verify the bank account belongs to this user
        const bankAccount = await BankAccount.findOne({ _id: bankAccountId, mother: req.user._id });
        if (!bankAccount) {
            return res.status(400).json({ message: "Invalid bank account selected" });
        }

        // Build installments
        const perInstallment = Math.floor(scheme.totalAmount / scheme.installmentCount);
        const installments = [];
        for (let i = 1; i <= scheme.installmentCount; i++) {
            installments.push({
                installmentNumber: i,
                amount: perInstallment,
                status: "pending",
            });
        }

        const transaction = await Transaction.create({
            mother: req.user._id,
            schemeId,
            schemeName: scheme.name,
            totalAmount: scheme.totalAmount,
            installmentCount: scheme.installmentCount,
            installments,
            bankAccount: bankAccountId,
            status: "active",
        });

        res.status(201).json(transaction);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "You have already applied to this scheme" });
        }
        res.status(500).json({ message: error.message });
    }
};

/**
 * POST /api/transactions/:transactionId/simulate-credit
 * Demo: Simulate crediting the next pending installment
 */
export const simulateCredit = async (req, res) => {
    try {
        const { transactionId } = req.params;

        const transaction = await Transaction.findOne({ _id: transactionId, mother: req.user._id }).populate("bankAccount");
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Find next pending installment
        const pendingInstallment = transaction.installments.find((i) => i.status === "pending");
        if (!pendingInstallment) {
            return res.status(400).json({ message: "All installments already credited" });
        }

        // Set to processing
        pendingInstallment.status = "processing";
        await transaction.save();

        // Simulate 3-5 second delay, then credit
        const delay = 3000 + Math.random() * 2000;
        setTimeout(async () => {
            try {
                const tx = await Transaction.findById(transactionId).populate("bankAccount");
                const inst = tx.installments.find(
                    (i) => i.installmentNumber === pendingInstallment.installmentNumber
                );
                if (inst && inst.status === "processing") {
                    inst.status = "credited";
                    inst.creditedAt = new Date();

                    // Check if all installments are credited
                    const allCredited = tx.installments.every((i) => i.status === "credited");
                    if (allCredited) {
                        tx.status = "completed";
                    }
                    await tx.save();
                }
            } catch (err) {
                // Silent fail for background simulation
            }
        }, delay);

        const bankAcc = transaction.bankAccount;
        const maskedAccount = "XXXX" + bankAcc.accountNumber.slice(-4);

        res.json({
            message: `₹${pendingInstallment.amount} is being processed to ${bankAcc.bankName} (${maskedAccount})`,
            installmentNumber: pendingInstallment.installmentNumber,
            amount: pendingInstallment.amount,
            bankName: bankAcc.bankName,
            maskedAccount,
            estimatedDelay: Math.round(delay / 1000),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/transactions
 * Get all transactions for the logged-in mother
 */
export const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ mother: req.user._id })
            .populate("bankAccount")
            .sort({ createdAt: -1 });

        // Mask account numbers in response
        const sanitized = transactions.map((tx) => {
            const obj = tx.toObject();
            if (obj.bankAccount && obj.bankAccount.accountNumber) {
                obj.bankAccount.maskedAccount = "XXXX" + obj.bankAccount.accountNumber.slice(-4);
                delete obj.bankAccount.accountNumber;
            }
            return obj;
        });

        res.json(sanitized);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/transactions/summary
 * Dashboard summary cards data
 */
export const getTransactionSummary = async (req, res) => {
    try {
        const transactions = await Transaction.find({ mother: req.user._id });

        const totalSchemesApplied = transactions.length;
        let totalAmountEligible = 0;
        let totalAmountCredited = 0;
        let nextInstallmentDate = null;

        transactions.forEach((tx) => {
            totalAmountEligible += tx.totalAmount;
            tx.installments.forEach((inst) => {
                if (inst.status === "credited") {
                    totalAmountCredited += inst.amount;
                }
            });
            // Estimate next installment date as 30 days from the last credited date
            const lastCredited = tx.installments
                .filter((i) => i.status === "credited")
                .sort((a, b) => new Date(b.creditedAt) - new Date(a.creditedAt))[0];
            const hasPending = tx.installments.some((i) => i.status === "pending" || i.status === "processing");
            if (lastCredited && hasPending) {
                const next = new Date(lastCredited.creditedAt);
                next.setDate(next.getDate() + 30);
                if (!nextInstallmentDate || next < nextInstallmentDate) {
                    nextInstallmentDate = next;
                }
            }
        });

        res.json({
            totalSchemesApplied,
            totalAmountEligible,
            totalAmountCredited,
            nextInstallmentDate,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
