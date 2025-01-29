import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

import Admin from '../src/Routes/Admin/Routes/AdminRoutes'
import user from '../src/Routes/User/Routes/UserRoute'
app.use('/admin', Admin);
app.use('/user', user);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
