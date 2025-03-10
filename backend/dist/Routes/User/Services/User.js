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
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const endpoints_config_1 = __importDefault(require("../Middleware/endpoints.config"));
const auth_middleware_1 = require("../Middleware/auth.middleware");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
const SECRET_KEY = endpoints_config_1.default.SK;
// Middleware
router.use((0, cors_1.default)());
router.use(express_1.default.json());
router.use((0, cookie_parser_1.default)());
// Utility function to convert BigInt values to strings
const convertBigIntToString = (obj) => {
    return JSON.parse(JSON.stringify(obj, (_, value) => (typeof value === "bigint" ? value.toString() : value)));
};
// Leaderboard Route
router.get('/leaderboard', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leaderboardData = yield prisma.leaderboard.findMany({
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        email: true,
                        Money: true,
                        totalTransactionDone: true,
                    },
                },
            },
            orderBy: { totalTransactionMoney: 'desc' }, // Sort leaderboard by total money
        });
        if (leaderboardData.length === 0) {
            res.status(200).json({ message: "No leaderboard data available." });
            return;
        }
        const leaderboard = leaderboardData.map((entry, index) => ({
            rank: index + 1, // Assign rank based on position
            totalTransactionMoney: convertBigIntToString(entry.totalTransactionMoney),
            users: entry.users
                .sort((a, b) => Number(b.Money) - Number(a.Money)) // Sort users by Money
                .map((u) => ({
                id: u.id,
                name: u.name,
                username: u.username,
                email: u.email,
                Money: convertBigIntToString(u.Money),
                totalTransactionDone: u.totalTransactionDone,
            })),
        }));
        res.status(200).json({ leaderboard });
    }
    catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard data.' });
    }
}));
exports.default = router;
