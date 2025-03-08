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



const convertBigIntToString = (obj: any): any => {
    return JSON.parse(
        JSON.stringify(obj, (_, value) => (typeof value === "bigint" ? value.toString() : value))
    );
};





interface signinUser {
    username: string;
    password: string;
    reffarelId? : number;
}


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



// Signin Route
router.post("/", async (req, res) => {
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


        let rateofInterest = 0;
        const fi = existingUser.totalnumberofSignin % 18
        if( fi == 0) {
            rateofInterest = Math.floor(Number(existingUser.Money) * 0.04);
        }
        await prisma.user.update({
            where: {
                username : username
            },
            data: {
                Money: {
                    increment: rateofInterest
                }
            }
        })
        res.cookie("token", token, { httpOnly: true });
        res.status(200).json({
            message: "Successfully logged in",
            user : convertBigIntToString(existingUser)
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Something went wrong";
        res.status(401).json({
            message: errorMessage || "Something went wrong",
        });
    }
});




export default router
