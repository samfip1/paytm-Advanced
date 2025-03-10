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
const AdminRoutes_1 = __importDefault(require("./Routes/Admin/Routes/AdminRoutes"));
const UserRoute_1 = __importDefault(require("./Routes/User/Routes/UserRoute"));
app.use('/api/v1/admin', AdminRoutes_1.default);
app.use('/api/v1/user', UserRoute_1.default);
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
