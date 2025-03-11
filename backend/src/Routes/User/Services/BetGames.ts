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


interface Money {
    bet_number_choice: number;
    input_number: number;
}

async function betgames(money: Money) {

    
    if (money.bet_number_choice < 0 || money.input_number < 0) {
        throw new Error("Invalid input: Values must be non-negative numbers.");
    }

    const integer_number = money.bet_number_choice;
    const upper_limit = integer_number % 10;

    let price_money = 0;

    try {
        const bet_number = Math.floor(Math.random() * Math.pow(10, upper_limit));

        if (bet_number === money.input_number) {
            if (bet_number < 2) {
                price_money = money.input_number + 3 * money.input_number;
            } else if (bet_number < 4) {
                price_money = money.input_number + 8 * money.input_number;
            } else if (bet_number < 6) {
                price_money = money.input_number + 20 * money.input_number;
            } else {
                price_money = money.input_number + 50 * money.input_number;
            }
        }

        else {
            let per = 0;
            const percentageDifference = (Math.abs(bet_number - money.input_number) / money.input_number) * 100;
        
            if (percentageDifference < 10) {
                per = 2 * money.input_number; 
            } 

            else if (percentageDifference < 20) {
                per = 1.5 * money.input_number;  
            }

            else if (percentageDifference < 50) {
                per = 1.2 * money.input_number; 
            }
             
            else {
                per = 1 * money.input_number; 
            }

            price_money += per;
        }
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Error during game execution: ${errorMessage}`);
    }

    return price_money;
}

router.post('/mini_games', authenticateToken, async (req, res) => {
    const { username, bet_number_choice, input_number } = req.body;

    
    if (!username || bet_number_choice === undefined || input_number === undefined || typeof bet_number_choice !== 'number' || typeof input_number !== 'number' || input_number <= 0 || bet_number_choice <= 0) {
         res.status(400).json({ success: false, error: "Invalid input data. Please provide a valid username, bet_number_choice, and a positive input_number." });
         return
    }

    try {
       
        const gamblingUser = await prisma.user.findUnique({
            where: {
                username: username,
            },
            select: {
                Money: true,
                id: true 
            },
        });

        if (!gamblingUser) {
             res.status(404).json({ success: false, error: "User not found." });
             return
        }

        if (gamblingUser.Money < input_number) {
             res.status(400).json({ success: false, error: "Insufficient funds." });
             return
        }

        
        const money2: Money = { bet_number_choice, input_number };
        const result = await betgames(money2);

        
        try {
            await prisma.$transaction(async (tx) => {
                
                const updatedUser = await tx.user.update({
                    where: { id: gamblingUser.id }, 
                    data: {
                        Money: {
                            decrement: input_number,
                        },
                        CreditScore: {
                            increment: 20,
                        },
                    },
                });

               
                await tx.user.update({
                    where: { id: gamblingUser.id },
                    data: {
                        Money: {
                            increment: result,
                        },
                    },
                });

                 updatedUser;
                 return
            });

            
             res.status(200).json({ success: true, prize: result });
             return
        } catch (transactionError) {
            console.error("Transaction Error:", transactionError);
             res.status(500).json({ success: false, error: "Transaction failed. Please try again." });
             return
        }


    } catch (error) {
        console.error("General Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.status(500).json({ success: false, error: `Internal server error: ${errorMessage}` });
        return
    }
});

export default router