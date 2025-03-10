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
const Signin_1 = __importDefault(require("../Controller/Signin/Signin"));
const Signup_1 = __importDefault(require("../Controller/Signup/Signup"));
const Admin_1 = __importDefault(require("../service/Admin"));
const AuthWork_1 = __importDefault(require("../service/AuthWork"));
// Register Signin and Signup routes
router.use('/Signin', Signin_1.default);
router.use('/SignUp', Signup_1.default);
// List of service routes
const services = {
    UserOperation: Admin_1.default,
    ControlPanel: AuthWork_1.default
};
// Dynamically prepend '/Signin' to all service routes
Object.entries(services).forEach(([name, service]) => {
    router.use(`/Signin/${name}`, service);
});
exports.default = router;
