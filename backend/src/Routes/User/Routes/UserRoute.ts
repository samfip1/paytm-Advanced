import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const router = express.Router();

import Signin from "../controller/Signin/Signin";
import SignUp from "../controller/Signup/SignUp";

import BetGames from "../Services/BetGames";
import Donation from "../Services/Donation";
import Transfer from "../Services/Transfer";
import Balance from "../Services/Balance";

router.use("/Signin", Signin);
router.use("/SignUp", SignUp);


const services = {
    BetGames,
    Donation,
    Transfer,
    Balance
};


Object.entries(services).forEach(([name, service]) => {
    router.use(`/Signin/${name}`, service);
});

export default router;
