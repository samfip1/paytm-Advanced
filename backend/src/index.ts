import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authenticateToken } from "./Middleware/auth.middleware";
import * as dotenv from 'dotenv';
dotenv.config();
import endpointsConfig from "./Middleware/endpoints.config";
const prisma = new PrismaClient();
const app = express();
const SECRET_KEY = endpointsConfig.SK;
import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid'; // UUID for unique loan ID

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




interface User {
    username: string;
    password: string;
    name: string;
    email: string;
    Money: number;
    phone: number;
    userid: number;
    transaction_Pin : number;
}

interface signinUser {
    username: string;
    password: string;
    reffarelId? : number;
}




// Function to check if the user is valid and create a new user
const isValidUser = async (user: User) => {
    const { username, password, name, email, phone , transaction_Pin} = user;

    // Check for duplicate email, username, or phone
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email }, 
                { username }, 
                { phone }
            ],
        },
    });

    if (existingUser) {

        if (existingUser.email === email) {
            throw new Error("A user with this email already exists.");
        }
        if (existingUser.username === username) {
            throw new Error("A user with this username already exists.");
        }
        if (existingUser.phone === phone) {
            throw new Error("A user with this phone number already exists.");
        }
    }
    // Generate a unique user ID and hashed password
    const userId = Math.floor(Math.random() * 10000000);
    const hashedPassword = bcrypt.hashSync(password, 12);

    const reffralId = Math.random() * 2049578204872234;
    

    // Generate a random money value
    const randomMoney = Math.floor(Math.random() * (1000000000 - 10000000 + 1)) + 10000000;

    await prisma.transactionpin.create({
        data: {
            transaction_pin: transaction_Pin
        }
    })
    // Create a new user in the database
    const newUser = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
            name,
            email,
            Money: randomMoney,
            phone,
            userid: userId,
            referralId: reffralId,
            CreditScore : 0,
            
        },
    });

    return newUser;
};




// Function to sign in the user
const signinUser = async (signinUser: signinUser) => {
    const { username, password, reffarelId } = signinUser;
    const existingUser = await prisma.user.findFirst({ where: { username } });

    if (!existingUser || !bcrypt.compareSync(password, existingUser.password)) {
        throw new Error("Invalid credentials");
    }

    try {

        await prisma.$transaction(async (atc) => {
            if(reffarelId != null) {
                const reffareluser = await atc.user.findFirst({
                    where: {
                        referralId: reffarelId
                    }
                });
    
                if (reffareluser) {
                    await atc.user.update({
                        where: {
                            id: reffareluser.id
                        },
                        data: {
                            Money: {
                                increment: 83456
                            }
                        }
                    });
                }
                if(!reffareluser) {
                    throw new Error("User with this Referral code Does not exist");                    
                }
            }
        })
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        console.log(errorMessage)
    }
    return existingUser;
};


// Signup Route
app.post("/user/signup", async (req, res) => {
    const { username, password, name, email , phone, transaction_Pin} = req.body;

    if (!username || !password  || !name || !email || !phone || !transaction_Pin) {
        res.status(400).json({ error: "All the required Information are not filled" });
        return
    }

    try {
        const newUser = await isValidUser({
            username,
            password,
            name,
            email,
            Money: 0,
            phone,
            userid:0,
            transaction_Pin: transaction_Pin
        });



                                        // JWT SIGNIN
        const token = jwt.sign(             
            { id: newUser.id, username: newUser.username },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, { httpOnly: true });
        res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser.id,
                username: newUser.username,
                name: newUser.name,
                email: newUser.email,
                money: newUser.Money,
                phone: newUser.phone,
                createAt: newUser.createdAt,
                userid: newUser.userid
            },
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        res.status(500).json({ message: errorMessage });
    }
});



