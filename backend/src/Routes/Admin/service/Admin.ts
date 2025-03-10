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





router.get('/user_transaction', authorizeAdmin, async (req, res) => {
    try {
      const allTransactionList = await prisma.transaction.findMany();

      
      const jsonCompatibleTransactions = allTransactionList.map(transaction => {
        return Object.fromEntries(
          Object.entries(transaction).map(([key, value]) => {
            return [key, typeof value === 'bigint' ? value.toString() : value];
          })
        );
      });

      res.status(200).json(jsonCompatibleTransactions);

    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
});




router.get('/user_list', authorizeAdmin, async (req, res) => {
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

        
        const userListWithStrings = total_user_list.map(user => ({
            ...user,
            Money: user.Money.toString(),
            phone: user.phone.toString(),
            
        }));


        res.status(200).json({ total_user_list: userListWithStrings });
    } catch (error) {
        console.error('Error fetching user list:', error);
        res.status(500).json({ error: 'Failed to fetch user list' });
    }
});


export default router

