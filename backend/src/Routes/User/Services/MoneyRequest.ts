import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authenticateToken } from "./Middleware/auth.middleware";
import * as dotenv from 'dotenv';
dotenv.config();
import endpointsConfig from "./Routes/User/Middleware/endpoints.config";
const prisma = new PrismaClient();
const app = express();
const SECRET_KEY = endpointsConfig.SK;
import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid'; 
import zod from "zod";


const SECRET_KET_ADMIN = endpointsConfig.SK_Admin;
import { authorizeAdmin } from "./Middleware/admin.middleware";

import cron from 'node-cron';

interface AuthenticatedRequest extends Request {
    user: {
        id: number;
        username: string;
    };
}
app.use(cors());
app.use(express.json());
app.use(cookieParser());






app.post('/user/signin/Money_request', authenticateToken, async (req, res) => {
    const { recieverID, senderId, money, message } = req.body;

    if (!recieverID || !senderId || !money || !message) {
        res.status(400).json({ error: "All the information is not provided" });
        return
    }
    try {
        const moneytakerusername = await prisma.user.findFirst({
            where: { userid: senderId },
            select: { Money: true },
        });

        const moneysenderusername = await prisma.user.findFirst({
            where: { userid: recieverID },
            select: { Money: true, username: true },
        });

        if (!moneysenderusername) {
            throw new Error("Sender Username is not available");
        }
        if (!moneytakerusername) {
            throw new Error("Receiver Username is not available");
        }

        const moneyRequestId = Math.floor(Math.random() * 7234984375649829);

        const requesting_user = await prisma.moneyRequest.create({
            data: {
                moneyRequestId: moneyRequestId,
                money: money,
                reciverId: recieverID,
                senderId: senderId,
                message: message,
                status: "Pending",
            },
        });

        res.json({ requesting_user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error });
    }
});



app.post('/user/signin/request_for_approval', authenticateToken, async (req, res) => {
    const { moneyRequestId, action } = req.body; // `action` can be "accept" or "reject"

    if (!moneyRequestId || !action ) {
        res.status(400).json({ error: "All the information is not provided" });
        return
    }

    try {
        // Fetch the money request
        const moneyRequest = await prisma.moneyRequest.findFirst({
            where: { moneyRequestId },
        });

        if (!moneyRequest) {
            throw new Error("Invalid Money Request");
        }

        // Validate action
        if (action !== "accept" && action !== "reject") {
            throw new Error("Invalid action. Action must be either 'accept' or 'reject'");
        }

        // If action is "reject", update the status and return
        if (action === "reject") {
            await prisma.moneyRequest.update({
                where: { moneyRequestId },
                data: { status: "rejected" },
            });

            res.json({ message: "Money request rejected successfully" });
            return
        }

        // Action is "accept" — perform the money transfer
        const { money, senderId, reciverId } = moneyRequest;

        // Fetch sender and receiver details
        const sender = await prisma.user.findFirst({
            where: { userid: senderId },
            select: { Money: true },
        });

        const receiver = await prisma.user.findFirst({
            where: { userid: reciverId },
            select: { Money: true },
        });

        if (!sender || !receiver) {
            throw new Error("Sender or receiver not found");
        }

        if (sender.Money < money) {
            throw new Error("Insufficient balance in the sender's account");
        }

        // Perform the money transfer
        await prisma.user.update({
            where: { userid: senderId },
            data: { 
                Money: sender.Money - money,
                CreditScore: 12
            },
        });

        await prisma.user.update({
            where: { userid: reciverId },
            data: { 
                Money: receiver.Money + money, 
                CreditScore: {
                    decrement: 5
                }
            },
        });

        // Update the money request status
        await prisma.moneyRequest.update({
            where: { moneyRequestId },
            data: { status: "accepted" },
        });

        res.json({ message: "Money request accepted and processed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error });
    }
});