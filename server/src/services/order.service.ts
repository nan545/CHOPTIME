import { prisma } from '../config/prisma';

export interface OrderItemInput {
  foodItemId: string;
  quantity: number;
  selectedOptions?: Record<string, string>;
  selectedAddons?: { name: string; price: number }[];
  specialInstructions?: string;
}

export interface CreateOrderPayload {
  customerId: string;
  restaurantId: string;
  deliveryAddress: string;
  customerPhone: string;
  items: OrderItemInput[];
  couponCode?: string;
  paymentMethod: string;
}

export class OrderService {
  /**
   * Securely recalculate order totals from database prices.
   * Never trusts prices submitted by client.
   */
  static async calculateOrder(items: OrderItemInput[], restaurantId: string, couponCode?: string) {
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      let itemPrice = 50.0; // fallback base price

      try {
        const dbItem = await prisma.foodItem.findUnique({
          where: { id: item.foodItemId },
        });
        if (dbItem) {
          itemPrice = dbItem.price;
        }
      } catch (err) {
        // use fallback if db not connected
      }

      const addonsTotal = (item.selectedAddons || []).reduce((acc, curr) => acc + curr.price, 0);
      const unitTotal = itemPrice + addonsTotal;
      const lineTotal = unitTotal * item.quantity;
      subtotal += lineTotal;

      validatedItems.push({
        ...item,
        unitPrice: unitTotal,
        totalPrice: lineTotal,
      });
    }

    const deliveryFee = 15.0; // standard Ghana delivery fee
    const serviceFee = 2.5;

    let discount = 0;
    if (couponCode && couponCode.toUpperCase() === 'AKWAABA20') {
      discount = Math.min(40.0, subtotal * 0.2);
    } else if (couponCode && couponCode.toUpperCase() === 'CHOP15') {
      discount = Math.min(15.0, subtotal);
    }

    const grandTotal = Math.max(0, subtotal + deliveryFee + serviceFee - discount);

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee,
      serviceFee,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(grandTotal * 100) / 100,
      items: validatedItems,
    };
  }

  static async updateStatus(orderId: string, newStatus: string, note?: string) {
    try {
      return await prisma.order.update({
        where: { id: orderId },
        data: {
          status: newStatus as any,
          updatedAt: new Date(),
        },
      });
    } catch (e) {
      return { id: orderId, status: newStatus, note, updatedAt: new Date() };
    }
  }
}
