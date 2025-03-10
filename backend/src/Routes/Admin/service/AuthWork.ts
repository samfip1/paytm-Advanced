import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
dotenv.config();
import endpointsConfig from "../Middleware/endpoints.config";
const prisma = new PrismaClient();
const app = express();
const SECRET_KEY = endpointsConfig.SK;
const router = express.Router();

const SECRET_KET_ADMIN = endpointsConfig.SK_Admin;
import { authorizeAdmin } from "../Middleware/admin.middleware";

app.use(cors());
app.use(express.json());
app.use(cookieParser());

router.post("/user_list/delete_user", authorizeAdmin, async (req, res) => {
    const { userid, reason } = req.body;

    // Input validation
    if (!userid) {
        res.status(400).json({ message: "userid is required" });
        return;
    }

    try {
        const existingUser = await prisma.user.findFirst({
            where: { userid },
            select: {
                id: true,
                Money: true,
                username: true,
                createdAt: true,
                email: true,
                phone: true,
                totalnumberofSignin: true,
                totalTransactionDone: true,
                userid: true,
            },
        });

        if (!existingUser) {
            res.status(404).json({ message: "Userid Not found" });
            return;
        }

        if (!existingUser.userid) {
            res.status(500).json({
                message:
                    "Internal Server Error: Userid is invalid in database.",
            });
            return;
        }

        const deletedUser = await prisma.user.delete({
            where: { id: existingUser.id },
        });

        const existingFraudRecord = await prisma.fraud_People.findFirst({
            where: { fraud_people_userid: userid },
        });

        if (!existingFraudRecord) {
            await prisma.fraud_People.create({
                data: {
                    fraud_people_userid: userid,
                    reason: reason,
                    Total_Money: existingUser.Money,
                    username: existingUser.username,
                    createdAt: existingUser.createdAt,
                    email: existingUser.email,
                    phone: existingUser.phone,
                    totalnumberofSignin: existingUser.totalnumberofSignin,
                    totalTransactionDone: existingUser.totalTransactionDone,
                },
            });
        } else {
            console.log(`Fraud record already exists for userid: ${userid}`);
        }

        res.json({ deletedUser });
    } catch (error) {
        console.error("Error during user deletion:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Something went wrong";
        res.status(500).json({
            error: "Something went wrong",
            details: errorMessage,
        });
    }
});

router.post("/user_list/freeze_money", authorizeAdmin, async (req, res) => {
    const { userid } = req.body;
    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                userid: userid,
            },
        });

        if (!existingUser) {
            throw new Error("Userid Not found");
        }

        const updatedUser = await prisma.user.update({
            where: {
                userid: userid,
            },
            data: {
                Money: 0,
            },
        });
        res.json({ updatedUser });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Something went wrong";
        res.status(400).json({ message: errorMessage });
    }
});

router.get("/donation_list", authorizeAdmin, async (req, res) => {
    try {
        const donations = await prisma.donation.findMany({
            orderBy: {
                donatedAt: "asc",
                DonatedMoney: "desc",
            },
            select: {
                donatedAt: true,
                donationId: true,
                DonatedMoney: true,
                senderId: true,
                senderUsername: true,
                message: true,
            },
        });

        if (donations.length === 0) {
            res.status(200).json({ message: "No donations found" });
        } else {
            res.status(200).json({ donations });
        }
    } catch (error) {
        console.error("Error fetching donations:", error);
        res.status(500).json({ message: "Failed to fetch donations" });
    }
});

export default router;
