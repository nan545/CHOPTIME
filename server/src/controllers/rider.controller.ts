import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

export class RiderController {
  static async toggleOnline(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { isOnline } = req.body;
    res.json({
      success: true,
      data: {
        riderId: req.user?.id || 'demo-rider-kofi',
        isOnline: Boolean(isOnline),
        updatedAt: new Date(),
      },
    });
  }

  static async updateLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { lat, lng } = req.body;
    res.json({
      success: true,
      data: {
        riderId: req.user?.id || 'demo-rider-kofi',
        location: { lat, lng },
        timestamp: new Date(),
      },
    });
  }

  static async earnings(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({
      success: true,
      data: {
        todayEarnings: 135.0,
        completedDeliveries: 9,
        rating: 4.9,
      },
    });
  }
}
