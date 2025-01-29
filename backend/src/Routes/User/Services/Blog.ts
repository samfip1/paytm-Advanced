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







app.post('/user/signin/blog/create_blog', authenticateToken ,async (req, res) => {
    
    const {userid, content, username, HeadingOfContent} = req.body;

    if (!userid || !content || !username || !HeadingOfContent) {
        res.status(400).json({ error: "All the information is not provided" });
        return
    }
    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                userid : userid
            }
        })
        if(!existingUser) {
            throw new Error("User Not found");            
        }

        if(content == "" || HeadingOfContent == "") {
            throw new Error("PLease enter Content to post the information");            
        }

        const contentId  = Math.random() * 52839759483475;
        const blogUser = await prisma.blog.create({
            data: {
                content: content,
                contentId: contentId,
                numberOflike: 0,
                username: username,
                HeadingOfContent : HeadingOfContent
            }
        })
        res.status(200).json({blogUser})
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something Went wrong"
        res.json({errorMessage})
    }
})



app.get('/user/signin/blog', authenticateToken, async (req, res) => {
    const { userid } = req.body;


    if (!userid) {
        res.status(400).json({ error: 'userid is required' });
        return;
    }

    try {
        let blogs = await prisma.blog.findMany({
            where: {
                contentId: {
                    not: Number(userid), // Exclude blogs where `contentId` matches the user's ID.
                },
            },
        });

        // Shuffle the blogs array
        blogs = blogs.sort(() => Math.random() - 0.5);

        res.status(200).json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/user/signin/blog/like_comment', authenticateToken, async (req, res) => {
    const { userid , contentId} = req.body; // Assuming `userid` is provided as a query parameter.

    if (!userid || !contentId) {
        res.status(400).json({ error: 'userid is required' });
        return
    }
    try {
        const like_comment = await prisma.blog.update({
            where: {
            contentId: contentId
            }, 
            data: {
            numberOflike: {
                increment: 1
            }
            }
        });

        res.status(200).json({like_comment})

    } catch (error) {
        console.error('Error Liking blogs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
