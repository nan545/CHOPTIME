import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  Restaurant,
  FoodItem,
  Order,
  OrderStatus,
  Review,
  Coupon,
  AppNotification,
  UserProfile,
} from '../types';
import { INITIAL_RESTAURANTS, INITIAL_FOOD_ITEMS, INITIAL_COUPONS, INITIAL_ORDERS } from './seedData';

// Collection references
export const RESTAURANTS_COL = 'restaurants';
export const FOOD_ITEMS_COL = 'foodItems';
export const ORDERS_COL = 'orders';
export const REVIEWS_COL = 'reviews';
export const COUPONS_COL = 'coupons';
export const NOTIFICATIONS_COL = 'notifications';
export const USERS_COL = 'users';
export const FAVORITES_COL = 'favorites';

/**
 * Recursively strips undefined fields from an object so Firestore setDoc / updateDoc does not throw
 * "Function setDoc() called with invalid data. Unsupported field value: undefined"
 */
export function sanitizeForFirestore<T>(obj: T): T {
  if (obj === undefined) {
    return null as any;
  }
  if (obj === null) {
    return null as any;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirestore(item)) as any;
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const cleanObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleanObj[key] = sanitizeForFirestore(value);
      }
    }
    return cleanObj as any;
  }
  return obj;
}

/**
 * Initializes the Firestore database with initial Ghanaian restaurants,
 * dishes, and coupons if not already present.
 */
export async function seedDatabaseIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, RESTAURANTS_COL));
    if (snap.empty) {
      console.log('Seeding initial restaurants to Firestore...');
      for (const rest of INITIAL_RESTAURANTS) {
        await setDoc(doc(db, RESTAURANTS_COL, rest.id), sanitizeForFirestore(rest));
      }
      for (const food of INITIAL_FOOD_ITEMS) {
        await setDoc(doc(db, FOOD_ITEMS_COL, food.id), sanitizeForFirestore(food));
      }
      for (const coupon of INITIAL_COUPONS) {
        await setDoc(doc(db, COUPONS_COL, coupon.id), sanitizeForFirestore(coupon));
      }
      for (const order of INITIAL_ORDERS) {
        await setDoc(doc(db, ORDERS_COL, order.id), sanitizeForFirestore(order));
      }
      console.log('Seeding completed successfully.');
    }
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
}

// RESTAURANTS
export async function getRestaurants(): Promise<Restaurant[]> {
  try {
    const snap = await getDocs(collection(db, RESTAURANTS_COL));
    if (snap.empty) {
      return INITIAL_RESTAURANTS;
    }
    return snap.docs.map((d) => d.data() as Restaurant);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, RESTAURANTS_COL);
    return INITIAL_RESTAURANTS;
  }
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  try {
    const snap = await getDoc(doc(db, RESTAURANTS_COL, id));
    if (snap.exists()) {
      return snap.data() as Restaurant;
    }
    const fallback = INITIAL_RESTAURANTS.find((r) => r.id === id);
    return fallback || null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${RESTAURANTS_COL}/${id}`);
    return null;
  }
}

export async function saveRestaurant(restaurant: Restaurant): Promise<void> {
  try {
    await setDoc(doc(db, RESTAURANTS_COL, restaurant.id), sanitizeForFirestore(restaurant), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${RESTAURANTS_COL}/${restaurant.id}`);
  }
}

// FOOD ITEMS
export async function getFoodItemsByRestaurant(restaurantId: string): Promise<FoodItem[]> {
  try {
    const q = query(collection(db, FOOD_ITEMS_COL), where('restaurantId', '==', restaurantId));
    const snap = await getDocs(q);
    if (snap.empty) {
      return INITIAL_FOOD_ITEMS.filter((f) => f.restaurantId === restaurantId);
    }
    return snap.docs.map((d) => d.data() as FoodItem);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, FOOD_ITEMS_COL);
    return INITIAL_FOOD_ITEMS.filter((f) => f.restaurantId === restaurantId);
  }
}

export async function getAllFoodItems(): Promise<FoodItem[]> {
  try {
    const snap = await getDocs(collection(db, FOOD_ITEMS_COL));
    if (snap.empty) {
      return INITIAL_FOOD_ITEMS;
    }
    return snap.docs.map((d) => d.data() as FoodItem);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, FOOD_ITEMS_COL);
    return INITIAL_FOOD_ITEMS;
  }
}

