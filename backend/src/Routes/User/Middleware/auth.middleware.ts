import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();
import endpointsConfig from "./endpoints.config";

const SECRET_KEY = endpointsConfig.SK;

interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        username: string;
        role?: string;
    };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {

    
    const token = req.cookies?.token;

    if (!token) {
        res.status(401).json({ message: "Access Denied. No Token Provided." });
        return;
    }

    try {
        
        const decoded = jwt.verify(token, SECRET_KEY) as { id: number; username: string; role: string };

        // Attach the decoded user data to the request object
        req.user = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role, // Include role if present
        };

        next(); // Proceed to the next middleware/route handler
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(403).json({ message: "Invalid Token" });
    }
};

