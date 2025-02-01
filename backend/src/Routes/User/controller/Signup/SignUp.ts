import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as dotenv from 'dotenv';
dotenv.config();
import endpointsConfig from "../../Middleware/endpoints.config";
const prisma = new PrismaClient();
const app = express();
const SECRET_KEY = endpointsConfig.SK;

const router = express.Router();

app.use(cors());
app.use(express.json());
app.use(cookieParser());









interface User {
    username: string;
    password: string;
    name: string;
    email: string;
    Money: number;
    phone: bigint;
    userid: number;
    transaction_Pin : number;
}

// Utility function to convert BigInt values to strings
const convertBigIntToString = (obj: any): any => {
    return JSON.parse(
        JSON.stringify(obj, (_, value) => (typeof value === "bigint" ? value.toString() : value))
    );
};

// Function to validate user and create a new account
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

    // Ensure at least one leaderboard entry exists
    let leaderboard = await prisma.leaderboard.findFirst();
    if (!leaderboard) {
        leaderboard = await prisma.leaderboard.create({
            data: { totalTransactionMoney: 0, rank: 0 },
        });
    }

    // Generate user ID, hashed password, and random initial money
    const userId = BigInt(Math.floor(Math.random() * 10000000));
    const hashedPassword = bcrypt.hashSync(password, 12);
    const referralId = BigInt(Math.floor(Math.random() * 204482234));
    const randomMoney = BigInt(Math.floor(Math.random() * (875888565 - 7856 + 1)) + 18976009);

    // Create the new user
    const newUser = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
            name,
            email,
            Money: randomMoney,
            phone,
            userid: userId,
            referralId,
            CreditScore: 0,
        },
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

// Signup Route
router.post("/", async (req, res) => {
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
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        res.status(500).json({ message: errorMessage });
    }
});

export default router;
