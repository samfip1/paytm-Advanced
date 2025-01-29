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

router.post('/signin', async (req, res) => {
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




export default router
