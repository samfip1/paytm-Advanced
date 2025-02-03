import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as dotenv from 'dotenv';
dotenv.config();
import endpointsConfig from "../Middleware/endpoints.config";
import { authenticateToken } from "../Middleware/auth.middleware";
    import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const router = express.Router();
const SECRET_KEY = endpointsConfig.SK;

// Middleware
router.use(cors());
router.use(express.json());
router.use(cookieParser());

// Utility function to convert BigInt values to strings
const convertBigIntToString = (obj: any): any => {
    return JSON.parse(
        JSON.stringify(obj, (_, value) => (typeof value === "bigint" ? value.toString() : value))
    );
};






// Leaderboard Route
router.get('/leaderboard', authenticateToken, async (req, res) => {
    try {
        const leaderboardData = await prisma.leaderboard.findMany({
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        email: true,
                        Money: true,
                        totalTransactionDone: true,
                    },
                },
            },
            orderBy: { totalTransactionMoney: 'desc' }, // Sort leaderboard by total money
        });

        if (leaderboardData.length === 0) {
            res.status(200).json({ message: "No leaderboard data available." });
            return
        }

        const leaderboard = leaderboardData.map((entry, index) => ({
            rank: index + 1, // Assign rank based on position
            totalTransactionMoney: convertBigIntToString(entry.totalTransactionMoney),
            users: entry.users
                .sort((a, b) => Number(b.Money) - Number(a.Money)) // Sort users by Money
                .map((u) => ({
                    id: u.id,
                    name: u.name,
                    username: u.username,
                    email: u.email,
                    Money: convertBigIntToString(u.Money),
                    totalTransactionDone: u.totalTransactionDone,
                })),
        }));

        res.status(200).json({ leaderboard });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard data.' });
    }
});


export default router