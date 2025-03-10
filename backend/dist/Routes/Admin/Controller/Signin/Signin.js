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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv = __importStar(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const endpoints_config_1 = __importDefault(require("../../Middleware/endpoints.config"));
dotenv.config();
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
const SECRET_KEY_ADMIN = endpoints_config_1.default.SK_Admin;
router.use((0, cors_1.default)());
router.use(express_1.default.json());
router.use((0, cookie_parser_1.default)());
function signinAdmin(admin) {
    return __awaiter(this, void 0, void 0, function* () {
        const { username, password } = admin;
        try {
            const adminLogger = yield prisma.admin.findFirst({
                where: { username },
            });
            if (!adminLogger) {
                throw new Error("Invalid username or password.");
            }
            const isPasswordValid = bcryptjs_1.default.compareSync(password, adminLogger.password);
            if (!isPasswordValid) {
                throw new Error("Invalid username or password.");
            }
            return adminLogger;
        }
        catch (error) {
            throw new Error("Error during login. Please try again later.");
        }
    });
}
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const loggedInAdmin = yield signinAdmin({ username, password });
        const token = jsonwebtoken_1.default.sign({ id: loggedInAdmin.id, username: loggedInAdmin.username }, SECRET_KEY_ADMIN, { expiresIn: "1h" });
        yield prisma.admin.update({
            where: { username },
            data: { totalsignin: loggedInAdmin.totalsignin + 1 },
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 3600000,
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
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An error occurred";
        res.status(401).json({ message: errorMessage });
    }
}));
exports.default = router;
