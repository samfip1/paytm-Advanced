import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());




const router = express.Router();


import Signin from '../Controller/Signin/Signin'
import SignUp from '../Controller/Signup/Signup'
import UserOperation from '../service/Admin'
import ControlPanel from '../service/AuthWork'

// Register Signin and Signup routes
router.use('/Signin', Signin);
router.use('/SignUp', SignUp);

// List of service routes
const services = {
    UserOperation,
    ControlPanel
};

// Dynamically prepend '/Signin' to all service routes
Object.entries(services).forEach(([name, service]) => {
  router.use(`/Signin/${name}`, service);
});

export default router;

