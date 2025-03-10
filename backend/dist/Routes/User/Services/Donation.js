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
const auth_middleware_1 = require("../Middleware/auth.middleware");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const router = express_1.default.Router();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
const uuid_1 = require("uuid");
router.post('/Make_Donation', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { userid, DonatedMoney, message } = req.body;
    if (!message)
        message = "";
    if (!userid || DonatedMoney === undefined || DonatedMoney === null) {
        res.status(400).json({ error: "All the information is not provided" });
        return;
    }
    const donatedMoneyNumber = Number(DonatedMoney);
    if (isNaN(donatedMoneyNumber)) {
        res.status(400).json({ error: "DonatedMoney must be a valid number" });
        return;
    }
    try {
        yield prisma.$transaction((tsx) => __awaiter(void 0, void 0, void 0, function* () {
            const existingUser = yield tsx.user.findFirst({
                where: {
                    userid: userid
                },
                select: {
                    Money: true,
                    username: true,
                    userid: true,
                }
            });
            if (!existingUser) {
                res.status(404).json({ error: "User not Found" });
                return;
            }
            if (existingUser.Money < donatedMoneyNumber) {
                res.status(400).json({ error: "Sorry to say But you don't have enough money" });
                return;
            }
            const uniqueTimestamp = Date.now();
            const uniqueUuid = (0, uuid_1.v4)();
            const uniqueUserId = `${uniqueUuid}-${uniqueTimestamp}`;
            const donation = yield tsx.donation.create({
                data: {
                    donationId: uniqueUserId,
                    senderUsername: existingUser.username,
                    senderId: existingUser.userid,
                    DonatedMoney: donatedMoneyNumber,
                    message: message
                }
            });
            const creditedScore = Math.random() * 27 + 26;
            yield tsx.user.update({
                where: {
                    userid: userid
                },
                data: {
                    Money: {
                        decrement: donatedMoneyNumber
                    },
                    CreditScore: {
                        increment: creditedScore
                    }
                }
            });
            const donationResponse = Object.assign(Object.assign({}, donation), { DonatedMoney: donation.DonatedMoney.toString() });
            res.status(200).json({ message: "Donation successful", donation: donationResponse });
            return;
        }));
    }
    catch (error) {
        console.error("Donation Error:", error);
        res.status(500).json({ error: "Something went wrong during donation", details: error.message });
        return;
    }
}));
exports.default = router;
