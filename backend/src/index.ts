import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authenticateToken } from "./Middleware/authMiddleware";
import * as dotenv from 'dotenv';
dotenv.config();
import endpointsConfig from "./Middleware/endpoints.config";
const prisma = new PrismaClient();
const app = express();
const SECRET_KEY = endpointsConfig.SK;
import { Request, Response } from "express";
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
}

interface signinUser {
    username: string;
    password: string;
}




// Function to check if the user is valid and create a new user
const isValidUser = async (user: User) => {
    const { username, password, name, email, phone } = user;

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
    const { username, password, name, email , phone} = req.body;

    try {
        const newUser = await isValidUser({
            username,
            password,
            name,
            email,
            Money: 0,
            phone,
            userid:0
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
        const errorMessage =
            error instanceof Error ? error.message : "Something went wrong";
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

async function transferFunds(senderUsername: string, recipientUsername: string, amount: number) {
    await prisma.$transaction(async (prisma) => {
        // Step 1: Fetch sender and recipient to validate the operation
        const sender = await prisma.user.findUnique({ where: { username: senderUsername } });
        const recipient = await prisma.user.findUnique({ where: { username: recipientUsername } });

        if (!sender) {
            throw new Error("Sender not found");
        }
        if (!recipient) {
            throw new Error("Recipient not found");
        }
        if (sender.Money < amount) {
            throw new Error("Insufficient funds");
        }
    
        // Step 2: Debit the sender's account
        await prisma.user.update({
            where: { username: senderUsername },
            data: { Money: { decrement: amount } },
        });

        // Step 3: Credit the recipient's account
        await prisma.user.update({
            where: { username: recipientUsername },
            data: { Money: { increment: amount } },
        });

        console.log(`Transferred ${amount} from ${senderUsername} to ${recipientUsername}`);
    });
}




app.post('/user/signin/transfer', authenticateToken, async (req, res) => {
    const { recipientusername, amount } = req.body;

    const senderusername = (req as AuthenticatedRequest).user?.username; // Ensure this is safely accessed using optional chaining `?`

    if (!senderusername) {
        res.status(400).json({ message: "Sender is not authenticated" });
        return;
    }
    try {
        // Perform the fund transfer within a transaction
        await transferFunds(senderusername, recipientusername, amount);

        // Send a success response
        res.status(200).json({
            message: `Transferred ${amount} from ${senderusername} to ${recipientusername}`,
        });
    } catch (error) {
        res.status(400).json({
            message: "Transaction failed"
        });
    }
});



app.post('/user/signin/AddMoney', async (req, res) => {
    const username : string = (req as AuthenticatedRequest).body;

    const Balance : number = Math.random() *10000000;
    try {
        const userAddMoney = await prisma.user.findFirst({
            where: {
                username: username
            }
        })

        if(userAddMoney) {
            userAddMoney.Money += Balance;
            res.json({
                message : `Money added ${Balance}`
            })
            return;
        }

        else {
            res.json({
                message: "An Error Occured"
            })
        }

    } catch (error) {
        console.log(error);
    }
})



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
                    {email}
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
    
    
})



// Start Server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});