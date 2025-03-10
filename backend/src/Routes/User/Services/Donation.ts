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




router.post('/Make_Donation', authenticateToken ,async (req, res ) => {

    let { userid, DonatedMoney, message } = req.body;

    if(!message) message = "";

    if (!userid || DonatedMoney === undefined || DonatedMoney === null ) { 
        res.status(400).json({ error: "All the information is not provided" });
        return
    }

    const donatedMoneyNumber = Number(DonatedMoney);

    if (isNaN(donatedMoneyNumber)) {
        res.status(400).json({ error: "DonatedMoney must be a valid number" });
        return
    }


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
            });
            if(!existingUser) {
                res.status(404).json({ error: "User not Found" });
                return
            }
            if(existingUser.Money < donatedMoneyNumber) {
                res.status(400).json({ error: "Sorry to say But you don't have enough money" });
                return
            }


            const uniqueTimestamp = Date.now();
            const uniqueUuid = uuidv4();
            const uniqueUserId = `${uniqueUuid}-${uniqueTimestamp}`;


            const donation = await tsx.donation.create({
                data: {
                donationId: uniqueUserId,
                senderUsername: existingUser.username,
                senderId: existingUser.userid,
                DonatedMoney: donatedMoneyNumber, 
                message: message
                }
            });

            const creditedScore = Math.random() * 27 + 26;

            await tsx.user.update({
                where: {
                    userid: userid
                },
                data: {
                    Money: {
                        decrement: donatedMoneyNumber 
                    },
                    CreditScore: {
                        increment: creditedScore
                    }
                }
            });

           
            const donationResponse = {
                ...donation,
                DonatedMoney: donation.DonatedMoney.toString() 
            };


            res.status(200).json({ message: "Donation successful", donation: donationResponse });
            return

        });

    } catch (error: any) {
        console.error("Donation Error:", error);
        res.status(500).json({ error: "Something went wrong during donation", details: error.message });
        return
    }
});


export default router