"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
const router = express_1.default.Router();
const Signin_1 = __importDefault(require("../controller/Signin/Signin"));
const SignUp_1 = __importDefault(require("../controller/Signup/SignUp"));
const BetGames_1 = __importDefault(require("../Services/BetGames"));
const Donation_1 = __importDefault(require("../Services/Donation"));
const Transfer_1 = __importDefault(require("../Services/Transfer"));
const Balance_1 = __importDefault(require("../Services/Balance"));
router.use("/Signin", Signin_1.default);
router.use("/SignUp", SignUp_1.default);
const services = {
    BetGames: BetGames_1.default,
    Donation: Donation_1.default,
    Transfer: Transfer_1.default,
    Balance: Balance_1.default
};
Object.entries(services).forEach(([name, service]) => {
    router.use(`/Signin/${name}`, service);
});
exports.default = router;
