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
const uuid_1 = require("uuid");
dotenv.config();
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const router = express_1.default.Router();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
function transfer(senderusername, recieveusernmae, amount, transaction_Pin, comment) {
    return __awaiter(this, void 0, void 0, function* () {
        const uniqueTimestamp = Date.now();
        const uniqueUuid = (0, uuid_1.v4)();
        const uniqueUserId = `${uniqueUuid}-${uniqueTimestamp}`;
        try {
            yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const sender = yield tx.user.findUnique({
                    where: { username: senderusername },
                    select: {
                        Money: true,
                        username: true,
                        totalTransactionDone: true,
                        transaction_Pass: {
                            select: {
                                transaction_Pin: true
                            }
                        },
                        userid: true
                    },
                });
                if (!sender) {
                    throw new Error(`Sender with username ${senderusername} does not exist.`);
                }
                // Check if the provided transaction_Pin matches any of the user's stored pins
                const hasValidPin = sender.transaction_Pass.some(tp => Number(tp.transaction_Pin) === transaction_Pin);
                if (!hasValidPin) {
                    throw new Error('Your Transaction pin is Incorrect');
                }
                const platformFee = sender.Money > 10000000 ? 180 : 18; // Use ternary operator for conciseness
                if (sender.Money < amount + platformFee) {
                    throw new Error(`${senderusername} doesn't have enough balance to send ${amount} including platform fee.`);
                }
                const updatedSender = yield tx.user.update({
                    where: { username: senderusername },
                    data: {
                        Money: { decrement: amount + platformFee },
                        totalTransactionDone: sender.totalTransactionDone + 1,
                        CreditScore: { increment: 6 },
                    },
                });
                console.log(`Sender's new balance: ${updatedSender.Money}`);
                // Remove the random amount increment.  This seems like a bug.
                // const newamount = Math.floor(Math.random() * 5675);
                // await tx.user.update({
                //   where: {
                //     username: senderusername
                //   },
                //   data: {
                //     Money: {
                //       increment: BigInt(newamount)
                //     }
                //   }
                // });
                const recipient = yield tx.user.update({
                    where: { username: recieveusernmae },
                    data: { Money: { increment: amount } },
                });
                const payment = yield prisma.transaction.create({
                    data: {
                        receiverId: recipient.userid,
                        senderUsername: senderusername,
                        receiverUsername: recieveusernmae,
                        amount: amount,
                        trasanctionId: uniqueUserId,
                        Comment: comment,
                        senderId: sender.userid, // Use sender.userid directly
                    },
                });
                console.log(payment);
                console.log(`Recipient's new balance: ${recipient.Money}`);
            }), {
                maxWait: 5000,
                timeout: 10000,
            });
            console.log(`Successfully transferred ${amount} from ${senderusername} to ${recieveusernmae}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            console.error(errorMessage);
            throw error;
        }
    });
}
router.post('/', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { from, to, amount, transaction_pin } = req.body;
    let { comment } = req.body;
    if (!from || !to || typeof amount !== 'number' || amount <= 0 || typeof transaction_pin !== 'number') {
        res.status(400).json({ error: 'Invalid input. Please provide valid `from`, `to`, `amount`, and `transaction_pin`.' });
        return;
    }
    comment = comment || "";
    try {
        yield transfer(from, to, amount, transaction_pin, comment);
        res.status(200).json({ message: `Successfully transferred ${amount} from ${from} to ${to}.` });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.status(500).json({ error: errorMessage });
    }
}));
exports.default = router;