export async function saveFoodItem(item: FoodItem): Promise<void> {
  try {
    await setDoc(doc(db, FOOD_ITEMS_COL, item.id), sanitizeForFirestore(item), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${FOOD_ITEMS_COL}/${item.id}`);
  }
}

export async function deleteFoodItem(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, FOOD_ITEMS_COL, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${FOOD_ITEMS_COL}/${id}`);
  }
}

// ORDERS
export async function createOrder(order: Order): Promise<void> {
  try {
    const cleanOrder = sanitizeForFirestore(order);
    await setDoc(doc(db, ORDERS_COL, order.id), cleanOrder);
    // Send customer notification
    await addNotification({
      id: `notif-${Date.now()}`,
      userId: order.customerId,
      title: 'Order Placed Successfully! 🍛',
      message: `Your order #${order.orderNumber} for ${order.restaurantName} is received. Status: ${order.status}.`,
      type: 'order',
      orderId: order.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${ORDERS_COL}/${order.id}`);
    throw error;
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const snap = await getDoc(doc(db, ORDERS_COL, orderId));
    if (snap.exists()) {
      return snap.data() as Order;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${ORDERS_COL}/${orderId}`);
    return null;
  }
}

export function subscribeToOrder(orderId: string, callback: (order: Order | null) => void) {
  const ref = doc(db, ORDERS_COL, orderId);
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as Order);
      } else {
        callback(null);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, `${ORDERS_COL}/${orderId}`);
    }
  );
}

export function subscribeToCustomerOrders(customerId: string, callback: (orders: Order[]) => void) {
  const q = query(collection(db, ORDERS_COL), where('customerId', '==', customerId));
  return onSnapshot(
    q,
    (snap) => {
      const orders = snap.docs.map((d) => d.data() as Order);
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(orders);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, ORDERS_COL);
    }
  );
}

export function subscribeToRestaurantOrders(restaurantId: string, callback: (orders: Order[]) => void) {
  const q = query(collection(db, ORDERS_COL), where('restaurantId', '==', restaurantId));
  return onSnapshot(
    q,
    (snap) => {
      const orders = snap.docs.map((d) => d.data() as Order);
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(orders);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, ORDERS_COL);
    }
  );
}

export function subscribeToAllOrders(callback: (orders: Order[]) => void) {
  return onSnapshot(
    collection(db, ORDERS_COL),
    (snap) => {
      let orders = snap.docs.map((d) => d.data() as Order);
      if (orders.length === 0) {
        orders = INITIAL_ORDERS;
      }
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(orders);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, ORDERS_COL);
      callback(INITIAL_ORDERS);
    }
  );
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note?: string,
  extraFields: Partial<Order> = {}
): Promise<void> {
  try {
    const currentOrder = await getOrderById(orderId);
    if (!currentOrder) return;

    const newTimelineEvent = {
      status: newStatus,
      label: formatStatusLabel(newStatus),
      timestamp: new Date().toISOString(),
      note: note || '',
    };

    const updatedTimeline = [...(currentOrder.timeline || []), newTimelineEvent];

    await updateDoc(
      doc(db, ORDERS_COL, orderId),
      sanitizeForFirestore({
        status: newStatus,
        timeline: updatedTimeline,
        updatedAt: new Date().toISOString(),
        ...extraFields,
      })
    );

    // Notify customer
    await addNotification({
      id: `notif-${Date.now()}`,
      userId: currentOrder.customerId,
      title: `Order #${currentOrder.orderNumber} Update`,
      message: `${formatStatusLabel(newStatus)}: ${note || currentOrder.restaurantName}`,
      type: 'order',
      orderId,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COL}/${orderId}`);
  }
}

export function formatStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 'Awaiting Payment';
    case 'PAID':
      return 'Payment Confirmed';
    case 'CONFIRMED':
      return 'Order Confirmed by Restaurant';
    case 'PREPARING':
      return 'Kitchen is Cooking Your Meal';
    case 'READY_FOR_PICKUP':
      return 'Food Packed & Ready for Pickup';
    case 'RIDER_ASSIGNED':
      return 'Rider Assigned';
    case 'PICKED_UP':
      return 'Rider Picked Up Order';
    case 'OUT_FOR_DELIVERY':
      return 'Out for Delivery';
    case 'DELIVERED':
      return 'Order Delivered! Enjoy Your Meal';
    case 'CANCELLED':
      return 'Order Cancelled';
    default:
      return status;
  }
}

// REVIEWS
export async function getReviewsForRestaurant(restaurantId: string): Promise<Review[]> {
  try {
    const q = query(collection(db, REVIEWS_COL), where('restaurantId', '==', restaurantId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Review);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, REVIEWS_COL);
    return [];
  }
}

export async function addReview(review: Review): Promise<void> {
  try {
    await setDoc(doc(db, REVIEWS_COL, review.id), sanitizeForFirestore(review));
    // Mark order as reviewed
    await updateDoc(doc(db, ORDERS_COL, review.orderId), { hasReview: true });
    // Recalculate restaurant rating
    const all = await getReviewsForRestaurant(review.restaurantId);
    if (all.length > 0) {
      const avg = all.reduce((sum, r) => sum + r.rating, 0) / all.length;
      await updateDoc(doc(db, RESTAURANTS_COL, review.restaurantId), {
        rating: Math.round(avg * 10) / 10,
        reviewCount: all.length,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${REVIEWS_COL}/${review.id}`);
  }
}

