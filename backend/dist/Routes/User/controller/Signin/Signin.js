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
const convertBigIntToString = (obj) => {
    return JSON.parse(JSON.stringify(obj, (_, value) => (typeof value === "bigint" ? value.toString() : value)));
};
// Function to sign in the user
const signinUser = (signinUser) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, reffarelId } = signinUser;
    const existingUser = yield prisma.user.findFirst({ where: { username } });
    if (!existingUser || !bcryptjs_1.default.compareSync(password, existingUser.password)) {
        throw new Error("Invalid credentials");
    }
    try {
        yield prisma.$transaction((atc) => __awaiter(void 0, void 0, void 0, function* () {
            if (reffarelId != null) {
                const reffareluser = yield atc.user.findFirst({
                    where: {
                        referralId: reffarelId
                    }
                });
                if (reffareluser) {
                    yield atc.user.update({
                        where: {
                            id: reffareluser.id
                        },
                        data: {
                            Money: {
                                increment: 83456
                            }
                        }
                    });
                }
                if (!reffareluser) {
                    throw new Error("User with this Referral code Does not exist");
                }
            }
        }));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        console.log(errorMessage);
    }
    return existingUser;
});
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: "userid is required" });
        return;
    }
    var { reffarelId } = req.body;
    if (!reffarelId)
        reffarelId = null;
    try {
        const existingUser = yield signinUser({ username, password, reffarelId });
        const token = jsonwebtoken_1.default.sign({ id: existingUser.id, username: existingUser.username }, SECRET_KEY, { expiresIn: "1h" });
        yield prisma.user.update({
            where: {
                username: username,
            },
            data: {
                totalnumberofSignin: existingUser.totalnumberofSignin + 1,
                CreditScore: {
                    increment: 3
                }
            }
        });
        let rateofInterest = 0;
        const fi = existingUser.totalnumberofSignin % 18;
        if (fi == 0) {
            rateofInterest = Math.floor(Number(existingUser.Money) * 0.04);
        }
        yield prisma.user.update({
            where: {
                username: username
            },
            data: {
                Money: {
                    increment: rateofInterest
                }
            }
        });
        res.cookie("token", token, { httpOnly: true });
        res.status(200).json({
            message: "Successfully logged in",
            user: convertBigIntToString(existingUser),
            token: token
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        res.status(401).json({
            message: errorMessage || "Something went wrong",
        });
    }
}));
router.post("/logout", (req, res) => {
    const cookieName = "token";
    res.clearCookie(cookieName, {
        httpOnly: true,
        sameSite: 'strict'
    });
    res.status(200).json({ message: "Successfully logged out" });
});
router.get("/profile", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    if (!username) {
        res.status(400).json({ error: "Username is required" });
        return;
    }
    try {
        const existingUser = yield prisma.user.findFirst({
            where: {
                username: username
            }
        });
        if (!existingUser) {
            res.status(400).json({ error: "User with this username does not exist" });
            return;
        }
        res.status(200).json({
            user: convertBigIntToString(existingUser)
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        res.status(500).json({ error: "Something went wrong", details: errorMessage });
    }
}));
exports.default = router;
