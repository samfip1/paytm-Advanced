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




async function transfer(senderusername: string, recieveusernmae: string, amount: number, transaction_Pin: number, comment: string): Promise<void> {
  const uniqueTimestamp = Date.now();
const uniqueUuid = uuidv4();

const uniqueUserId = `${uniqueUuid}-${uniqueTimestamp}`;

  try {
        await prisma.$transaction(async (tx) => {


            const sender = await tx.user.findUnique({
            where: { username: senderusername },
            select: {
                Money: true,
                username : true,
                totalTransactionDone: true,
                transaction_Pass: true,
                userid: true
                },
            });

            if (!sender) {
                throw new Error(`Sender with username ${senderusername} does not exist.`);
            }
            if (!sender.transaction_Pass.some(tp => Number(tp.transaction_Pin) === transaction_Pin)) {
                throw new Error('Your Transaction pin is Incorrect');
            }



    
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

            const senderId = sender.userid; 


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

            const newamount = Math.floor(Math.random() * 5675);

            await tx.user.update({
                where: {
                    username: senderusername
                },
                data: {
                    Money: {
                        increment : BigInt(newamount)
                    }
                }
            })
            
            console.log(`Sender's new balance: ${updatedSender.Money}`);

            const uniqueTimestamp = Date.now();
            const uniqueUuid = uuidv4();
            

            const uniqueUserIdTra = `${uniqueUuid}-${uniqueTimestamp}`;
            
  
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
                    receiverId: recieverID,
                    senderUsername: senderusername,
                    receiverUsername: recieveusernmae,
                    amount: amount,
                    trasanctionId: uniqueUserId,
                    Comment: comment,
                    senderId: senderId
                }
            })
            console.log(payment);
    
            console.log(`Recipient's new balance: ${recipient.Money}`);
        },{
                maxWait: 5000, 
                timeout: 10000, 
        });
        console.log(`Successfully transferred ${amount} from ${senderusername} to ${recieveusernmae}`);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error(errorMessage);
      throw error; 
    }
}
  
router.post('/', authenticateToken ,async (req, res) => {
    const { from, to, amount, transaction_pin } = req.body;
    var {comment} = req.body;

    
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