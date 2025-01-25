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
const SECRET_KET_ADMIN = endpointsConfig.SK_Admin;
import { authorizeAdmin } from "./Middleware/admin.middleware";

const cron = require('node-cron');

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
        // Customize the error message based on which field is duplicated
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
            userid: userId
        },
    });

    return newUser;
};




// Function to sign in the user
const signinUser = async (signinUser: signinUser) => {
    const { username, password } = signinUser;

    const existingUser = await prisma.user.findFirst({ where: { username } });

    if (!existingUser || !bcrypt.compareSync(password, existingUser.password)) {
        throw new Error("Invalid credentials");
    }

    return existingUser;
};


// Signup Route
app.post("/user/signup", async (req, res) => {
    const { username, password, name, email , phone, transaction_Pin} = req.body;

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
    try {
        const existingUser = await signinUser({ username, password });

        const token = jwt.sign(
            { id: existingUser.id, username: existingUser.username },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        await prisma.user.update({
            where: {
                username : username
            },
            data: {
                totalnumberofSignin: existingUser.totalnumberofSignin + 1
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
            if (sender.Money < amount) {
            throw new Error(`${senderusername} doesn't have enough balance to send ${amount}`);
            }

    
            // Decrement amount from sender's account
            const updatedSender = await tx.user.update({
            where: { username: senderusername },
            data: {
                Money: { decrement: amount },
                totalTransactionDone: sender.totalTransactionDone + 1
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
    const upper_limit = Math.min(integer_number % 10, 10); // Limit range to prevent large calculations

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
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message: "An unknown error occurred";
        throw new Error(`Error during game execution: ${errorMessage}`);
    }

    return price_money;
}

app.post('/user/signin/mini_games', authenticateToken, async (req, res) => {
    try {
        const { bet_number_choice, input_number } = req.body;

        if (bet_number_choice === undefined || input_number === undefined) {
            res.status(400).json({ error: "Invalid request body." });
            return
        }

        const money: Money = { bet_number_choice, input_number };
        const result = await betgames(money);

        res.status(200).json({ success: true, prize: result });
        return
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message: "An unknown error occurred";
        res.status(500).json({ success: false, error: errorMessage });
        return
    }
});


const { v4: uuidv4 } = require('uuid'); // UUID for unique loan ID

app.post('/user/signin/apply_for_loan', authenticateToken, async (req, res) => {
    const { username, loan_Money, time } = req.body;

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
                    data: { Money: Number(existingUser.Money) + loan_Money }
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
  

app.get('/admin/signin/user_list', async (req , res) => {

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



app.listen(3000, () => {
    console.log("Server is running on port 3000");
});