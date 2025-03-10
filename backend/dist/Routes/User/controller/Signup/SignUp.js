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
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const endpoints_config_1 = __importDefault(require("../../Middleware/endpoints.config"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const SECRET_KEY = endpoints_config_1.default.SK;
const router = express_1.default.Router();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
const uuid_1 = require("uuid");
// Generate a unique userid using a combination of UUID and timestamp
const uniqueTimestamp = Date.now();
const uniqueUuid = (0, uuid_1.v4)();
// Combine UUIDv4 and timestamp for an even more unique identifier
const uniqueUserId = `${uniqueUuid}-${uniqueTimestamp}`;
// Utility function to convert BigInt values to strings
const convertBigIntToString = (obj) => {
    return JSON.parse(JSON.stringify(obj, (_, value) => (typeof value === "bigint" ? value.toString() : value)));
};
// Function to validate user and create a new account
const isValidUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, name, email, phone, transaction_Pin } = user;
    // Check for duplicate email, username, or phone
    const existingUser = yield prisma.user.findFirst({
        where: {
            OR: [{ email }, { username }, { phone }],
        },
    });
    if (existingUser) {
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
    const hashedPassword = bcryptjs_1.default.hashSync(password, 12);
    const referralId = BigInt(Math.floor(Math.random() * 204482234));
    const randomMoney = BigInt(Math.floor(Math.random() * (875888565 - 7856 + 1)) + 18976009);
    // Create the new user with a valid leaderboard reference
    const newUser = yield prisma.user.create({
        data: {
            username,
            password: hashedPassword,
            name,
            email,
            Money: randomMoney,
            phone,
            userid: uniqueUserId,
            referralId,
            CreditScore: 0,
        },
    });
    // Insert transaction PIN
    yield prisma.transaction_Pass.create({
        data: {
            user: { connect: { userid: newUser.userid } },
            transaction_Pin: transaction_Pin,
        },
    });
    return newUser;
});
// Signup Route
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, name, email, phone, transaction_Pin } = req.body;
    if (!username || !password || !name || !email || !phone || !transaction_Pin) {
        res.status(400).json({ error: "All required information must be provided" });
        return;
    }
    try {
        const newUser = yield isValidUser({
            username,
            password,
            name,
            email,
            Money: 0,
            phone: BigInt(phone),
            userid: uniqueUserId,
            transaction_Pin,
        });
        // Generate JWT token for authentication
        const token = jsonwebtoken_1.default.sign({ id: newUser.id, username: newUser.username }, SECRET_KEY, { expiresIn: "1h" });
        res.cookie("token", token, { httpOnly: true });
        res.status(201).json({
            message: "User created successfully",
            user: convertBigIntToString(newUser),
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        res.status(500).json({ message: errorMessage });
    }
}));
exports.default = router;
