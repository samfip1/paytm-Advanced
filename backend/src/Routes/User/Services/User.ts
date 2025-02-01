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

// Function to create a valid user and associate with leaderboard
const isValidUser = async (user: any) => {
    const { username, password, name, email, phone, transaction_Pin } = user;

    // Check for duplicate email, username, or phone
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { username }, { phone }],
        },
    });

    if (existingUser) {
        if (existingUser.email === email) {
            throw new Error("A user with this email already exists.");
        }
        if (existingUser.username === username) {
            throw new Error("A user with this username already exists.");
        }
        if (existingUser.phone === phone) {
            throw new Error("A user with this phone number already exists.");
        }
    }

    // Check if at least one leaderboard exists, or create a new one
    let leaderboard = await prisma.leaderboard.findFirst();
    if (!leaderboard) {
        leaderboard = await prisma.leaderboard.create({
            data: { totalTransactionMoney: 0, rank: 1 },
        });
    }

const uniqueTimestamp = Date.now();
const uniqueUuid = uuidv4();

// Combine UUIDv4 and timestamp for an even more unique identifier
const uniqueUserId = `${uniqueUuid}-${uniqueTimestamp}`;



    // Generate user ID, hashed password, and random initial money
    const userId = BigInt(Math.floor(Math.random() * 10000000));
    const hashedPassword = bcrypt.hashSync(password, 12);
    const referralId = BigInt(Math.floor(Math.random() * 204482234));
    const randomMoney = BigInt(Math.floor(Math.random() * (875888565 - 7856 + 1)) + 18976009);

    // Create the new user and associate with leaderboard
    const newUser = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
            name,
            email,
            Money: randomMoney,
            phone,
            userid: uniqueUserId,
            referralId,
            CreditScore: 0,
        },
        include: { leaderboard: true }, // Include leaderboard in response
    });

    // Insert transaction PIN
    await prisma.transaction_Pass.create({
        data: {
            user: { connect: { userid: newUser.userid } },
            transaction_Pin: transaction_Pin,
        },
    });

    return newUser;
};

// 📌 Signup Route
router.post("/signup", async (req, res) => {
    const { username, password, name, email, phone, transaction_Pin } = req.body;

    if (!username || !password || !name || !email || !phone || !transaction_Pin) {
        res.status(400).json({ error: "All required information must be provided" });
        return
    }

    try {
        const newUser = await isValidUser({
            username,
            password,
            name,
            email,
            Money: BigInt(0),
            phone: BigInt(phone),
            userid: BigInt(0), // Temporary placeholder
            transaction_Pin,
        });

        // Generate JWT token for authentication
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        // Set token in a secure HTTP-only cookie
        res.cookie("token", token, { httpOnly: true });

        // Send response with converted BigInt values
        res.status(201).json({
            message: "User created successfully",
            user: convertBigIntToString(newUser),
        });
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Something went wrong" });
    }
});

// 📌 Get Leaderboard Data (Fix: Ensure Users are Fetched)
router.get("/leaderboard", async (req, res) => {
    try {
        const leaderboards = await prisma.leaderboard.findMany({
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        Money: true,
                        totalTransactionDone: true,
                    },
                },
            },
            orderBy: { totalTransactionMoney: "desc" },
        });

        res.json(leaderboards.map(convertBigIntToString));
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch leaderboard data" });
    }
});




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