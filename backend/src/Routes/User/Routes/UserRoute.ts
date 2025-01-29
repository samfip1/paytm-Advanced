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


const router = express.Router();

import Signin from '../controller/Signin/Signin';
import SignUp from '../controller/Signup/SignUp';

import BetGames from '../Services/BetGames';
import Blog from '../Services/Blog';
import Donation from '../Services/Donation';
import Loan from '../Services/Loan';
import MoneyRequest from '../Services/MoneyRequest';
import Social from '../Services/Social';
import Transfer from '../Services/Transfer';
import User from '../Services/User';

// Register Signin and Signup routes
router.use('/Signin', Signin);
router.use('/SignUp', SignUp);

// List of service routes
const services = {
  BetGames,
  Blog,
  Donation,
  Loan,
  MoneyRequest,
  Social,
  Transfer,
  User,
};

// Dynamically prepend '/Signin' to all service routes
Object.entries(services).forEach(([name, service]) => {
  router.use(`/Signin/${name}`, service);
});

export default router;
