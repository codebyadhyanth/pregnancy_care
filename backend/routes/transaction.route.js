import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    getBankAccounts,
    addBankAccount,
    getSchemeCatalog,
    applyToScheme,
    simulateCredit,
    getTransactions,
    getTransactionSummary,
} from "../controllers/transaction.controller.js";

const router = express.Router();

// Bank Accounts
router.get("/bank-accounts", protectRoute, getBankAccounts);
router.post("/bank-accounts", protectRoute, addBankAccount);

// Scheme Catalog
router.get("/scheme-catalog", protectRoute, getSchemeCatalog);

// Transactions
router.get("/", protectRoute, getTransactions);
router.get("/summary", protectRoute, getTransactionSummary);
router.post("/apply", protectRoute, applyToScheme);
router.post("/:transactionId/simulate-credit", protectRoute, simulateCredit);

export default router;
