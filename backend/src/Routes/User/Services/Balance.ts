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




router.get('/', authenticateToken ,async (req, res ) => {

    const {username } = req.body;

    if (!username) {
        res.status(400).json({ error: "All the information is not provided" });
    }

    try {
        const user = await prisma.user.findFirst({
            where : {
                username : username
            },
            select : {
                Money : true
            }
        })

        if (!user) {
            res.status(400).json({ error: "User not found" });
        }

        else
        {res.status(200).json({
            Money : Number(user.Money)
        })}

    }

    catch ( error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: "An unknown error occurred" });
        }
    }
})



export default router