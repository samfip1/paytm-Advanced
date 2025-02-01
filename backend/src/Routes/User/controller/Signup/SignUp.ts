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
    phone: number;
    userid: number;
    transaction_Pin : number;
}


const isValidUser = async (user: User) => {
    const { username, password, name, email, phone, transaction_Pin } = user;

    // Check for duplicate email, username, or phone
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email }, 
                { username }, 
                { phone }
            ],
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

    // Ensure there is at least one leaderboard entry
    let leaderboard = await prisma.leaderboard.findFirst();
    if (!leaderboard) {
        leaderboard = await prisma.leaderboard.create({
            data: {
                totalTransactionMoney: 0,
                rank: 0,
            },
        });
    }

    // Generate a unique user ID and hashed password
    const userId = Math.floor(Math.random() * 10000000);
    const hashedPassword = bcrypt.hashSync(password, 12);
    const referralId = Math.floor(Math.random() * 204482234)
    const randomMoney = Math.floor(Math.random() * (875888565 - 7856 + 1)) + 18976009;

    // Create the new user and associate the leaderboardId
    const newUser = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
            name,
            email,
            Money: randomMoney,
            phone,
            userid: userId,
            referralId: referralId,
            CreditScore: 0,
            leaderboardId: leaderboard.id // Use the existing leaderboard's ID
        },
    });

    // Now that the user is created, insert the transaction pass
    await prisma.transaction_Pass.create({
        data: {
            user: {
                connect: { userid: newUser.userid }
            },
            transaction_Pin: transaction_Pin
        }
    });


    return newUser;
};




// Signup Route
router.post("/", async (req, res) => {
    const { username, password, name, email, phone, transaction_Pin } = req.body;


    if (!username || !password || !name || !email || !phone || !transaction_Pin) {
        res.status(400).json({ error: "All the required Information are not filled" });
        return
    }

    try {

        const newUser = await isValidUser({
            username,
            password,
            name,
            email,
            Money: 0,
            phone,
            userid: 0, // Temporary as userId is generated in the isValidUser function
            transaction_Pin
        });

        // Generate JWT token for the user
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        // Set token in cookie and respond with user details
        res.cookie("token", token, { httpOnly: true });
        res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser.id,
                username: newUser.username,
                name: newUser.name,
                email: newUser.email,
                money: newUser.Money,
                phone: newUser.phone,
                createdAt: newUser.createdAt,
                userid: newUser.userid
            },
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        res.status(500).json({ message: errorMessage });
    }
});



export default router