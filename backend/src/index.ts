import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

import Admin from "./Routes/Admin/Routes/AdminRoutes"
import User from "./Routes/User/Routes/UserRoute"
app.use('/api/v1/admin', Admin);
app.use('/api/v1/user', User);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; 
