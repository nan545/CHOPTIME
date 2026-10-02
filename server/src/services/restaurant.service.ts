import { prisma } from '../config/prisma';

export interface RestaurantFilter {
  city?: string;
  neighborhood?: string;
  cuisine?: string;
  isOpen?: boolean;
}

export class RestaurantService {
  static async getAll(filters: RestaurantFilter = {}) {
    // If database connection is active, query Prisma; otherwise fallback
    try {
      return await prisma.restaurant.findMany({
        where: {
          ...(filters.city ? { city: { equals: filters.city, mode: 'insensitive' } } : {}),
          ...(filters.neighborhood
            ? { neighborhood: { equals: filters.neighborhood, mode: 'insensitive' } }
            : {}),
          ...(filters.isOpen !== undefined ? { isOpen: filters.isOpen } : {}),
        },
        include: {
          foodCategories: true,
        },
      });
    } catch (e) {
      console.warn('Prisma query failed or not connected, returning service data:', e);
      return [];
    }
  }

  static async getById(id: string) {
    try {
      return await prisma.restaurant.findUnique({
        where: { id },
        include: {
          foodItems: true,
          foodCategories: true,
          reviews: { take: 10, orderBy: { createdAt: 'desc' } },
        },
      });
    } catch (e) {
      return null;
    }
  }

  static async getMenu(restaurantId: string) {
    try {
      return await prisma.foodItem.findMany({
        where: { restaurantId, isAvailable: true },
        include: { options: true, addons: true },
      });
    } catch (e) {
      return [];
    }
  }
}
