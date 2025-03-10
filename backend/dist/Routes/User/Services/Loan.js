"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_middleware_1 = require("../Middleware/auth.middleware");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const uuid_1 = require("uuid");
const router = express_1.default.Router();
const node_cron_1 = __importDefault(require("node-cron"));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
router.post('/apply_for_loan', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, loan_Money, time } = req.body;
    if (!username || !loan_Money || !time) {
        res.status(400).json({ error: "userid is required" });
        return;
    }
    try {
        yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Find the user by username
            const existingUser = yield tx.user.findFirst({
                where: { username },
                select: { id: true, Money: true, userid: true }
            });
            if (!existingUser) {
                throw new Error("Username not found");
            }
            // Apply business logic to calculate the loan limit (here it's a fixed limit)
            const maxLoanLimit = Number(existingUser.Money) * 2; // Maximum loan is double the user's current money
            const rateOfInterest = 9.86 - (Math.random() * 0.02 * time); // Interest rate decreases with time
            if (loan_Money <= maxLoanLimit) {
                const loanId = (0, uuid_1.v4)(); // Generate a unique loan ID using UUID
                yield tx.loan.create({
                    data: {
                        loanId, // Unique loan ID
                        loanMoney: loan_Money,
                        time,
                        interest: rateOfInterest,
                        repaymentDate: new Date(Date.now() + time * 30 * 24 * 60 * 60 * 1000), // time in months
                        userId: existingUser.userid
                    }
                });
                // Update user's money after loan application
                yield tx.user.update({
                    where: { id: existingUser.id },
                    data: {
                        Money: Number(existingUser.Money) + loan_Money,
                        CreditScore: {
                            increment: 16
                        }
                    }
                });
                res.status(200).json({ message: "Loan applied successfully" });
            }
            else {
                throw new Error("Loan exceeds the maximum limit based on your current money");
            }
        }));
    }
    catch (error) {
        console.error("Error applying for loan:", error);
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        res.status(500).json({ errorMessage });
    }
}));
node_cron_1.default.schedule('0 0 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const overdueLoans = yield prisma.loan.findMany({
            where: {
                repaymentDate: { lte: new Date() },
                status: "pending"
            }
        });
        for (const loan of overdueLoans) {
            const repaymentAmount = Number(loan.loanMoney) + (Number(loan.loanMoney) * Number(loan.interest) / 100);
            yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                const user = yield tx.user.findFirst({
                    where: { userid: loan.userId }
                });
                if (!user) {
                    console.error(`User with ID ${loan.userId} not found.`);
                    return;
                }
                // Check if the user has enough funds for repayment
                if (Number(user.Money) >= repaymentAmount) {
                    yield tx.user.update({
                        where: { id: user.id },
                        data: { Money: Number(user.Money) - repaymentAmount }
                    });
                    // Mark loan as "repaid"
                    yield tx.loan.update({
                        where: { id: loan.id },
                        data: { status: "repaid" }
                    });
                }
                else {
                    console.error(`User with ID ${user.id} has insufficient funds for repayment.`);
                    // Mark loan as "defaulted"
                    yield tx.loan.update({
                        where: { id: loan.id },
                        data: { status: "defaulted" }
                    });
                }
            }));
        }
    }
    catch (error) {
        console.error("Error processing loan repayments:", error);
    }
}));
exports.default = router;
