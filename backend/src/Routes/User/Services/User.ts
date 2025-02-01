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

import { Request, Response } from "express";

const router = express.Router();

interface AuthenticatedRequest extends Request {
    user: {
        id: number;
        username: string;
    };
}
app.use(cors());
app.use(express.json());
app.use(cookieParser());








router.get("/balance", authenticateToken, async (req, res) => {

    const {username} = req.body
    if(!username) {
        throw new Error("Please Enter Username");        
    }

    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                username : username
            },
            select :{
                Money: true
            }
        })

        if (!existingUser) {
            throw new Error("Username does not Exist");            
        }

        res.json({
            message : existingUser.Money
        })
    } catch (error) {
        
    }
});



router.post('/update', authenticateToken, async (req, res) => {
    const { username, newUsername } = req.body;

    // Check if required fields are provided
    if (!username || !newUsername) {
        res.status(400).json({ message: "Username and newUsername are required" });
        return;
    }

    try {
        // Check if the new username already exists
        const updateUser = await prisma.user.findFirst({
            where: {
                username: newUsername
            }
        });

        if (updateUser) {
            res.status(400).json({
                message: "Username already exists"
            });
            return;
        }

        // Proceed with updating the username
        await prisma.user.update({
            where: {
                username: username
            },
            data: {
                username: newUsername
            }
        });

        res.status(200).json({
            message: "Username updated successfully",
            newUsername
        });

    } catch (error) {
        console.error("Error updating username:", error);
        res.status(500).json({
            message: "An error occurred while updating the username"
        });
    }
});







router.get("/account", authenticateToken, async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
        res.status(400).json({ message: "User information not found in request." });
        return;
    }

    try {
        // Fetch user details from the database using Prisma or any ORM
        const accountDetails = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                username: true,
                Money: true,
                phone: true,
                email: true,
                userid: true
            },
        });

        if (!accountDetails) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        res.status(200).json(accountDetails);
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});




export default router