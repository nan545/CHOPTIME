import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'choptime-ghana-secure-jwt-key-2026';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'RESTAURANT' | 'RIDER' | 'ADMIN';
  displayName?: string;
  restaurantId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const roleHeader = req.headers['x-user-role'] as string | undefined;
  const userIdHeader = req.headers['x-user-id'] as string | undefined;

  // 1. Supports direct developer headers for role simulation
  if (roleHeader && userIdHeader) {
    req.user = {
      id: userIdHeader,
      email: `${userIdHeader}@choptime.com.gh`,
      role: roleHeader.toUpperCase() as AuthenticatedUser['role'],
      restaurantId: (req.headers['x-restaurant-id'] as string) || undefined,
    };
    return next();
  }

  // 2. Requires Bearer Token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Bearer authentication token is required.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: AuthenticatedUser['role'];
      displayName?: string;
    };

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      displayName: decoded.displayName,
    };

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Token has expired. Please log in again.',
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid authentication token.',
    });
  }
};

export const requireRole = (allowedRoles: ('CUSTOMER' | 'RESTAURANT' | 'RIDER' | 'ADMIN')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized: Not logged in.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Forbidden: Access restricted to [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
};
