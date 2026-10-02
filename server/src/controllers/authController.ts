import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'choptime-ghana-secure-jwt-key-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// In-memory fallback store for offline/sandbox development
interface FallbackUser {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  phoneNumber?: string;
  role: 'CUSTOMER' | 'RESTAURANT' | 'RIDER' | 'ADMIN';
  createdAt: Date;
}

const memoryUsers: Map<string, FallbackUser> = new Map();

// Initialize default seed accounts in fallback memory
const defaultSalt = bcrypt.genSaltSync(10);
const defaultHash = bcrypt.hashSync('choptime123', defaultSalt);

const defaultAccounts: FallbackUser[] = [
  {
    id: 'user-customer-demo',
    email: 'customer@choptime.gh',
    passwordHash: defaultHash,
    displayName: 'Kwame Mensah',
    phoneNumber: '024 123 4567',
    role: 'CUSTOMER',
    createdAt: new Date(),
  },
  {
    id: 'user-restaurant-demo',
    email: 'buka@choptime.gh',
    passwordHash: defaultHash,
    displayName: 'Auntie Muni (Buka Resto)',
    phoneNumber: '030 277 1234',
    role: 'RESTAURANT',
    createdAt: new Date(),
  },
  {
    id: 'user-rider-demo',
    email: 'rider@choptime.gh',
    passwordHash: defaultHash,
    displayName: 'Kofi Rider (Honda Ace)',
    phoneNumber: '055 987 6543',
    role: 'RIDER',
    createdAt: new Date(),
  },
  {
    id: 'user-admin-demo',
    email: 'admin@choptime.gh',
    passwordHash: defaultHash,
    displayName: 'ChopTime Super Admin',
    phoneNumber: '020 000 0001',
    role: 'ADMIN',
    createdAt: new Date(),
  },
];

for (const acc of defaultAccounts) {
  memoryUsers.set(acc.email.toLowerCase(), acc);
}

/**
 * Generate a signed JWT token
 */
export function generateToken(payload: { id: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

export class AuthController {
  /**
   * POST /api/auth/register
   * Secure user registration with bcrypt password hashing and JWT token issuance
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, displayName, phoneNumber, role } = req.body;

      // 1. Validation
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        res.status(400).json({
          success: false,
          error: 'Please provide a valid email address.',
        });
        return;
      }

      if (!password || typeof password !== 'string' || password.length < 6) {
        res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long.',
        });
        return;
      }

      if (!displayName || typeof displayName !== 'string' || !displayName.trim()) {
        res.status(400).json({
          success: false,
          error: 'Display name is required.',
        });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const validRoles = ['CUSTOMER', 'RESTAURANT', 'RIDER', 'ADMIN'];
      const userRole = (role && validRoles.includes(role.toUpperCase()))
        ? (role.toUpperCase() as 'CUSTOMER' | 'RESTAURANT' | 'RIDER' | 'ADMIN')
        : 'CUSTOMER';

      // 2. Hash password with bcrypt
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      let createdUser: {
        id: string;
        email: string;
        displayName: string;
        phoneNumber?: string | null;
        role: string;
        createdAt: Date;
      };

      // 3. Try saving to Prisma PostgreSQL database, fallback to memory
      try {
        const existing = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (existing) {
          res.status(409).json({
            success: false,
            error: 'An account with this email already exists.',
          });
          return;
        }

        const dbUser = await prisma.user.create({
          data: {
            email: normalizedEmail,
            passwordHash,
            displayName: displayName.trim(),
            phoneNumber: phoneNumber ? String(phoneNumber).trim() : null,
            role: userRole as any,
          },
          select: {
            id: true,
            email: true,
            displayName: true,
            phoneNumber: true,
            role: true,
            createdAt: true,
          },
        });

        createdUser = dbUser;
      } catch (dbErr) {
        // Fallback to in-memory store if DB is offline/unreachable
        if (memoryUsers.has(normalizedEmail)) {
          res.status(409).json({
            success: false,
            error: 'An account with this email already exists.',
          });
          return;
        }

        const fallbackUser: FallbackUser = {
          id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          email: normalizedEmail,
          passwordHash,
          displayName: displayName.trim(),
          phoneNumber: phoneNumber ? String(phoneNumber).trim() : undefined,
          role: userRole,
          createdAt: new Date(),
        };

        memoryUsers.set(normalizedEmail, fallbackUser);

        createdUser = {
          id: fallbackUser.id,
          email: fallbackUser.email,
          displayName: fallbackUser.displayName,
          phoneNumber: fallbackUser.phoneNumber,
          role: fallbackUser.role,
          createdAt: fallbackUser.createdAt,
        };
      }

      // 4. Issue JWT
      const token = generateToken({
        id: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
      });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: createdUser,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/login
   * Authenticate user with password comparison and JWT issuance
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required.',
        });
        return;
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      let matchedUser: {
        id: string;
        email: string;
        passwordHash: string | null;
        displayName: string;
        phoneNumber?: string | null;
        role: string;
      } | null = null;

      // 1. Try Prisma DB first
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        if (dbUser) {
          matchedUser = dbUser;
        }
      } catch (e) {
        // DB not connected, fallback to memory
      }

      // 2. Check fallback store if not found in DB
      if (!matchedUser && memoryUsers.has(normalizedEmail)) {
        matchedUser = memoryUsers.get(normalizedEmail)!;
      }

      if (!matchedUser || !matchedUser.passwordHash) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
        });
        return;
      }

      // 3. Compare passwords with bcrypt
      const isMatch = await bcrypt.compare(String(password), matchedUser.passwordHash);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
        });
        return;
      }

      // 4. Issue JWT
      const token = generateToken({
        id: matchedUser.id,
        email: matchedUser.email,
        role: matchedUser.role,
      });

      // 5. Send sanitized user object (NEVER return passwordHash)
      res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: matchedUser.id,
          email: matchedUser.email,
          displayName: matchedUser.displayName,
          phoneNumber: matchedUser.phoneNumber,
          role: matchedUser.role,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/auth/me
   * Return profile of currently authenticated user
   */
  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized: Session not found.',
        });
        return;
      }

      res.json({
        success: true,
        user: req.user,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/auth/demo-accounts
   * Useful developer endpoint returning pre-configured test logins
   */
  static async getDemoAccounts(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      message: 'All accounts use password: choptime123',
      accounts: [
        { role: 'CUSTOMER', email: 'customer@choptime.gh', name: 'Kwame Mensah' },
        { role: 'RESTAURANT', email: 'buka@choptime.gh', name: 'Auntie Muni (Buka Resto)' },
        { role: 'RIDER', email: 'rider@choptime.gh', name: 'Kofi Rider (Honda Ace)' },
        { role: 'ADMIN', email: 'admin@choptime.gh', name: 'ChopTime Super Admin' },
      ],
    });
  }
}

export default AuthController;
