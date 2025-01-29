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






app.post('/admin/signin/user_list/delete_user',authorizeAdmin ,async (req, res ) => {

    const {userid, reason} = req.body;

    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                userid: userid
            },
            select: {
                Money: true,
                username: true,
                createdAt: true,
                email: true,
                phone: true,
                totalnumberofSignin: true,
                totalTransactionDone: true,
                
            }
        })

        if(!existingUser) {
            throw new Error("Userid Not found");
            
        }
        const deleteuser = await prisma.user.delete({
            where: {
                userid: userid
            }
        })

        await prisma.fraud_People.create({
            data: {
                fraud_people_userid: userid,
                reason : reason,
                Total_Money: existingUser.Money,
                username: existingUser.username,
                createdAt: existingUser.createdAt,
                email: existingUser.email,
                phone: existingUser.phone,
                totalnumberofSignin: existingUser.totalnumberofSignin,
                totalTransactionDone: existingUser.totalTransactionDone
            }
        })
        res.json({deleteuser})
        return
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong"
        res.status(400).json({
            message: errorMessage
        })
    }


})

app.post('/admin/signin/user_list/freeze_money', authorizeAdmin ,async (req, res) => {

    const {userid} = req.body;
    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                userid: userid
            }
        })

        if(!existingUser) {
            throw new Error("Userid Not found");
            
        }
        const freeze_money = await prisma.user.update({
            where: {
                userid: userid
            },
            data: {
                Money: 0
            }
        })
        res.json({freeze_money})
        return
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong"
        res.status(400).json({
            message: errorMessage
        }) 
    }
})



app.get('/admin/signin/donation_list', authorizeAdmin, async (req , res) => {

    try {
        const all_donation_lis = await prisma.donation.findMany({
            orderBy: {
                donatedAt: 'asc',
                DonatedMoney: 'desc'
            },
            select: {
                donatedAt: true,
                donationId: true,
                DonatedMoney: true,
                senderId: true,
                senderUsername: true,
                message : true

            }
        })

        res.status(200).json({all_donation_lis})
    }

    catch(error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong"
        res.json({
            message : errorMessage
        })
    }
})
