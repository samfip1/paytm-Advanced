import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();
import endpointsConfig from "./endpoints.config";

const SECRET_KEY = endpointsConfig.SK;

// Extend the Request interface to include the `user` property
interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        username: string;
    };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // Check for the token in cookies
    const token = req.cookies?.token;

    if (!token) {
        res.status(401).json({ message: "Access Denied. No Token Provided." });
        return;
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY) as { id: number; username: string };

        // Attach the decoded user data to the request object
        req.user = {
            id: decoded.id,
            username: decoded.username,
        };

        next(); // Proceed to the next middleware/route handler
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(403).json({ message: "Invalid Token" });
    }
};
