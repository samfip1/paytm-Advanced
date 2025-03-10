import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as dotenv from 'dotenv';
dotenv.config();
import endpointsConfig from "../../Middleware/endpoints.config";

const prisma = new PrismaClient();
const app = express();
const SECRET_KEY = endpointsConfig.SK;

const router = express.Router();
        import { v4 as uuidv4 } from 'uuid';
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// TypeScript interface for admin signup
interface adminSignup {
    username: string;
    password: string;
    name: string;
    email: string;
    phone: string;
}

// Function to validate admin
const isValidAdmin = async (adminuser: adminSignup) => {
    const { username, password, name, email, phone } = adminuser;

    try {
        const admin = await prisma.admin.findFirst({
            where: {
                OR: [
                    { email },
                    { phone },
                    { username }
                ]
            }
        });

        if (admin) {
            if (admin.username === username) {
                throw new Error("Username already taken");
            }
            if (admin.email === email) {
                throw new Error("Email already taken");
            }
            if (admin.phone === phone) {
                throw new Error("Phone number already taken");
            }
        }



const uniqueTimestamp = Date.now();
const uniqueUuid = uuidv4();


const uniqueUserId = `${uniqueUuid}-${uniqueTimestamp}`;


        const hashPasswordAdmin = await bcrypt.hash(password, 12); 
        const Newadmin = await prisma.admin.create({
            data: {
                username,
                password: hashPasswordAdmin,
                name,
                email,
                phone,
                adminId: uniqueUserId
            }
        });

        return Newadmin;
    } catch (error) {
        console.error(error);
        throw error; 
    }
};

router.post('/', async (req, res) => {
    const { username, password, name, email, phone } = req.body;

    try {
        const newadminuser = await isValidAdmin({
            username,
            password,
            name,
            email,
            phone
        });



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
});

export default router;
