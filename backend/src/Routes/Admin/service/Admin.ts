import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authenticateToken } from "../../User/Middleware/auth.middleware";
import * as dotenv from 'dotenv';
dotenv.config();
const prisma = new PrismaClient();
const app = express();
// const SECRET_KEY = endpointsConfig.SK;

const router = express.Router();



// const SECRET_KET_ADMIN = endpointsConfig.SK_Admin;
import { authorizeAdmin } from "../Middleware/admin.middleware";
app.use(cors());
app.use(express.json());
app.use(cookieParser());



router.put('/update', authorizeAdmin,async (req, res) => {
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



router.get('/profile', authorizeAdmin ,async (req, res) => {

    const {username} = (req as any).user;

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









router.get('/user_transaction',  authorizeAdmin,async (req, res) => {
    try {

      const allTransactionList = await prisma.transaction.findMany();
      
      res.status(200).json(allTransactionList);

    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
});



  
router.get('/leaderboard', authorizeAdmin, async (req, res) => {
    try {
        const leaderboardData = await prisma.leaderboard.findMany({
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        email: true,
                        Money: true,
                        totalTransactionDone: true,
                    },
                    orderBy: { Money: 'desc' } // Sort users by money
                },
            },
            orderBy: {
                totalTransactionMoney: 'desc', // Sort leaderboard by total money
            },
        });

        // Convert BigInt to String to prevent JSON errors
        const convertBigIntToString = (obj: any): any =>
            JSON.parse(JSON.stringify(obj, (_, value) => (typeof value === "bigint" ? value.toString() : value)));

        const leaderboard = leaderboardData.map((entry, index) => ({
            rank: index + 1, // Assign rank based on sorted position
            totalTransactionMoney: convertBigIntToString(entry.totalTransactionMoney),
            users: entry.users.map((u) => ({
                id: u.id,
                name: u.name,
                username: u.username,
                email: u.email,
                Money: convertBigIntToString(u.Money),
                totalTransactionDone: u.totalTransactionDone,
            })),
        }));

        res.status(200).json({ leaderboard });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard data.' });
    }
});


router.get('/user_list',authorizeAdmin ,async (req , res) => {
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





export default router
