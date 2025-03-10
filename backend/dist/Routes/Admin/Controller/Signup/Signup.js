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
const uuid_1 = require("uuid");
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Function to validate admin
const isValidAdmin = (adminuser) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, name, email, phone } = adminuser;
    try {
        const admin = yield prisma.admin.findFirst({
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
        const uniqueUuid = (0, uuid_1.v4)();
        const uniqueUserId = `${uniqueUuid}-${uniqueTimestamp}`;
        const hashPasswordAdmin = yield bcryptjs_1.default.hash(password, 12);
        const Newadmin = yield prisma.admin.create({
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
    }
    catch (error) {
        console.error(error);
        throw error;
    }
});
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, name, email, phone } = req.body;
    try {
        const newadminuser = yield isValidAdmin({
            username,
            password,
            name,
            email,
            phone
        });
        if (!newadminuser) {
            throw new Error("Failed to create new admin user");
        }
        const token = jsonwebtoken_1.default.sign({ id: newadminuser.id, username: newadminuser.username }, SECRET_KEY, { expiresIn: "1h" });
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
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        res.status(500).json({ message: errorMessage });
    }
}));
exports.default = router;
