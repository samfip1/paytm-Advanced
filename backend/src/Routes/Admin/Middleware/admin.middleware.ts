import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();
import endpointsConfig from "./endpoints.config";
import { defineDmmfProperty } from "@prisma/client/runtime/library";

const SECRET_KEY_ADMIN = endpointsConfig.SK_Admin;

// Extend the Request interface to include the `user` property
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    adminId: string;
  };
}


// Middleware to authenticate and verify admin access
export const authorizeAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  // Check for the token in cookies
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ message: "Access Denied. No Token Provided." });
    return;
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, SECRET_KEY_ADMIN) as { id: number; username: string };

    // Check if the admin exists in the database
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
    });

    if (!admin) {
      res.status(403).json({ message: "Access Denied. Not an Admin." });
      return;
    }

    // Attach admin details to the request object
    req.user = {
      id: admin.id,
      username: admin.username,
      adminId: admin.adminId,
    };

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(403).json({ message: "Invalid Token" });
  }
};
