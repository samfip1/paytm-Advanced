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
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const SECRET_KEY = endpoints_config_1.default.SK;
const router = express_1.default.Router();
const SECRET_KET_ADMIN = endpoints_config_1.default.SK_Admin;
const admin_middleware_1 = require("../Middleware/admin.middleware");
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
router.post('/user_list/delete_user', admin_middleware_1.authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userid, reason } = req.body;
    // Input validation
    if (!userid) {
        res.status(400).json({ message: "userid is required" });
        return;
    }
    try {
        const existingUser = yield prisma.user.findFirst({
            where: { userid },
            select: {
                id: true,
                Money: true,
                username: true,
                createdAt: true,
                email: true,
                phone: true,
                totalnumberofSignin: true,
                totalTransactionDone: true,
                userid: true
            },
        });
        if (!existingUser) {
            res.status(404).json({ message: "Userid Not found" });
            return;
        }
        if (!existingUser.userid) {
            res.status(500).json({ message: "Internal Server Error: Userid is invalid in database." });
            return;
        }
        const deletedUser = yield prisma.user.delete({ where: { id: existingUser.id } });
        const existingFraudRecord = yield prisma.fraud_People.findFirst({
            where: { fraud_people_userid: userid },
        });
        if (!existingFraudRecord) {
            yield prisma.fraud_People.create({
                data: {
                    fraud_people_userid: userid,
                    reason: reason,
                    Total_Money: existingUser.Money,
                    username: existingUser.username,
                    createdAt: existingUser.createdAt,
                    email: existingUser.email,
                    phone: existingUser.phone,
                    totalnumberofSignin: existingUser.totalnumberofSignin,
                    totalTransactionDone: existingUser.totalTransactionDone,
                },
            });
        }
        else {
            console.log(`Fraud record already exists for userid: ${userid}`);
        }
        res.json({ deletedUser });
    }
    catch (error) {
        console.error("Error during user deletion:", error);
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        res.status(500).json({ error: "Something went wrong", details: errorMessage });
    }
}));
router.post('/user_list/freeze_money', admin_middleware_1.authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userid } = req.body;
    try {
        const existingUser = yield prisma.user.findFirst({
            where: {
                userid: userid
            }
        });
        if (!existingUser) {
            throw new Error("Userid Not found");
        }
        const freeze_money = yield prisma.user.update({
            where: {
                userid: userid
            },
            data: {
                Money: 0
            }
        });
        res.json({ freeze_money });
        return;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        res.status(400).json({
            message: errorMessage
        });
    }
}));
router.get('/donation_list', admin_middleware_1.authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const all_donation_lis = yield prisma.donation.findMany({
            orderBy: {
                donatedAt: 'asc',
                DonatedMoney: 'desc'
            },
            select: {
                donatedAt: true,
                donationId: true,
                DonatedMoney: true,
                senderId: true,
                senderUsername: true,
                message: true
            }
        });
        res.status(200).json({ all_donation_lis });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        res.json({
            message: errorMessage
        });
    }
}));
exports.default = router;
