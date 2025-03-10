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
router.post('/Money_request', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiverUsername, senderusername, money, message } = req.body;
    if (!receiverUsername || !senderusername || !money || !message) {
        res.status(400).json({ error: "All the information is not provided" });
        return;
    }
    try {
        const moneytakerusername = yield prisma.user.findFirst({
            where: { username: senderusername },
            select: { Money: true, userid: true },
        });
        const moneysenderusername = yield prisma.user.findFirst({
            where: { username: receiverUsername },
            select: { Money: true, username: true, userid: true },
        });
        if (!moneysenderusername) {
            throw new Error("Sender Username is not available");
        }
        if (!moneytakerusername) {
            throw new Error("Receiver Username is not available");
        }
        const uniqueTimestamp = Date.now();
        const uniqueUuid = (0, uuid_1.v4)();
        // Combine UUIDv4 and timestamp for an even more unique identifier
        const uniqueUserId = `${uniqueUuid}-${uniqueTimestamp}`;
        const requesting_user = yield prisma.moneyRequest.create({
            data: {
                moneyRequestId: uniqueUserId,
                money: money,
                reciverId: moneysenderusername.userid,
                senderId: moneytakerusername.userid,
                message: message,
                status: "Pending",
            },
        });
        res.json({ requesting_user });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error });
    }
}));
router.post('/request_for_approval', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { moneyRequestId, action } = req.body; // `action` can be "accept" or "reject"
    if (!moneyRequestId || !action) {
        res.status(400).json({ error: "All the information is not provided" });
        return;
    }
    try {
        // Fetch the money request
        const moneyRequest = yield prisma.moneyRequest.findFirst({
            where: { moneyRequestId },
        });
        if (!moneyRequest) {
            throw new Error("Invalid Money Request");
        }
        // Validate action
        if (action !== "accept" && action !== "reject") {
            throw new Error("Invalid action. Action must be either 'accept' or 'reject'");
        }
        // If action is "reject", update the status and return
        if (action === "reject") {
            yield prisma.moneyRequest.update({
                where: { moneyRequestId },
                data: { status: "rejected" },
            });
            res.json({ message: "Money request rejected successfully" });
            return;
        }
        // Action is "accept" — perform the money transfer
        const { money, senderId, reciverId } = moneyRequest;
        // Fetch sender and receiver details
        const sender = yield prisma.user.findFirst({
            where: { userid: senderId },
            select: { Money: true },
        });
        const receiver = yield prisma.user.findFirst({
            where: { userid: reciverId },
            select: { Money: true },
        });
        if (!sender || !receiver) {
            throw new Error("Sender or receiver not found");
        }
        if (sender.Money < money) {
            throw new Error("Insufficient balance in the sender's account");
        }
        // Perform the money transfer
        yield prisma.user.update({
            where: { userid: senderId },
            data: {
                Money: sender.Money - money,
                CreditScore: 12
            },
        });
        yield prisma.user.update({
            where: { userid: reciverId },
            data: {
                Money: receiver.Money + money,
                CreditScore: {
                    decrement: 5
                }
            },
        });
        // Update the money request status
        yield prisma.moneyRequest.update({
            where: { moneyRequestId },
            data: { status: "accepted" },
        });
        res.json({ message: "Money request accepted and processed successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error });
    }
}));
exports.default = router;
