"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const authMiddleware_1 = require("./Middleware/authMiddleware");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const endpoints_config_1 = __importDefault(require("./Middleware/endpoints.config"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const SECRET_KEY = endpoints_config_1.default.SK;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Function to check if the user is valid and create a new user
const isValidUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, name, email, phone } = user;
    // Check for duplicate email, username, or phone
    const existingUser = yield prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { username },
                { phone }
            ],
        },
    });
    if (existingUser) {
        // Customize the error message based on which field is duplicated
        if (existingUser.email === email) {
            throw new Error("A user with this email already exists.");
        }
        if (existingUser.username === username) {
            throw new Error("A user with this username already exists.");
        }
        if (existingUser.phone === phone) {
            throw new Error("A user with this phone number already exists.");
        }
    }
    // Generate a unique user ID and hashed password
    const userId = Math.floor(Math.random() * 10000000);
    const hashedPassword = bcryptjs_1.default.hashSync(password, 12);
    // Generate a random money value
    const randomMoney = Math.floor(Math.random() * (1000000000 - 10000000 + 1)) + 10000000;
    // Create a new user in the database
    const newUser = yield prisma.user.create({
        data: {
            username,
            password: hashedPassword,
            name,
            email,
            Money: randomMoney,
            phone,
            userid: userId,
        },
    });
    return newUser;
});
// Function to sign in the user
const signinUser = (signinUser) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = signinUser;
    const existingUser = yield prisma.user.findFirst({ where: { username } });
    if (!existingUser || !bcryptjs_1.default.compareSync(password, existingUser.password)) {
        throw new Error("Invalid credentials");
    }
    return existingUser;
});
// Signup Route
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, name, email, phone } = req.body;
    try {
        const newUser = yield isValidUser({
            username,
            password,
            name,
            email,
            Money: 0,
            phone,
            userid: 0
        });
        const token = jsonwebtoken_1.default.sign({ id: newUser.id, username: newUser.username }, SECRET_KEY, { expiresIn: "1h" });
        res.cookie("token", token, { httpOnly: true });
        res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser.id,
                username: newUser.username,
                name: newUser.name,
                email: newUser.email,
                money: newUser.Money,
                phone: newUser.phone,
                createAt: newUser.createdAt,
                userid: newUser.userid
            },
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        res.status(500).json({ message: errorMessage });
    }
}));
// Signin Route
app.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const existingUser = yield signinUser({ username, password });
        const token = jsonwebtoken_1.default.sign({ id: existingUser.id, username: existingUser.username }, SECRET_KEY, { expiresIn: "1h" });
        res.cookie("token", token, { httpOnly: true });
        res.status(200).json({
            message: "Successfully logged in",
            user: {
                id: existingUser.id,
                username: existingUser.username,
                token: token,
                userid: existingUser.userid
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        res.status(401).json({
            message: errorMessage || "Something went wrong",
        });
    }
}));
// Get User Balance Route
app.get("/signin/balance", authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.user;
    try {
        const user = yield prisma.user.findUnique({ where: { id: userid.id } });
        if (!user) {
            throw new Error("User not found");
        }
        res.status(200).json({ balance: user.Money });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        res.status(500).json({
            message: errorMessage || "Something went wrong",
        });
    }
}));
app.post('/signin/update', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, newUsername } = req.body;
    // Check if required fields are provided
    if (!username || !newUsername) {
        res.status(400).json({ message: "Username and newUsername are required" });
        return;
    }
    try {
        // Check if the new username already exists
        const updateUser = yield prisma.user.findFirst({
            where: {
                username: newUsername
            }
        });
        if (updateUser) {
            res.status(400).json({
                message: "Username already exists"
            });
            return;
        }
        // Proceed with updating the username
        yield prisma.user.update({
            where: {
                username: username
            },
            data: {
                username: newUsername
            }
        });
        res.status(200).json({
            message: "Username updated successfully",
            newUsername
        });
    }
    catch (error) {
        console.error("Error updating username:", error);
        res.status(500).json({
            message: "An error occurred while updating the username"
        });
    }
}));
app.get("/signin/account", authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user) {
        res.status(400).json({ message: "User information not found in request." });
        return;
    }
    try {
        // Fetch user details from the database using Prisma or any ORM
        const accountDetails = yield prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                username: true,
                Money: true,
                phone: true,
                email: true,
                userid: true
            },
        });
        if (!accountDetails) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        res.status(200).json(accountDetails);
    }
    catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
function transferFunds(senderUsername, recipientUsername, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
            // Step 1: Fetch sender and recipient to validate the operation
            const sender = yield prisma.user.findUnique({ where: { username: senderUsername } });
            const recipient = yield prisma.user.findUnique({ where: { username: recipientUsername } });
            if (!sender) {
                throw new Error("Sender not found");
            }
            if (!recipient) {
                throw new Error("Recipient not found");
            }
            if (sender.Money < amount) {
                throw new Error("Insufficient funds");
            }
            // Step 2: Debit the sender's account
            yield prisma.user.update({
                where: { username: senderUsername },
                data: { Money: { decrement: amount } },
            });
            // Step 3: Credit the recipient's account
            yield prisma.user.update({
                where: { username: recipientUsername },
                data: { Money: { increment: amount } },
            });
            console.log(`Transferred ${amount} from ${senderUsername} to ${recipientUsername}`);
        }));
    });
}
app.post('/signin/transfer', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { recipientusername, amount } = req.body;
    const senderusername = (_a = req.user) === null || _a === void 0 ? void 0 : _a.username; // Ensure this is safely accessed using optional chaining `?`
    if (!senderusername) {
        res.status(400).json({ message: "Sender is not authenticated" });
        return;
    }
    try {
        // Perform the fund transfer within a transaction
        yield transferFunds(senderusername, recipientusername, amount);
        // Send a success response
        res.status(200).json({
            message: `Transferred ${amount} from ${senderusername} to ${recipientusername}`,
        });
    }
    catch (error) {
        res.status(400).json({
            message: "Transaction failed"
        });
    }
}));
// Start Server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
