import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  Check,
  MapPin,
  Utensils,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartPage: React.FC = () => {
  const {
    items,
    restaurant,
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
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    await applyCouponCode(couponInput.trim());
    setCouponLoading(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center pb-20">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 shadow-sm">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-950 mb-1">Your cart is empty</h2>
        <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">
          Looks like you haven't added any Ghanaian dishes to your cart yet. Explore popular restaurants in Accra and Kumasi!
        </p>
        <Link
          to="/"
          className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow-md transition-colors"
        >
          Explore Menus
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-950">Your Cart</h1>
            <p className="text-xs text-gray-500">
              Ordering from <span className="font-bold text-gray-900">{restaurant?.name}</span>
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 p-2 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Items List */}
          <div className="lg:col-span-7 space-y-3">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex gap-3">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-gray-950 truncate">{item.name}</h4>
                      <span className="text-xs font-extrabold text-gray-900 shrink-0">
                        GH₵ {(item.itemTotalPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Selected Options & Add-ons Summary */}
                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {Object.entries(item.selectedOptions).map(([key, val]) => (
                          <span key={key} className="mr-2">
                            {key}: <span className="font-semibold text-gray-700">{val}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <div className="text-[11px] text-orange-600 mt-0.5">
                        Add-ons: {item.selectedAddons.map((a) => a.name).join(', ')}
                      </div>
                    )}

                    {item.specialInstructions && (
                      <div className="text-[10px] italic text-gray-400 mt-0.5">
                        Note: "{item.specialInstructions}"
                      </div>
                    )}

                    {/* Quantity Stepper & Remove */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1.5 text-gray-600 hover:text-gray-900"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1.5 text-gray-600 hover:text-gray-900"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Destination card */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Deliver To
                  </span>
                  <span className="text-xs font-bold text-gray-900">{selectedAddress.title}</span>
                  <span className="text-xs text-gray-500 block truncate max-w-xs">
                    {selectedAddress.streetAddress}, {selectedAddress.area}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="text-xs font-bold text-orange-600 hover:underline shrink-0"
              >
                Change
              </button>
            </div>
          </div>

          {/* Bill Summary & Coupon */}
          <div className="lg:col-span-5 space-y-4">
            {/* Coupon Box */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-bold text-gray-900">Have a promo code?</span>
              </div>

              {coupon ? (
                <div className="flex items-center justify-between bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold">{coupon.code} applied!</span>
                      <span className="block text-[11px] text-emerald-700">
                        Saved GH₵ {discount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="e.g. AKWAABA20"
                    className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-xl uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponInput.trim()}
                    className="bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </form>
              )}

              {couponMessage && !coupon && (
                <p className="text-[11px] text-red-600 mt-2 font-medium">{couponMessage}</p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">
                Order Summary
              </h3>

              <div className="flex justify-between text-xs text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">GH₵ {subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-xs text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-semibold text-gray-900">GH₵ {deliveryFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-xs text-gray-600">
                <span>Service Fee</span>
                <span className="font-semibold text-gray-900">GH₵ {serviceFee.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 font-bold">
                  <span>Discount</span>
                  <span>-GH₵ {discount.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-extrabold text-gray-950 block">Total</span>
                  <span className="text-[10px] text-gray-400">VAT & Taxes inclusive</span>
                </div>
                <span className="text-xl font-black text-orange-600">
                  GH₵ {total.toFixed(2)}
                </span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
