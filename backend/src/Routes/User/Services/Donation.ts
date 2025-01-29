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





app.post('/user/signin/Make_Donation', authenticateToken ,async (req, res ) => {

    let {userid, DonatedMoney, message} = req.body;

    if (!userid || !DonatedMoney || !message ) {
        res.status(400).json({ error: "All the information is not provided" });
        return
    }
    if(!message) message = ""
    try {

        await prisma.$transaction(async (tsx) => {
            const existingUser = await tsx.user.findFirst({
                where: {
                    userid: userid
                }, 
                select: {
                    Money: true,
                    username: true,
                    userid: true,

                }
            })
            if(!existingUser) {
                throw new Error("User not Found");
            }
            if(existingUser.Money < DonatedMoney) {
                throw new Error("Sorry to say But you don't have much money");            
            }

            const donationId = Math.random() * 892345792843572

            const donation = await tsx.donation.create({
                data: {
                donationId: donationId,
                senderUsername: existingUser.username,
                senderId: existingUser.userid,
                DonatedMoney: DonatedMoney,
                message: message
                }
            });

            const creditedScore = Math.random() * 27 + 26

            await tsx.user.update({
                where: {
                    userid: userid
                },
                data: {
                    Money: {
                        decrement: DonatedMoney
                    },
                    CreditScore: {
                        increment: creditedScore
                    }
                }
            });

            res.status(200).json({ message: "Donation successful", donation });

        })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went Wrong"
        throw new Error(errorMessage);        
    }
})
