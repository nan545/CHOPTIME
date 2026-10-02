export type UserRole = 'customer' | 'restaurant' | 'rider' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: UserRole;
  avatarUrl?: string;
  restaurantId?: string;
  riderApprovalStatus?: 'pending' | 'approved' | 'rejected';
  vehicleType?: string; // e.g. "Motorbike (Box Attached)"
  licenseNumber?: string;
  isOnline?: boolean;
  createdAt: string;
}

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string; // "Accra", "Kumasi", "Tema", "Takoradi"
  neighborhood: string; // "Osu", "East Legon", "Cantonments", "Asokwa", "Spintex"
  logoUrl: string;
  coverImageUrl: string;
  rating: number;
  reviewCount: number;
  deliveryFee: number; // in GH₵
  estimatedDeliveryMin: number;
  estimatedDeliveryMax: number;
  minOrder: number; // in GH₵
  isOpen: boolean;
  openingHours: string;
  cuisineType: string[]; // ["Ghanaian", "Waakye", "Jollof & Grills", "Fast Food"]
  isFeatured?: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface FoodOption {
  name: string;
  choices: {
    label: string;
    extraPrice: number; // in GH₵
  }[];
  required?: boolean;
}

export interface FoodAddon {
  name: string;
  price: number; // in GH₵
}

export interface FoodItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string;
  price: number; // in GH₵
  imageUrl: string;
  isAvailable: boolean;
  isPopular?: boolean;
  preparationTimeMin?: number;
  options?: FoodOption[];
  addons?: FoodAddon[];
  createdAt: string;
}

export interface CartItem {
  id: string;
  foodItemId: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  price: number; // base price in GH₵
  quantity: number;
  selectedOptions?: { [optionName: string]: string };
  selectedAddons?: { name: string; price: number }[];
  specialInstructions?: string;
  itemTotalPrice: number; // calculated with options & addons
  imageUrl?: string;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'RIDER_ASSIGNED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod =
  | 'momo_mtn'
  | 'momo_vodafone'
  | 'momo_airteltigo'
  | 'card'
  | 'cash_on_delivery';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';

export interface OrderTimelineEvent {
  status: OrderStatus;
  label: string;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  items: CartItem[];
  subtotal: number; // GH₵
  deliveryFee: number; // GH₵
  serviceFee: number; // GH₵
  discount: number; // GH₵
  total: number; // GH₵
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  deliveryAddress: string;
  digitalAddress?: string; // Ghana Post GPS (e.g., "GA-492-1204")
  deliveryNotes?: string;
  couponCode?: string;
  timeline: OrderTimelineEvent[];
  estimatedDeliveryTime?: string;
  hasReview?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  restaurantId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 15% or GH₵ 20
  minOrder: number; // GH₵
  maxDiscount?: number; // GH₵
  isActive: boolean;
  usageCount: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promo' | 'system';
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DeliveryAddress {
  id: string;
  title: string; // "Home", "Office", "Friend's Place"
  streetAddress: string;
  area: string; // "Osu", "East Legon", "Airport Residential"
  digitalAddress?: string; // "GA-492-1204"
  landmark?: string;
  isDefault: boolean;
}
