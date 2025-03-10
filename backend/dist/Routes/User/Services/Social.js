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
/**
 * Send Friend Request
 */
router.post('/send-request', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderUsername, receiverId, receiverUsername } = req.body;
    try {
        const existingUser = yield prisma.user.findFirst({
            where: { username: senderUsername },
            select: { userid: true }
        });
        if (!existingUser) {
            res.status(404).json({ error: "Sender username not found" });
            return;
        }
        const receiverUser = yield prisma.user.findFirst({
            where: { userid: receiverId }
        });
        if (!receiverUser) {
            res.status(404).json({ error: "Receiver user not found" });
            return;
        }
        // Check if request already exists
        const existingRequest = yield prisma.requestFriend.findFirst({
            where: { userId: receiverId, username: senderUsername }
        });
        if (existingRequest) {
            res.status(400).json({ error: "Friend request already sent" });
            return;
        }
        // Add to sender's sentRequests
        yield prisma.sentRequest.create({
            data: { userId: existingUser.userid, username: receiverUsername }
        });
        // Add to receiver's receivedRequests
        yield prisma.requestFriend.create({
            data: { userId: receiverId, username: senderUsername }
        });
        // Increment totalRequests
        yield prisma.user.update({
            where: { userid: receiverId },
            data: { totalRequests: { increment: 1 } }
        });
        res.json({ message: 'Friend request sent successfully.' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send friend request' });
    }
}));
/**
 * Accept Friend Request
 */
router.post('/accept-request', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, friendId } = req.body;
    try {
        // Check if they are already friends
        const existingFriendship = yield prisma.friend.findFirst({
            where: { userId, friendId }
        });
        if (existingFriendship) {
            res.status(400).json({ error: "Already friends" });
            return;
        }
        // Add both users as friends
        yield prisma.friend.createMany({
            data: [
                { userId, friendId },
                { userId: friendId, friendId: userId }
            ]
        });
        // Remove from receivedRequests
        yield prisma.requestFriend.deleteMany({
            where: { userId, username: friendId }
        });
        // Remove from sender's sentRequests
        yield prisma.sentRequest.deleteMany({
            where: { userId: friendId, username: userId }
        });
        res.json({ message: 'Friend request accepted successfully.' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to accept friend request' });
    }
}));
/**
 * Get All Friends of Logged-in User
 */
router.get('/allFriends', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userid } = req.body; // Extract from authenticated user
    try {
        // Find the user's friends
        const allFriends = yield prisma.friend.findMany({
            where: { userId: userid },
            select: { friendId: true }
        });
        res.status(200).json({ friends: allFriends });
    }
    catch (error) {
        console.error("Error fetching friends:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
/**
 * Get Friends by User ID (Only for Authenticated User)
 */
router.get('/friends', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userid } = req.body;
    try {
        const friends = yield prisma.friend.findMany({
            where: { userId: userid },
            select: { friendId: true }
        });
        res.json(friends);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch friends list' });
    }
}));
exports.default = router;
