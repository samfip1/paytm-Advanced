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
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
// const SECRET_KEY = endpointsConfig.SK;
const router = express_1.default.Router();
// const SECRET_KET_ADMIN = endpointsConfig.SK_Admin;
const admin_middleware_1 = require("../Middleware/admin.middleware");
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
router.put('/update', admin_middleware_1.authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, newUsername } = req.body;
    const adminUpdate = yield prisma.admin.findFirst({
        where: {
            username: newUsername
        }
    });
    if (adminUpdate) {
        throw new Error("This username already Exists");
    }
    const newadminUsernmae = yield prisma.admin.update({
        where: {
            username: username
        },
        data: {
            username: newUsername
        }
    });
    if (newadminUsernmae) {
        res.status(200).json({
            message: "Username Updated Scuccesfully"
        });
    }
    if (!newadminUsernmae) {
        res.status(500).json({
            message: "Something is Dowm from Our end"
        });
    }
}));
router.get('/profile', admin_middleware_1.authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.user;
    try {
        const AdminPRofile = yield prisma.admin.findUnique({
            where: {
                username: username
            },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                phone: true,
                adminId: true
            }
        });
        res.status(200).send(AdminPRofile);
    }
    catch (error) {
        console.log(error);
    }
}));
router.get('/user_transaction', admin_middleware_1.authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allTransactionList = yield prisma.transaction.findMany();
        const jsonCompatibleTransactions = allTransactionList.map(transaction => {
            return Object.fromEntries(Object.entries(transaction).map(([key, value]) => {
                return [key, typeof value === 'bigint' ? value.toString() : value];
            }));
        });
        res.status(200).json(jsonCompatibleTransactions);
    }
    catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Failed to fetch transactions" });
    }
}));
router.get('/user_list', admin_middleware_1.authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const total_user_list = yield prisma.user.findMany({
            orderBy: {
                Money: 'desc'
            },
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                Money: true,
                phone: true,
                userid: true,
                totalTransactionDone: true,
                totalnumberofSignin: true,
                createdAt: true,
                updatedAt: true
            }
        });
        const userListWithStrings = total_user_list.map(user => (Object.assign(Object.assign({}, user), { Money: user.Money.toString(), phone: user.phone.toString() })));
        res.status(200).json({ total_user_list: userListWithStrings });
    }
    catch (error) {
        console.error('Error fetching user list:', error);
        res.status(500).json({ error: 'Failed to fetch user list' });
    }
}));
exports.default = router;
