import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authenticateToken } from "./Middleware/auth.middleware";
import * as dotenv from 'dotenv';
dotenv.config();
import endpointsConfig from "./Routes/User/Middleware/endpoints.config";
const prisma = new PrismaClient();
const app = express();
const SECRET_KEY = endpointsConfig.SK;
import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid'; 
import zod from "zod";

const router = express.Router();



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





export default router