// Signin Route
app.post("/user/signin", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: "userid is required" });
        return
    }
    var {reffarelId} = req.body
    if (!reffarelId) reffarelId = null
    try {
        const existingUser = await signinUser({ username, password, reffarelId });

        const token = jwt.sign(
            { id: existingUser.id, username: existingUser.username },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        await prisma.user.update({
            where: {
                username : username,
            },
            data: {
                totalnumberofSignin: existingUser.totalnumberofSignin + 1,
                CreditScore: {
                    increment: 3
                }
            }
        })


        let rateofInterest: number = 0;
        if(existingUser.totalnumberofSignin == 10) {
            rateofInterest = existingUser.Money * 0.04;
            existingUser.totalnumberofSignin = 0;
        }
        await prisma.user.update({
            where: {
                username : username
            },
            data: {
                Money: existingUser.Money + rateofInterest
            }
        })
        res.cookie("token", token, { httpOnly: true });
        res.status(200).json({
            message: "Successfully logged in",
            user: {
                id: existingUser.id,
                username: existingUser.username,
                token: token,
                userid: existingUser.userid
                }
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Something went wrong";
        res.status(401).json({
            message: errorMessage || "Something went wrong",
        });
    }
});




// Get User Balance Route
app.get("/user/signin/balance", authenticateToken, async (req, res) => {
    const userid = (req as AuthenticatedRequest).user;
    try {
        const user = await prisma.user.findUnique({ where: { id: userid.id } });

        if (!user) {
            throw new Error("User not found");
        }

        res.status(200).json({ balance: user.Money });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Something went wrong";
        res.status(500).json({
            message: errorMessage || "Something went wrong",
        });
    }
});





app.post('/user/signin/update', authenticateToken, async (req, res) => {
    const { username, newUsername } = req.body;

    // Check if required fields are provided
    if (!username || !newUsername) {
        res.status(400).json({ message: "Username and newUsername are required" });
        return;
    }

    try {
        // Check if the new username already exists
        const updateUser = await prisma.user.findFirst({
            where: {
                username: newUsername
            }
        });

        if (updateUser) {
            res.status(400).json({
                message: "Username already exists"
            });
            return;
        }

        // Proceed with updating the username
        await prisma.user.update({
            where: {
                username: username
            },
            data: {
                username: newUsername
            }
        });

        res.status(200).json({
            message: "Username updated successfully",
            newUsername
        });

    } catch (error) {
        console.error("Error updating username:", error);
        res.status(500).json({
            message: "An error occurred while updating the username"
        });
    }
});







app.get("/user/signin/account", authenticateToken, async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
        res.status(400).json({ message: "User information not found in request." });
        return;
    }

    try {
        // Fetch user details from the database using Prisma or any ORM
        const accountDetails = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                username: true,
                Money: true,
                phone: true,
                email: true,
                userid: true
            },
        });

        if (!accountDetails) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        res.status(200).json(accountDetails);
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



