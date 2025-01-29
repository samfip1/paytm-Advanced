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



// Function to check if the user is valid and create a new user
const isValidUser = async (user: User) => {
    const { username, password, name, email, phone , transaction_Pin} = user;

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
    // Generate a unique user ID and hashed password
    const userId = Math.floor(Math.random() * 10000000);
    const hashedPassword = bcrypt.hashSync(password, 12);

    const reffralId = Math.random() * 2049578204872234;
    

    // Generate a random money value
    const randomMoney = Math.floor(Math.random() * (1000000000 - 10000000 + 1)) + 10000000;

    await prisma.transactionpin.create({
        data: {
            transaction_pin: transaction_Pin
        }
    })
    // Create a new user in the database
    const newUser = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
            name,
            email,
            Money: randomMoney,
            phone,
            userid: userId,
            referralId: reffralId,
            CreditScore : 0,
            
        },
    });

    return newUser;
};







// Signup Route
router.post("/SignUp", async (req, res) => {
    const { username, password, name, email , phone, transaction_Pin} = req.body;

    if (!username || !password  || !name || !email || !phone || !transaction_Pin) {
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
            userid:0,
            transaction_Pin: transaction_Pin
        });



                                        // JWT SIGNIN
        const token = jwt.sign(             
            { id: newUser.id, username: newUser.username },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

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
                createAt: newUser.createdAt,
                userid: newUser.userid
            },
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        res.status(500).json({ message: errorMessage });
    }
});



export default router