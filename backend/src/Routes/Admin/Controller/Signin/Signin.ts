// TypeScript interface for AdminLogin
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import cookieParser from "cookie-parser";
import cors from "cors";
import endpointsConfig from "../../Middleware/endpoints.config";
dotenv.config();
const prisma = new PrismaClient();
const router = express.Router();

// Replace with your actual secret key
const SECRET_KEY_ADMIN = endpointsConfig.SK_Admin;

// Middleware setup
router.use(cors());
router.use(express.json());
router.use(cookieParser());

// TypeScript interface for AdminLogin
interface AdminLogin {
  username: string;
  password: string;
}

// Function to handle admin login
async function signinAdmin(admin: AdminLogin) {
  const { username, password } = admin;

  try {
    const adminLogger = await prisma.admin.findFirst({
      where: { username },
    });

    if (!adminLogger) {
      throw new Error("Invalid username or password.");
    }

    const isPasswordValid = bcrypt.compareSync(password, adminLogger.password);
    if (!isPasswordValid) {
      throw new Error("Invalid username or password.");
    }

    return adminLogger;
  } catch (error) {
    throw new Error("Error during login. Please try again later.");
  }
}

// Admin login route
router.post("/", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const loggedInAdmin = await signinAdmin({ username, password });

    const token = jwt.sign(
      { id: loggedInAdmin.id, username: loggedInAdmin.username },
      SECRET_KEY_ADMIN,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Update total sign-in count
    await prisma.admin.update({
      where: { username },
      data: { totalsignin: loggedInAdmin.totalsignin + 1 },
    });

    
    // Set cookie securely
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: "strict",
      maxAge: 3600000, // 1 hour
    });

    res.status(200).json({
      message: "Successfully logged in",
      user: {
        id: loggedInAdmin.id,
        username: loggedInAdmin.username,
        token,
        adminid: loggedInAdmin.adminId,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    res.status(401).json({ message: errorMessage });
  }
});

export default router;
