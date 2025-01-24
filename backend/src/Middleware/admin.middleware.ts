import { Request, Response, NextFunction } from "express";

// Extend the Request interface to include the `user` property
interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        username: string;
        role?: string;
    };
}

export const authorizeAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (req.user?.role !== "admin") {
        res.status(403).json({ message: "Access Denied. Admins Only." });
        return;
    }
    next();
};
