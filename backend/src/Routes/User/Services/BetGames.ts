import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authenticateToken } from "../Middleware/auth.middleware";
import * as dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();
const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

router.post("/", authenticateToken, async (req, res) => {
    const { username, bet_number_choice, input_number } = req.body;

    if (
        !username ||
        bet_number_choice === undefined ||
        input_number === undefined ||
        typeof bet_number_choice !== "number" ||
        typeof input_number !== "number" ||
        input_number <= 0 ||
        bet_number_choice <= 0
    ) {
        res.status(400).json({
            success: false,
            error: "Invalid input data. Please provide a valid username, bet_number_choice, and a positive input_number.",
        });
        return;
    }

    try {
        const gamblingUser = await prisma.user.findUnique({
            where: {
                username: username.toString(),
            },
            select: {
                Money: true,
                id: true,
                CreditScore: true,
            },
        });

        if (!gamblingUser) {
            res.status(404).json({
                success: false,
                error: "User not found",
            });
            return;
        }

        if (gamblingUser.Money < input_number) {
            res.status(400).json({
                success: false,
                error: "Insufficient funds",
            });
            return;
        }

        const randomNumber = Math.floor(Math.random() * 10) + 1;

        const userWon = randomNumber === bet_number_choice;

        let moneyChange = 0;
        let creditScoreChange = 0;

        if (userWon) {
            moneyChange = input_number * 5;
            creditScoreChange = 10;
        } else {
            moneyChange = -input_number;
            creditScoreChange = -5;
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: gamblingUser.id,
            },
            data: {
                Money: {
                    increment: moneyChange,
                },
                CreditScore: {
                    increment: creditScoreChange,
                },
            },
            select: {
                Money: true,
                CreditScore: true,
            },
        });

        await prisma.bet.create({
            data: {
                userId: gamblingUser.id,
                betAmount: input_number,
                betChoice: bet_number_choice,
                actualNumber: randomNumber,
                won: userWon,
                moneyChange: moneyChange,
                timestamp: new Date(),
            },
        });

        res.json({
            success: true,
            result: {
                won: userWon,
                randomNumber,
                betChoice: bet_number_choice,
                moneyChange,
                newBalance: updatedUser.Money,
                newCreditScore: updatedUser.CreditScore,
            },
        });
        return;
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            success: false,
            error: "Database error occurred",
        });
        return;
    }
});

export default router;
