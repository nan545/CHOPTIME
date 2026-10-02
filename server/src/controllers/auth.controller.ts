import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    const { email, displayName, role } = req.body;
    res.status(201).json({
      success: true,
      data: {
        id: `user-${Date.now()}`,
        email,
        displayName,
        role: role || 'CUSTOMER',
        createdAt: new Date(),
      },
    });
  }

  static async login(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    res.json({
      success: true,
      token: `jwt_token_${Date.now()}`,
      user: {
        id: `user-session`,
        email,
        displayName: 'Kwame Mensah',
        role: 'CUSTOMER',
      },
    });
  }

  static async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({
      success: true,
      user: req.user || {
        id: 'guest',
        email: 'guest@choptime.gh',
        role: 'CUSTOMER',
      },
    });
  }
}
