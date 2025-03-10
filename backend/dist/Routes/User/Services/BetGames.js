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
function betgames(money) {
    return __awaiter(this, void 0, void 0, function* () {
        if (money.bet_number_choice < 0 || money.input_number < 0) {
            throw new Error("Invalid input: Values must be non-negative numbers.");
        }
        const integer_number = money.bet_number_choice;
        const upper_limit = integer_number % 10;
        let price_money = 0;
        try {
            const bet_number = Math.floor(Math.random() * Math.pow(10, upper_limit));
            if (bet_number === money.input_number) {
                if (bet_number < 2) {
                    price_money = money.input_number + 3 * money.input_number;
                }
                else if (bet_number < 4) {
                    price_money = money.input_number + 8 * money.input_number;
                }
                else if (bet_number < 6) {
                    price_money = money.input_number + 20 * money.input_number;
                }
                else {
                    price_money = money.input_number + 50 * money.input_number;
                }
            }
            else {
                let per = 0;
                const percentageDifference = (Math.abs(bet_number - money.input_number) / money.input_number) * 100;
                if (percentageDifference < 10) {
                    per = 2 * money.input_number;
                }
                else if (percentageDifference < 20) {
                    per = 1.5 * money.input_number;
                }
                else if (percentageDifference < 50) {
                    per = 1.2 * money.input_number;
                }
                else {
                    per = 1 * money.input_number;
                }
                price_money += per;
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            throw new Error(`Error during game execution: ${errorMessage}`);
        }
        return price_money;
    });
}
router.post('/mini_games', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    const { bet_number_choice, input_number } = req.body;
    if (!username)
        throw new Error("Please Enter Username");
    try {
        if (bet_number_choice === undefined || input_number === undefined) {
            res.status(400).json({ error: "Invalid request body." });
            return;
        }
        const gamblingUser = yield prisma.user.findFirst({
            where: {
                username: username
            },
            select: {
                Money: true
            }
        });
        if (!gamblingUser) {
            throw new Error("User Does not Exist");
        }
        if (gamblingUser.Money < input_number) {
            throw new Error("You Don't have this much of money in your bank Account");
        }
        yield prisma.$transaction((atx) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const betmoneyuser = yield atx.user.update({
                    where: {
                        username: username
                    },
                    data: {
                        Money: {
                            decrement: input_number
                        },
                        CreditScore: {
                            increment: 20
                        }
                    }
                });
                return betmoneyuser;
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
                res.status(500).json({ success: false, error: errorMessage });
                return;
            }
        }));
        const money2 = { bet_number_choice, input_number };
        const result = yield betgames(money2);
        yield prisma.$transaction((atx) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const addmoneyUser = yield atx.user.update({
                    where: {
                        username: username
                    },
                    data: {
                        Money: {
                            increment: result
                        }
                    }
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
                res.status(500).json({ success: false, error: errorMessage });
                return;
            }
        }));
        res.status(200).json({ success: true, prize: result });
        return;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.status(500).json({ success: false, error: errorMessage });
        return;
    }
}));
exports.default = router;
