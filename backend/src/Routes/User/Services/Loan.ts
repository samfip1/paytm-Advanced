import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authenticateToken } from "../Middleware/auth.middleware";
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const app = express();


import { v4 as uuidv4 } from 'uuid'; 


const router = express.Router();

import cron from 'node-cron';


app.use(cors());
app.use(express.json());
app.use(cookieParser());







router.post('/apply_for_loan', authenticateToken, async (req, res) => {
    const { username, loan_Money, time } = req.body;

    if (!username || !loan_Money || !time) {
        res.status(400).json({ error: "userid is required" });
        return
    }


    try {
        await prisma.$transaction(async (tx) => {
            // Find the user by username
            const existingUser = await tx.user.findFirst({
                where: { username },
                select: { id: true, Money: true }
            });

            if (!existingUser) {
                throw new Error("Username not found");
            }

            // Apply business logic to calculate the loan limit (here it's a fixed limit)
            const maxLoanLimit = existingUser.Money * 2; // Maximum loan is double the user's current money
            const rateOfInterest = 9.86 - (Math.random() * 0.02 * time); // Interest rate decreases with time

            if (loan_Money <= maxLoanLimit) {
                const loanId = uuidv4(); // Generate a unique loan ID using UUID

                await tx.loan.create({
                    data: {
                        loanId, // Unique loan ID
                        loanMoney: loan_Money,
                        time,
                        interest: rateOfInterest,
                        repaymentDate: new Date(Date.now() + time * 30 * 24 * 60 * 60 * 1000), // time in months
                        userId: existingUser.id
                    }
                });

                // Update user's money after loan application
                await tx.user.update({
                    where: { id: existingUser.id },
                    data: { 
                        Money: Number(existingUser.Money) + loan_Money ,
                        CreditScore: {
                            increment: 16
                        }
                    }
                });

                res.status(200).json({ message: "Loan applied successfully" });
            } else {
                throw new Error("Loan exceeds the maximum limit based on your current money");
            }
        });
    } catch (error) {
        console.error("Error applying for loan:", error);
        const errorMessage = error instanceof Error ? error.message : "Something went wrong"
        res.status(500).json({errorMessage });
    }
});

cron.schedule('0 0 * * *', async () => {
    try {
        const overdueLoans = await prisma.loan.findMany({
            where: {
                repaymentDate: { lte: new Date() },
                status: "pending"
            }
        });

        for (const loan of overdueLoans) {
            const repaymentAmount = Number(loan.loanMoney) + (Number(loan.loanMoney) * Number(loan.interest) / 100);

            await prisma.$transaction(async (tx) => {
                const user = await tx.user.findFirst({
                    where: { id: loan.userId }
                });

                if (!user) {
                    console.error(`User with ID ${loan.userId} not found.`);
                    return;
                }

                // Check if the user has enough funds for repayment
                if (Number(user.Money) >= repaymentAmount) {
                    await tx.user.update({
                        where: { id: user.id },
                        data: { Money: Number(user.Money) - repaymentAmount }
                    });

                    // Mark loan as "repaid"
                    await tx.loan.update({
                        where: { id: loan.id },
                        data: { status: "repaid" }
                    });
                } else {
                    console.error(`User with ID ${user.id} has insufficient funds for repayment.`);
                    // Mark loan as "defaulted"
                    await tx.loan.update({
                        where: { id: loan.id },
                        data: { status: "defaulted" }
                    });
                }
            });
        }
    } catch (error) {
        console.error("Error processing loan repayments:", error);
    }
});



export default router