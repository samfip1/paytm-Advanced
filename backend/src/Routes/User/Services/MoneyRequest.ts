import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authenticateToken } from "../Middleware/auth.middleware";
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const app = express();


const router = express.Router();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

        import { v4 as uuidv4 } from 'uuid';




router.post('/Money_request', authenticateToken, async (req, res) => {
    const { receiverUsername, senderusername, money, message } = req.body;

    if (!receiverUsername || !senderusername || !money || !message) {
        res.status(400).json({ error: "All the information is not provided" });
        return
    }
    try {
        const moneytakerusername = await prisma.user.findFirst({
            where: { username: senderusername },
            select: { Money: true, userid: true },
        });

        const moneysenderusername = await prisma.user.findFirst({
            where: { username: receiverUsername },
            select: { Money: true, username: true , userid: true },
        });

        if (!moneysenderusername) {
            throw new Error("Sender Username is not available");
        }
        if (!moneytakerusername) {
            throw new Error("Receiver Username is not available");
        }



        const uniqueTimestamp = Date.now();
        const uniqueUuid = uuidv4();
        
        // Combine UUIDv4 and timestamp for an even more unique identifier
        const uniqueUserId = `${uniqueUuid}-${uniqueTimestamp}`;
        
        
        const requesting_user = await prisma.moneyRequest.create({
            data: {
                moneyRequestId: uniqueUserId,
                money: money,
                reciverId: moneysenderusername.userid,
                senderId: moneytakerusername.userid,
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



router.post('/request_for_approval', authenticateToken, async (req, res) => {
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




export default router