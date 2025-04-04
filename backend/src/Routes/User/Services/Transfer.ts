import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authenticateToken } from "../Middleware/auth.middleware";
import * as dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

async function transfer(
    senderusername: string,
    recieveusernmae: string,
    amount: number,
    transaction_Pin: number,
    comment: string
): Promise<void> {
    const uniqueTimestamp = Date.now();
    const uniqueUuid = uuidv4();
    const uniqueUserId = `${uniqueUuid}-${uniqueTimestamp}`;

    try {
        await prisma.$transaction(
            async (tx) => {
                const sender = await tx.user.findUnique({
                    where: { username: senderusername },
                    select: {
                        Money: true,
                        username: true,
                        totalTransactionDone: true,
                        transaction_Pass: {
                            select: {
                                transaction_Pin: true,
                            },
                        },
                        userid: true,
                    },
                });

                if (!sender) {
                    throw new Error(
                        `Sender with username ${senderusername} does not exist.`
                    );
                }

                
                const hasValidPin = sender.transaction_Pass.some(
                    (tp) => Number(tp.transaction_Pin) === transaction_Pin
                );

                if (!hasValidPin) {
                    throw new Error("Your Transaction pin is Incorrect");
                }

                const platformFee = sender.Money > 10000000 ? 180 : 18; 

                if (sender.Money < amount + platformFee) {
                    throw new Error(
                        `${senderusername} doesn't have enough balance to send ${amount} including platform fee.`
                    );
                }

                const updatedSender = await tx.user.update({
                    where: { username: senderusername },
                    data: {
                        Money: { decrement: amount + platformFee },
                        totalTransactionDone: sender.totalTransactionDone + 1,
                        CreditScore: { increment: 6 },
                    },
                });

                console.log(`Sender's new balance: ${updatedSender.Money}`);

                const recipient = await tx.user.update({
                    where: { username: recieveusernmae },
                    data: { Money: { increment: amount } },
                });

                const payment = await prisma.transaction.create({
                    data: {
                        receiverId: recipient.userid,
                        senderUsername: senderusername,
                        receiverUsername: recieveusernmae,
                        amount: amount,
                        trasanctionId: uniqueUserId,
                        Comment: comment,
                        senderId: sender.userid, 
                    },
                });

                console.log(payment);
                console.log(`Recipient's new balance: ${recipient.Money}`);
            },
            {
                maxWait: 5000,
                timeout: 10000,
            }
        );

        console.log(
            `Successfully transferred ${amount} from ${senderusername} to ${recieveusernmae}`
        );
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred";
        console.error(errorMessage);
        throw error;
    }
}

router.post("/:transferData", authenticateToken, async (req, res) => {
    const { from, to, amount, transaction_pin } = req.params;
    let { comment } = req.params;

    if (
        !from ||
        !to ||
        typeof amount !== "number" ||
        amount <= 0 ||
        typeof transaction_pin !== "number"
    ) {
        res.status(400).json({
            error: "Invalid input. Please provide valid `from`, `to`, `amount`, and `transaction_pin`.",
        });
        return;
    }

    comment = comment || "";

    try {
        const transferResult = await transfer(
            from,
            to,
            amount,
            transaction_pin,
            comment
        ); 

        res.status(200).json({
            message: `Successfully transferred ${amount} from ${from} to ${to}.`,
            transfer: {
                from: from,
                to: to,
                amount: amount,
                comment: comment,
            },
        });
    } catch (error) {
        console.error("Transfer error:", error);
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred";
        res.status(500).json({ error: errorMessage });
    }
});

export default router;
