import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authenticateToken } from "../Middleware/auth.middleware";
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());
app.use(cookieParser());



/**
 * Send Friend Request
 */
router.post('/send-request', authenticateToken, async (req, res) => {
    const { senderUsername, receiverId, receiverUsername } = req.body;

    try {
        const existingUser = await prisma.user.findFirst({
            where: { username: senderUsername },
            select: { userid: true }
        });

        if (!existingUser) {
            res.status(404).json({ error: "Sender username not found" });
            return
        }

        const receiverUser = await prisma.user.findFirst({
            where: { userid: receiverId }
        });

        if (!receiverUser) {
            res.status(404).json({ error: "Receiver user not found" });
            return
        }

        // Check if request already exists
        const existingRequest = await prisma.requestFriend.findFirst({
            where: { userId: receiverId, username: senderUsername }
        });

        if (existingRequest) {
            res.status(400).json({ error: "Friend request already sent" });
            return
        }

        // Add to sender's sentRequests
        await prisma.sentRequest.create({
            data: { userId: existingUser.userid, username: receiverUsername }
        });

        // Add to receiver's receivedRequests
        await prisma.requestFriend.create({
            data: { userId: receiverId, username: senderUsername }
        });

        // Increment totalRequests
        await prisma.user.update({
            where: { userid: receiverId },
            data: { totalRequests: { increment: 1 } }
        });

        res.json({ message: 'Friend request sent successfully.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send friend request' });
    }
});





/**
 * Accept Friend Request
 */
router.post('/accept-request', authenticateToken, async (req, res) => {
    const { userId, friendId } = req.body;

    try {
        // Check if they are already friends
        const existingFriendship = await prisma.friend.findFirst({
            where: { userId, friendId }
        });

        if (existingFriendship) {
            res.status(400).json({ error: "Already friends" });
            return
        }

        // Add both users as friends
        await prisma.friend.createMany({
            data: [
                { userId, friendId },
                { userId: friendId, friendId: userId }
            ]
        });

        // Remove from receivedRequests
        await prisma.requestFriend.deleteMany({
            where: { userId, username: friendId }
        });

        // Remove from sender's sentRequests
        await prisma.sentRequest.deleteMany({
            where: { userId: friendId, username: userId }
        });

        res.json({ message: 'Friend request accepted successfully.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to accept friend request' });
    }
});




/**
 * Get All Friends of Logged-in User
 */
router.get('/allFriends', authenticateToken, async (req, res) => {
    const { userid } = req.body; // Extract from authenticated user

    try {
        // Find the user's friends
        const allFriends = await prisma.friend.findMany({
            where: { userId: userid },
            select: { friendId: true }
        });

        res.status(200).json({ friends: allFriends });

    } catch (error) {
        console.error("Error fetching friends:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});




/**
 * Get Friends by User ID (Only for Authenticated User)
 */
router.get('/friends', authenticateToken, async (req, res) => {
    const { userid } = req.body;

    try {
        const friends = await prisma.friend.findMany({
            where: { userId: userid },
            select: { friendId: true }
        });

        res.json(friends);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch friends list' });
    }
});



export default router;
