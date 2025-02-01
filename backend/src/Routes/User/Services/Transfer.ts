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











async function transfer(senderusername: string, recieveusernmae: string, amount: number, transaction_Pin: bigint, comment: string): Promise<void> {
    try {
        await prisma.$transaction(async (tx) => {
            // Fetch sender's account balance before updating


            const sender = await tx.user.findUnique({
            where: { username: senderusername },
            select: {
                Money: true,
                userid : true,
                totalTransactionDone: true,
                transaction_Pass: true
                },
            });

            if (!sender) {
                throw new Error(`Sender with username ${senderusername} does not exist.`);
            }
            if (!sender.transaction_Pass.some(tp => tp.transaction_Pin === transaction_Pin)) {
                throw new Error('Your Transaction pin is Incorrect');
            }
            const senderId = sender.userid;


    
            // Check if sender has enough balance
            if (sender.Money < amount + 18) {
            throw new Error(`${senderusername} doesn't have enough balance to send ${amount}`);
            }
            if (sender.Money < amount + 18) {
                amount = amount + 18
            }

            if(sender.Money > 10000000 + 180) {
                amount = amount + 180           
            }
            if(sender.Money < 0) {
                throw new Error(`${senderusername} doesn't have enough Money to pay Platform fee`);
            }


    
            // Decrement amount from sender's account
            const updatedSender = await tx.user.update({
            where: { username: senderusername },
            data: {
                Money: { decrement: amount },
                totalTransactionDone: sender.totalTransactionDone + 1,
                CreditScore: {
                    increment: 6
                }
            },
            });

            const newamount = Math.random() * 5675;

            await tx.user.update({
                where: {
                    username: senderusername
                },
                data: {
                    Money: {
                        increment : newamount
                    }
                }
            })
            
            console.log(`Sender's new balance: ${updatedSender.Money}`);

            const transactionid = Math.random() * 989247568973999


            // Increment amount in recipient's account
            const recipient = await tx.user.update({
            where: { 
                username: recieveusernmae,
            },
            select: {
                userid: true,
                Money: true,
            },
            data: { Money: { increment: amount } },
            });

            const recieverID = recipient.userid;

            const payment = await prisma.transaction.create({
                data: {
                    senderId : senderId,
                    receiverId: recieverID,
                    senderUsername: senderusername,
                    receiverUsername: recieveusernmae,
                    amount: amount,
                    trasanctionId: transactionid,
                    Comment: comment
                }
            })
            console.log(payment);
    
            console.log(`Recipient's new balance: ${recipient.Money}`);
        });
        console.log(`Successfully transferred ${amount} from ${senderusername} to ${recieveusernmae}`);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error(errorMessage);
      throw error; // Re-throw for external handling
    }
}
  
router.post('/transfer', authenticateToken ,async (req, res) => {
    const { from, to, amount, transaction_pin } = req.body;
    var {comment} = req.body;
    // Validate input
    if (!from || !to || typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ error: 'Invalid input. Please provide valid `from`, `to`, and `amount`.' });
      return;
    }
    if(!comment) {
        comment = ""
    }

    try {
      await transfer(from, to, amount, transaction_pin, comment);
      res.status(200).json({ message: `Successfully transferred ${amount} from ${from} to ${to}.` });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ error: errorMessage });
    }
});




export default router