// COUPONS
export async function validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; coupon?: Coupon; discount: number; message: string }> {
  try {
    const q = query(collection(db, COUPONS_COL), where('code', '==', code.toUpperCase().trim()));
    const snap = await getDocs(q);
    if (snap.empty) {
      return { valid: false, discount: 0, message: 'Invalid promo code.' };
    }
    const coupon = snap.docs[0].data() as Coupon;
    if (!coupon.isActive) {
      return { valid: false, discount: 0, message: 'This coupon is no longer active.' };
    }
    if (subtotal < coupon.minOrder) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order amount of GH₵ ${coupon.minOrder.toFixed(2)} required for this code.`,
      };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(coupon.discountValue, subtotal);
    }

    return {
      valid: true,
      coupon,
      discount: Math.round(discount * 100) / 100,
      message: `Coupon applied! You saved GH₵ ${discount.toFixed(2)}`,
    };
  } catch (error) {
    return { valid: false, discount: 0, message: 'Could not validate coupon.' };
  }
}

export async function getAllCoupons(): Promise<Coupon[]> {
  try {
    const snap = await getDocs(collection(db, COUPONS_COL));
    return snap.docs.map((d) => d.data() as Coupon);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COUPONS_COL);
    return INITIAL_COUPONS;
  }
}

export async function saveCoupon(coupon: Coupon): Promise<void> {
  try {
    await setDoc(doc(db, COUPONS_COL, coupon.id), sanitizeForFirestore(coupon), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COUPONS_COL}/${coupon.id}`);
  }
}

// NOTIFICATIONS
export async function addNotification(notification: AppNotification): Promise<void> {
  try {
    await setDoc(doc(db, NOTIFICATIONS_COL, notification.id), sanitizeForFirestore(notification));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${NOTIFICATIONS_COL}/${notification.id}`);
  }
}

export function subscribeToNotifications(userId: string, callback: (notifs: AppNotification[]) => void) {
  const q = query(collection(db, NOTIFICATIONS_COL), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => d.data() as AppNotification);
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, NOTIFICATIONS_COL);
    }
  );
}

export async function markNotificationAsRead(notifId: string): Promise<void> {
  try {
    await updateDoc(doc(db, NOTIFICATIONS_COL, notifId), { isRead: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${NOTIFICATIONS_COL}/${notifId}`);
  }
}

// USERS & PROFILES
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, USERS_COL, uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${USERS_COL}/${uid}`);
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await setDoc(doc(db, USERS_COL, profile.uid), sanitizeForFirestore(profile), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${USERS_COL}/${profile.uid}`);
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, USERS_COL));
    return snap.docs.map((d) => d.data() as UserProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, USERS_COL);
    return [];
  }
}
