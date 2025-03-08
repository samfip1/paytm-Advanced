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

    const {username} = req.body
    const { bet_number_choice, input_number } = req.body;


    if(!username) throw new Error("Please Enter Username");    
    try {

        if (bet_number_choice === undefined || input_number === undefined) {
            res.status(400).json({ error: "Invalid request body." });
            return
        }

        const gamblingUser = await prisma.user.findFirst({
            where: {
                username: username
            },
            select: {
                Money: true
            }
        })

        if(!gamblingUser) {
            throw new Error("User Does not Exist");            
        }

        if(gamblingUser.Money < input_number) {
            throw new Error("You Don't have this much of money in your bank Account");            
        }

        await prisma.$transaction(async (atx) => {

            try {
                const betmoneyuser = await atx.user.update({
                    where: {
                        username: username
                    },
                    data : {
                        Money: {
                            decrement: input_number
                        },
                        CreditScore: {
                            increment : 20
                        }
                    }
                })  
                return betmoneyuser
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message: "An unknown error occurred";
                res.status(500).json({ success: false, error: errorMessage });
                return
            } 
        })


        const money2: Money = { bet_number_choice, input_number };
        const result = await betgames(money2);

        await prisma.$transaction(async (atx) => {

            try {
                const addmoneyUser = await atx.user.update({
                    where: {
                        username: username
                    },
                    data :{
                        Money: {
                            increment: result
                        }
                    }
                })    
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message: "An unknown error occurred";
                res.status(500).json({ success: false, error: errorMessage });
                return 
            }
        })
        
        res.status(200).json({ success: true, prize: result });
        return

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message: "An unknown error occurred";
        res.status(500).json({ success: false, error: errorMessage });
        return

    }
});




export default router