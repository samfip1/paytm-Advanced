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
router.post('/blog/create_blog', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, username, HeadingOfContent } = req.body;
    if (!content || !username || !HeadingOfContent) {
        res.status(400).json({ error: "All the information is not provided" });
        return;
    }
    try {
        const existingUser = yield prisma.user.findFirst({
            where: {
                username: username
            }
        });
        if (!existingUser) {
            throw new Error("User Not found");
        }
        if (content == "" || HeadingOfContent == "") {
            throw new Error("PLease enter Content to post the information");
        }
        const uniqueTimestamp = Date.now();
        const uniqueUuid = (0, uuid_1.v4)();
        // Combine UUIDv4 and timestamp for an even more unique identifier
        const uniqueUserId = `${uniqueUuid}-${uniqueTimestamp}`;
        const blogUser = yield prisma.blog.create({
            data: {
                content: content,
                contentId: uniqueUserId,
                numberOflike: 0,
                username: username,
                HeadingOfContent: HeadingOfContent
            }
        });
        res.status(200).json({ blogUser });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something Went wrong";
        res.json({ errorMessage });
    }
}));
router.get('/blog', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    if (!username) {
        res.status(400).json({ error: 'username is required' });
        return;
    }
    try {
        let blogs = yield prisma.blog.findMany({});
        // Shuffle the blogs array
        blogs = blogs.sort(() => Math.random() - 0.5);
        res.status(200).json(blogs);
    }
    catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
router.get('/blog/like_comment', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userid, contentId } = req.body; // Assuming `userid` is provided as a query parameter.
    if (!userid || !contentId) {
        res.status(400).json({ error: 'userid is required' });
        return;
    }
    try {
        const like_comment = yield prisma.blog.update({
            where: {
                contentId: contentId
            },
            data: {
                numberOflike: {
                    increment: 1
                }
            }
        });
        res.status(200).json({ like_comment });
    }
    catch (error) {
        console.error('Error Liking blogs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
exports.default = router;
