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





router.post('/blog/create_blog', authenticateToken ,async (req, res) => {
    
    const { content, username, HeadingOfContent} = req.body;

    if ( !content || !username || !HeadingOfContent) {
        res.status(400).json({ error: "All the information is not provided" });
        return
    }
    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                username : username
            }
        })
        if(!existingUser) {
            throw new Error("User Not found");            
        }

        if(content == "" || HeadingOfContent == "") {
            throw new Error("PLease enter Content to post the information");            
        }

       

const uniqueTimestamp = Date.now();
const uniqueUuid = uuidv4();

// Combine UUIDv4 and timestamp for an even more unique identifier
const uniqueUserId = `${uniqueUuid}-${uniqueTimestamp}`;


        const blogUser = await prisma.blog.create({
            data: {
                content: content,
                contentId: uniqueUserId,
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



router.get('/blog', authenticateToken, async (req, res) => {
    const { username } = req.body;


    if (!username) {
        res.status(400).json({ error: 'username is required' });
        return;
    }

    try {
        let blogs = await prisma.blog.findMany({});

        // Shuffle the blogs array
        blogs = blogs.sort(() => Math.random() - 0.5);

        res.status(200).json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/blog/like_comment', authenticateToken, async (req, res) => {
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




export default router