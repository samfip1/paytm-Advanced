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











app.post('/user/signin/send-request', authenticateToken ,async (req, res) => {
    const { senderId, receiverId, receiverUsername } = req.body;
  
    try {

        const existingUser = await prisma.user.findFirst({
            where : {
                userid: senderId
            }
        })
        if (!existingUser) {
            throw new Error("Username not found");            
        }

        const recieveruser = await prisma.user.findFirst({
            where : {
                userid: receiverId
            }
        })

        if(!recieveruser) {
            throw new Error("This username does not exist");            
        }

      // Add to sender's sentRequests
      await prisma.sentRequest.create({
        data: {
          userId: senderId,
          username: receiverUsername,
        },
      });
  
      // Add to receiver's receivedRequests
      await prisma.requestFriend.create({
        data: {
          userId: receiverId,
          username: receiverUsername,
        },
      });
  
      // Increment totalRequests
      await prisma.user.update({
        where: { id: receiverId },
        data: { totalRequests: { increment: 1 } },
      });
  
      res.json({ message: 'Friend request sent successfully.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send friend request' });
    }
});
  

app.post('/user/signinaccept-request', authenticateToken ,async (req, res) => {
    const { userId, friendId } = req.body;
  
    try {
      // Add to friendsList
      await prisma.friend.create({
        data: {
          userId,
          friendId,
        },
      });

      // Remove from receivedRequests
      await prisma.requestFriend.deleteMany({
        where: { userId: userId },
      });
  
      // Remove from sender's sentRequests
      await prisma.sentRequest.deleteMany({
        where: { userId: friendId },
      });
  
      res.json({ message: 'Friend request accepted successfully.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to accept friend request' });
    }
});



app.get('/user/signin/allFriend', authenticateToken, async (req, res) => {
    const { userid } = req.body; // Extracting the userid from the request body

    try {
        // Validate the input
        if (!userid) {
            res.status(400).json({ error: "userid is required" });
            return
        }

        // Find the user by userid
        const existingUser = await prisma.user.findFirst({
            where: { userid },
        });

        if (!existingUser) {
            res.status(404).json({ error: "User not found" });
            return
        }

        // Fetch all friends of the user
        const allFriends = await prisma.friend.findMany({
            where: { userId: existingUser.id },
        });

        // Return the list of friends
        res.status(200).json({ friends: allFriends });
        return

    } catch (error) {
        // Handle errors
        console.error("Error fetching friends:", error);
        res.status(500).json({ error: "Internal server error" });
        return
    }
});




app.get('/user/signin/friends/:userId', authenticateToken ,async (req, res) => {
    const { userId } = req.params;
  
    try {
      const friends = await prisma.friend.findMany({
        where: { userId: Number(userId) },
      });
  
      res.json(friends);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch friends list' });
    }
  });
  

