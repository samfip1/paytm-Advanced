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

app.use(cors());
app.use(express.json());
app.use(cookieParser());



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


router.post('/', async (req, res) => {
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



export default router
