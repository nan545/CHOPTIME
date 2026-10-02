import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Restaurant, Coupon, DeliveryAddress } from '../types';
import { validateCoupon } from '../lib/db';

interface CartContextType {
  items: CartItem[];
  restaurant: { id: string; name: string; deliveryFee: number } | null;
  addItem: (item: CartItem, restaurantInfo: { id: string; name: string; deliveryFee: number }) => boolean;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  total: number;
  coupon: Coupon | null;
  couponMessage: string | null;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  selectedAddress: DeliveryAddress;
  setSelectedAddress: (addr: DeliveryAddress) => void;
  savedAddresses: DeliveryAddress[];
  addSavedAddress: (addr: DeliveryAddress) => void;
}

export const DEFAULT_ADDRESSES: DeliveryAddress[] = [
  {
    id: 'addr-1',
    title: 'Home (Osu)',
    streetAddress: 'House 14, 11th Lane, Near Papaye',
    area: 'Osu, Accra',
    digitalAddress: 'GA-030-4921',
    landmark: 'Behind Total Filling Station',
    isDefault: true,
  },
  {
    id: 'addr-2',
    title: 'Work / Office',
    streetAddress: 'Heritage Tower, 6th Floor, Ridge',
    area: 'Ridge, Accra',
    digitalAddress: 'GA-014-8820',
    landmark: 'Opposite World Bank Office',
    isDefault: false,
  },
  {
    id: 'addr-3',
    title: 'East Legon Residence',
    streetAddress: 'Plot 4B, Boundary Road',
    area: 'East Legon, Accra',
    digitalAddress: 'GA-332-1109',
    landmark: 'Near A&C Mall',
    isDefault: false,
  },
];

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('choptime_cart_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [restaurant, setRestaurant] = useState<{ id: string; name: string; deliveryFee: number } | null>(() => {
    const saved = localStorage.getItem('choptime_cart_restaurant');
    return saved ? JSON.parse(saved) : null;
  });

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>(DEFAULT_ADDRESSES);
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress>(DEFAULT_ADDRESSES[0]);

  useEffect(() => {
    localStorage.setItem('choptime_cart_items', JSON.stringify(items));
    if (items.length === 0) {
      setRestaurant(null);
      localStorage.removeItem('choptime_cart_restaurant');
    }
  }, [items]);

  useEffect(() => {
    if (restaurant) {
      localStorage.setItem('choptime_cart_restaurant', JSON.stringify(restaurant));
    }
  }, [restaurant]);

  const addItem = (newItem: CartItem, restaurantInfo: { id: string; name: string; deliveryFee: number }): boolean => {
    // If cart has items from another restaurant
    if (restaurant && restaurant.id !== restaurantInfo.id && items.length > 0) {
      const confirmClear = window.confirm(
        `Your cart already contains items from ${restaurant.name}. Would you like to clear your cart to add items from ${restaurantInfo.name}?`
      );
      if (!confirmClear) {
        return false;
      }
      setItems([newItem]);
      setRestaurant(restaurantInfo);
      return true;
    }

    setRestaurant(restaurantInfo);
    setItems((prev) => {
      // Check if item with exact same options/addons exists
      const existingIndex = prev.findIndex(
        (i) =>
          i.foodItemId === newItem.foodItemId &&
          JSON.stringify(i.selectedOptions) === JSON.stringify(newItem.selectedOptions) &&
          JSON.stringify(i.selectedAddons) === JSON.stringify(newItem.selectedAddons)
      );

      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += newItem.quantity;
        return copy;
      } else {
        return [...prev, newItem];
      }
    });
    return true;
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setItems([]);
    setRestaurant(null);
    setCoupon(null);
    setCouponMessage(null);
    localStorage.removeItem('choptime_cart_items');
    localStorage.removeItem('choptime_cart_restaurant');
  };

  const subtotal = items.reduce((acc, curr) => acc + curr.itemTotalPrice * curr.quantity, 0);
  const deliveryFee = items.length > 0 ? restaurant?.deliveryFee || 15.0 : 0;
  const serviceFee = items.length > 0 ? 2.5 : 0;

  // Coupon discount calculation
  let discount = 0;
  if (coupon && subtotal >= coupon.minOrder) {
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(coupon.discountValue, subtotal);
    }
  }

  const total = Math.max(0, subtotal + deliveryFee + serviceFee - discount);

  const applyCouponCode = async (code: string): Promise<boolean> => {
    const res = await validateCoupon(code, subtotal);
    setCouponMessage(res.message);
    if (res.valid && res.coupon) {
      setCoupon(res.coupon);
      return true;
    } else {
      setCoupon(null);
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponMessage(null);
  };

  const addSavedAddress = (addr: DeliveryAddress) => {
    setSavedAddresses((prev) => [addr, ...prev]);
    setSelectedAddress(addr);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        restaurant,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        deliveryFee,
        serviceFee,
        discount,
        total,
        coupon,
        couponMessage,
        applyCouponCode,
        removeCoupon,
        selectedAddress,
        setSelectedAddress,
        savedAddresses,
        addSavedAddress,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