async function transfer(senderusername: string, recieveusernmae: string, amount: number, transaction_Pin: number, comment: string): Promise<void> {
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
            if (!sender.transaction_Pass.some(tp => tp.transaction_pin === transaction_Pin)) {
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
  
app.post('/user/signin/transfer', authenticateToken ,async (req, res) => {
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







interface Money {
    bet_number_choice: number;
    input_number: number;
}

async function betgames(money: Money) {
    // Input validation
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


app.post('/user/signin/mini_games', authenticateToken, async (req, res) => {

    const {userId} = req.body
    const { bet_number_choice, input_number } = req.body;

    if(!userId) throw new Error("Please Enter Username");    
    try {

        if (bet_number_choice === undefined || input_number === undefined) {
            res.status(400).json({ error: "Invalid request body." });
            return
        }

        const gamblingUser = await prisma.user.findFirst({
            where: {
                userid: userId
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
                        userid: userId
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
                        userid: userId
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








app.post('/user/signin/apply_for_loan', authenticateToken, async (req, res) => {
    const { username, loan_Money, time } = req.body;

    if (!username || !loan_Money || !time) {
        res.status(400).json({ error: "userid is required" });
        return
    }


    try {
        await prisma.$transaction(async (tx) => {
            // Find the user by username
            const existingUser = await tx.user.findFirst({
                where: { username },
                select: { id: true, Money: true }
            });

            if (!existingUser) {
                throw new Error("Username not found");
            }

            // Apply business logic to calculate the loan limit (here it's a fixed limit)
            const maxLoanLimit = existingUser.Money * 2; // Maximum loan is double the user's current money
            const rateOfInterest = 9.86 - (Math.random() * 0.02 * time); // Interest rate decreases with time

            if (loan_Money <= maxLoanLimit) {
                const loanId = uuidv4(); // Generate a unique loan ID using UUID

                await tx.loan.create({
                    data: {
                        loanId, // Unique loan ID
                        loanMoney: loan_Money,
                        time,
                        interest: rateOfInterest,
                        repaymentDate: new Date(Date.now() + time * 30 * 24 * 60 * 60 * 1000), // time in months
                        userId: existingUser.id
                    }
                });

                // Update user's money after loan application
                await tx.user.update({
                    where: { id: existingUser.id },
                    data: { 
                        Money: Number(existingUser.Money) + loan_Money ,
                        CreditScore: {
                            increment: 16
                        }
                    }
                });

                res.status(200).json({ message: "Loan applied successfully" });
            } else {
                throw new Error("Loan exceeds the maximum limit based on your current money");
            }
        });
    } catch (error) {
        console.error("Error applying for loan:", error);
        const errorMessage = error instanceof Error ? error.message : "Something went wrong"
        res.status(500).json({errorMessage });
    }
});

cron.schedule('0 0 * * *', async () => {
    try {
        const overdueLoans = await prisma.loan.findMany({
            where: {
                repaymentDate: { lte: new Date() },
                status: "pending"
            }
        });

        for (const loan of overdueLoans) {
            const repaymentAmount = Number(loan.loanMoney) + (Number(loan.loanMoney) * Number(loan.interest) / 100);

            await prisma.$transaction(async (tx) => {
                const user = await tx.user.findFirst({
                    where: { id: loan.userId }
                });

                if (!user) {
                    console.error(`User with ID ${loan.userId} not found.`);
                    return;
                }

                // Check if the user has enough funds for repayment
                if (Number(user.Money) >= repaymentAmount) {
                    await tx.user.update({
                        where: { id: user.id },
                        data: { Money: Number(user.Money) - repaymentAmount }
                    });

                    // Mark loan as "repaid"
                    await tx.loan.update({
                        where: { id: loan.id },
                        data: { status: "repaid" }
                    });
                } else {
                    console.error(`User with ID ${user.id} has insufficient funds for repayment.`);
                    // Mark loan as "defaulted"
                    await tx.loan.update({
                        where: { id: loan.id },
                        data: { status: "defaulted" }
                    });
                }
            });
        }
    } catch (error) {
        console.error("Error processing loan repayments:", error);
    }
});




app.post('/user/signin/Money_request', authenticateToken, async (req, res) => {
    const { recieverID, senderId, money, message } = req.body;

    if (!recieverID || !senderId || !money || !message) {
        res.status(400).json({ error: "All the information is not provided" });
        return
    }
    try {
        const moneytakerusername = await prisma.user.findFirst({
            where: { userid: senderId },
            select: { Money: true },
        });

        const moneysenderusername = await prisma.user.findFirst({
            where: { userid: recieverID },
            select: { Money: true, username: true },
        });

        if (!moneysenderusername) {
            throw new Error("Sender Username is not available");
        }
        if (!moneytakerusername) {
            throw new Error("Receiver Username is not available");
        }

        const moneyRequestId = Math.floor(Math.random() * 7234984375649829);

        const requesting_user = await prisma.moneyRequest.create({
            data: {
                moneyRequestId: moneyRequestId,
                money: money,
                reciverId: recieverID,
                senderId: senderId,
                message: message,
                status: "Pending",
            },
        });

        res.json({ requesting_user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error });
    }
});



app.post('/user/signin/request_for_approval', authenticateToken, async (req, res) => {
    const { moneyRequestId, action } = req.body; // `action` can be "accept" or "reject"

    if (!moneyRequestId || !action ) {
        res.status(400).json({ error: "All the information is not provided" });
        return
    }

    try {
        // Fetch the money request
        const moneyRequest = await prisma.moneyRequest.findFirst({
            where: { moneyRequestId },
        });

        if (!moneyRequest) {
            throw new Error("Invalid Money Request");
        }

        // Validate action
        if (action !== "accept" && action !== "reject") {
            throw new Error("Invalid action. Action must be either 'accept' or 'reject'");
        }

        // If action is "reject", update the status and return
        if (action === "reject") {
            await prisma.moneyRequest.update({
                where: { moneyRequestId },
                data: { status: "rejected" },
            });

            res.json({ message: "Money request rejected successfully" });
            return
        }

        // Action is "accept" — perform the money transfer
        const { money, senderId, reciverId } = moneyRequest;

        // Fetch sender and receiver details
        const sender = await prisma.user.findFirst({
            where: { userid: senderId },
            select: { Money: true },
        });

        const receiver = await prisma.user.findFirst({
            where: { userid: reciverId },
            select: { Money: true },
        });

        if (!sender || !receiver) {
            throw new Error("Sender or receiver not found");
        }

        if (sender.Money < money) {
            throw new Error("Insufficient balance in the sender's account");
        }

        // Perform the money transfer
        await prisma.user.update({
            where: { userid: senderId },
            data: { 
                Money: sender.Money - money,
                CreditScore: 12
            },
        });

        await prisma.user.update({
            where: { userid: reciverId },
            data: { 
                Money: receiver.Money + money, 
                CreditScore: {
                    decrement: 5
                }
            },
        });

        // Update the money request status
        await prisma.moneyRequest.update({
            where: { moneyRequestId },
            data: { status: "accepted" },
        });

        res.json({ message: "Money request accepted and processed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error });
    }
});





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






app.post('/user/signin/blog/create_blog', authenticateToken ,async (req, res) => {
    
    const {userid, content, username, HeadingOfContent} = req.body;

    if (!userid || !content || !username || !HeadingOfContent) {
        res.status(400).json({ error: "All the information is not provided" });
        return
    }
    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                userid : userid
            }
        })
        if(!existingUser) {
            throw new Error("User Not found");            
        }

        if(content == "" || HeadingOfContent == "") {
            throw new Error("PLease enter Content to post the information");            
        }

        const contentId  = Math.random() * 52839759483475;
        const blogUser = await prisma.blog.create({
            data: {
                content: content,
                contentId: contentId,
                numberOflike: 0,
                username: username,
                HeadingOfContent : HeadingOfContent
            }
        })
        res.status(200).json({blogUser})
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something Went wrong"
        res.json({errorMessage})
    }
})



app.get('/user/signin/blog', authenticateToken, async (req, res) => {
    const { userid } = req.body;


    if (!userid) {
        res.status(400).json({ error: 'userid is required' });
        return;
    }

    try {
        let blogs = await prisma.blog.findMany({
            where: {
                contentId: {
                    not: Number(userid), // Exclude blogs where `contentId` matches the user's ID.
                },
            },
        });

        // Shuffle the blogs array
        blogs = blogs.sort(() => Math.random() - 0.5);

        res.status(200).json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/user/signin/blog/like_comment', authenticateToken, async (req, res) => {
    const { userid , contentId} = req.body; // Assuming `userid` is provided as a query parameter.

    if (!userid || !contentId) {
        res.status(400).json({ error: 'userid is required' });
        return
    }
    try {
        const like_comment = await prisma.blog.update({
            where: {
            contentId: contentId
            }, 
            data: {
            numberOflike: {
                increment: 1
            }
            }
        });

        res.status(200).json({like_comment})

    } catch (error) {
        console.error('Error Liking blogs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




app.post('/user/signin/send-request', authenticateToken ,async (req, res) => {
    const { senderId, receiverId, receiverUsername } = req.body;
  
    try {

        const existingUser = await prisma.user.findFirst({
            where : {
                userid: senderId
            }
        })
        if (!existingUser) {
            throw new Error("Username not found");            
        }

        const recieveruser = await prisma.user.findFirst({
            where : {
                userid: receiverId
            }
        })

        if(!recieveruser) {
            throw new Error("This username does not exist");            
        }

      // Add to sender's sentRequests
      await prisma.sentRequest.create({
        data: {
          userId: senderId,
          username: receiverUsername,
        },
      });
  
      // Add to receiver's receivedRequests
      await prisma.requestFriend.create({
        data: {
          userId: receiverId,
          username: receiverUsername,
        },
      });
  
      // Increment totalRequests
      await prisma.user.update({
        where: { id: receiverId },
        data: { totalRequests: { increment: 1 } },
      });
  
      res.json({ message: 'Friend request sent successfully.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send friend request' });
    }
});
  

app.post('/accept-request', authenticateToken ,async (req, res) => {
    const { userId, friendId } = req.body;
  
    try {
      // Add to friendsList
      await prisma.friend.create({
        data: {
          userId,
          friendId,
        },
      });

      // Remove from receivedRequests
      await prisma.requestFriend.deleteMany({
        where: { userId: userId },
      });
  
      // Remove from sender's sentRequests
      await prisma.sentRequest.deleteMany({
        where: { userId: friendId },
      });
  
      res.json({ message: 'Friend request accepted successfully.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to accept friend request' });
    }
});



app.get('/user/signin/allFriend', authenticateToken, async (req, res) => {
    const { userid } = req.body; // Extracting the userid from the request body

    try {
        // Validate the input
        if (!userid) {
            res.status(400).json({ error: "userid is required" });
            return
        }

        // Find the user by userid
        const existingUser = await prisma.user.findFirst({
            where: { userid },
        });

        if (!existingUser) {
            res.status(404).json({ error: "User not found" });
            return
        }

        // Fetch all friends of the user
        const allFriends = await prisma.friend.findMany({
            where: { userId: existingUser.id },
        });

        // Return the list of friends
        res.status(200).json({ friends: allFriends });
        return

    } catch (error) {
        // Handle errors
        console.error("Error fetching friends:", error);
        res.status(500).json({ error: "Internal server error" });
        return
    }
});




app.get('/user/signin/friends/:userId', authenticateToken ,async (req, res) => {
    const { userId } = req.params;
  
    try {
      const friends = await prisma.friend.findMany({
        where: { userId: Number(userId) },
      });
  
      res.json(friends);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch friends list' });
    }
  });
  






interface adminSignup {
    username :string;
    password : string;
    name : string;
    email : string
    phone: number
}

const isValidAdmin = async (adminuser : adminSignup) => {
    const {username, password, name, email, phone} = adminuser;

    try {
        const admin = await prisma.admin.findFirst({
            where: {
                OR: [
                    {email},
                    {phone},
                    {username}
                ]
            }
        })

        if(admin) {
            if(admin.username == username) {
                throw new Error("Usernmae already taken");                
            }
            else if(admin.email == email) {
                throw new Error("Email already taken")
            }
            else if(admin.phone == phone) {
                throw new Error("Phone number already taken");                
            }
        }
        
        const adminid = Math.random() *1000389475;
        const hashPasswordAdmin = bcrypt.hashSync(password, 12)
        const Newadmin = await prisma.admin.create({
            data: {
                username,
                password : hashPasswordAdmin,
                name,
                email,
                phone,
                adminId: adminid
            }
        })


        return Newadmin;
    } catch (error) {
        console.log(error);
    }
}


app.post('/admin/signup', async (req, res) => {
    const {username, password, name, email, phone} = req.body;

    try {
        const newadminuser = await isValidAdmin({
            username,
            password,
            name,
            email,
            phone,
        });



                                        // JWT SIGNIN
        if (!newadminuser) {
            throw new Error("Failed to create new admin user");
        }

        const token = jwt.sign(             
            { id: newadminuser.id, username: newadminuser.username },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, { httpOnly: true });
        res.status(201).json({
            message: "User created successfully",
            user: {
                id: newadminuser.id,
                username: newadminuser.username,
                name: newadminuser.name,
                email: newadminuser.email,
                phone: newadminuser.phone,
                createAt: newadminuser.createdAt,
                adminid: newadminuser.adminId
            },
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Something went wrong";
        res.status(500).json({ message: errorMessage });
    }
    
})


interface AdminLogin {
    username: string;
    password: string;
}

async function signinAdmin(admin: AdminLogin) {
    const { username, password } = admin;

    const adminLogger = await prisma.admin.findFirst({
        where: {
            username: username
        }
    });

    if (!adminLogger || !bcrypt.compareSync(password, adminLogger.password)) {
        throw new Error("Invalid Credentials");
    }
    return adminLogger; 
}

app.post('/admin/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        const loggedInAdmin = await signinAdmin({ username, password });

        const token = jwt.sign(
            { id: loggedInAdmin.id, username: loggedInAdmin.username },
            SECRET_KET_ADMIN
        );

        

        await prisma.admin.update({
            where: {
                username: username
            },
            data: {
                totalsignin: loggedInAdmin.totalsignin + 1
            }
        })

        
        res.cookie("token", token, { httpOnly: true });
        res.status(200).json({
            message: "Successfully logged in",
            user: {
                id: loggedInAdmin.id,
                username: loggedInAdmin.username,
                token: token,
                adminid: loggedInAdmin.adminId
            }
        });


    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : ":Error Occured"
        res.status(401).json({ message: errorMessage });
    }
    
});



app.put('/admin/signin/update', authorizeAdmin,async (req, res) => {
    const {username, newUsername} = req.body;

    const adminUpdate = await prisma.admin.findFirst({
        where: {
            username : newUsername
        }
    })

    if(adminUpdate) {
        throw new Error("This username already Exists");        
    }

    const newadminUsernmae = await prisma.admin.update({
        where: {
            username : username
        },
        data : {
            username : newUsername
        }
    })

    if(newadminUsernmae) {
        res.status(200).json({
            message : "Username Updated Scuccesfully"
        })
    }
    if(!newadminUsernmae) {
        res.status(500).json({
            message : "Something is Dowm from Our end"
        })
    }
})



app.get('/admin/signin/profile', authorizeAdmin ,async (req, res) => {

    const {username} = req.body;

    try {
    const AdminPRofile = await prisma.admin.findUnique({
        where: {
            username : username
        },
        select: {
            id: true,
            username: true,
            email: true,
            name: true,
            phone: true,
            adminId: true
        }
    })
    
    res.status(200).send(AdminPRofile);
    }
    catch (error) {
        console.log(error)
    }
    
    
})



app.get('/admin/signin/user_transaction',  authorizeAdmin,async (req, res) => {
    try {
      // Fetch all transactions from the database
      const allTransactionList = await prisma.transaction.findMany();
      
      // Send the transactions as a response
      res.status(200).json(allTransactionList);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      // Send an error response
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
});



  
app.get(['/admin/signin/leaderboard', '/user/signin/leaderboard'], authorizeAdmin, authenticateToken, async (req, res) => {
      try {
        const leaderboardData = await prisma.leaderboard.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                Money: true,
                totalTransactionDone: true,
              },
            },
          },
          orderBy: {
            totalTransactionMoney: 'desc', // Sort by total transaction money
          },
        });

        const leaderboard = leaderboardData.map((entry, index) => ({
          rank: index + 1, // Assign rank based on position in sorted data
          totalTransactionMoney: entry.totalTransactionMoney,
          users: entry.user.map((u) => ({
            id: u.id,
            name: u.name,
            username: u.username,
            email: u.email,
            Money: u.Money,
            totalTransactionDone: u.totalTransactionDone,
          })),
        }));
  
        res.status(200).json({ leaderboard });
        return
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard data.' });
        return
      }
    }
);
  

app.get('/admin/signin/user_list',authorizeAdmin ,async (req , res) => {
    try {
        const total_user_list = await prisma.user.findMany({
            orderBy: {
                Money: 'desc'
            },
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                Money: true,
                phone: true,
                userid: true,
                totalTransactionDone: true,
                totalnumberofSignin: true,
                leaderboardId: true,
                createdAt: true,
                updatedAt: true
            }
        });

        res.status(200).json({ total_user_list });
    } catch (error) {
        console.error('Error fetching user list:', error);
        res.status(500).json({ error: 'Failed to fetch user list' });
    }
});

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



app.listen(3000, () => {
    console.log("Server is running on port 3000");
});