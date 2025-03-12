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
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        console.log("No Authorization header provided"); //DEBUG
        res.status(401).json({ message: "Access Denied. No Token Provided." });
        return
    }

    const token = authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) {
        console.log("Malformed Authorization header"); //DEBUG
        res.status(401).json({ message: "Access Denied. Malformed Token." });
        return
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY) as { id: number; username: string; role: string };

        req.user = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role,
        };

        next();
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(403).json({ message: "Invalid Token" });
        return
    }
};