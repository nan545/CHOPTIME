import { Request, Response, NextFunction } from 'express';
import { RestaurantService } from '../services/restaurant.service';

export class RestaurantController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { city, neighborhood, cuisine, isOpen } = req.query;
      const restaurants = await RestaurantService.getAll({
        city: city as string,
        neighborhood: neighborhood as string,
        cuisine: cuisine as string,
        isOpen: isOpen === 'true' ? true : isOpen === 'false' ? false : undefined,
      });

      res.json({ success: true, data: restaurants });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const restaurant = await RestaurantService.getById(id);

      if (!restaurant) {
        res.status(404).json({ success: false, error: 'Restaurant not found' });
        return;
      }

      res.json({ success: true, data: restaurant });
    } catch (err) {
      next(err);
    }
  }

  static async getMenu(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const menu = await RestaurantService.getMenu(id);
      res.json({ success: true, data: menu });
    } catch (err) {
      next(err);
    }
  }
}
