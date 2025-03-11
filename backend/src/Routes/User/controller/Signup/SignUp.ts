// Backend (server.js or similar)
import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as dotenv from 'dotenv';
dotenv.config();
import endpointsConfig from "../../Middleware/endpoints.config";
import { v4 as uuidv4 } from 'uuid';

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
    phone: bigint
    userid: string;
    transaction_Pin : number;
}

// Utility function to convert BigInt values to strings
const convertBigIntToString = (obj: any): any => {
    return JSON.parse(
        JSON.stringify(obj, (_, value) => (typeof value === "bigint" ? value.toString() : value))
    );
};

// Function to validate user and create a new account
const isValidUser = async (user: User) => {
    const { username, password, name, email, phone, transaction_Pin, userid } = user;  // Added userid here
    // Check for duplicate email, username, or phone
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { username },
                { phone },
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

    const hashedPassword = bcrypt.hashSync(password, 12);
    const referralId = BigInt(Math.floor(Math.random() * 204482234));
    const randomMoney = BigInt(Math.floor(Math.random() * (875888565 - 7856 + 1)) + 18976009);

    // Create the new user with a valid leaderboard reference
    try {
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name,
                email,
                Money: randomMoney,
                phone,
                userid,  // Use the userid passed into the function.
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
    }
    catch (error){
        console.log(error);
        throw error;
    }
};

// Signup Route
router.post("/", async (req, res) => {
    const { username, password, name, email, phone, transaction_Pin } = req.body;

    if (!username || !password || !name || !email || !phone || !transaction_Pin) {
        res.status(400).json({ error: "All required information must be provided" });
        return
    }

    try {

        const uniqueUserId = uuidv4();  // Generate UUID *inside* the handler
        const newUser = await isValidUser({
            username,
            password,
            name,
            email,
            Money: 0,
            phone: BigInt(phone), 
            userid:uniqueUserId ,
            transaction_Pin,
        });

        // Generate JWT token for authentication
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username },
            SECRET_KEY,
            { expiresIn: "1h" }
        );


        res.cookie("token", token, { httpOnly: true });


        res.status(201).json({
            message: "User created successfully",
            user: convertBigIntToString(newUser),
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        res.status(500).json({ message: errorMessage });
    }
});

router.get("/", async (req, res) => {
           res.status(200).json({
            message: "Backend running successfully",
        });
    } 
);

export default router;
