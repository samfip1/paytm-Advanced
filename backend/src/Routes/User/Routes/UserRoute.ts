import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();




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
