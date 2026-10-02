import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  MapPin,
  Phone,
  Bike,
  CheckCircle2,
  AlertCircle,
  Star,
  Receipt,
  ArrowLeft,
  Store,
  Share2,
} from 'lucide-react';
import { subscribeToOrder, formatStatusLabel, addReview } from '../lib/db';
import { Order, OrderStatus } from '../types';
import { RealtimeMap } from '../components/RealtimeMap';
import { useAuth } from '../context/AuthContext';

const TIMELINE_STEPS: { status: OrderStatus; label: string; description: string }[] = [
  {
    status: 'CONFIRMED',
    label: 'Order Confirmed',
    description: 'Restaurant accepted your order',
  },
  {
    status: 'PREPARING',
    label: 'Cooking in Kitchen',
    description: 'Chef is preparing your meal',
  },
  {
    status: 'READY_FOR_PICKUP',
    label: 'Packed & Ready',
    description: 'Dispatched to restaurant collection shelf',
  },
  {
    status: 'PICKED_UP',
    label: 'Picked Up by Rider',
    description: 'Rider secured the food delivery box',
  },
  {
    status: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    description: 'Rider is on the road to your address',
  },
  {
    status: 'DELIVERED',
    label: 'Delivered',
    description: 'Handed over at your gate. Enjoy your meal!',
  },
];

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { profile } = useAuth();

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const unsubscribe = subscribeToOrder(id, (updatedOrder) => {
      setOrder(updatedOrder);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setSubmittingReview(true);
    try {
      await addReview({
        id: `rev-${Date.now()}`,
        orderId: order.id,
        restaurantId: order.restaurantId,
        customerId: profile?.uid || order.customerId,
        customerName: profile?.displayName || order.customerName,
        rating,
        comment: comment.trim() || 'Food was delicious and delivered on time!',
        createdAt: new Date().toISOString(),
      });
      setShowReviewModal(false);
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-gray-500">Connecting to live tracking...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-gray-950 mb-1">Order Not Found</h2>
        <p className="text-xs text-gray-500 mb-4">
          We could not find active records for this order ID.
        </p>
        <Link
          to="/orders"
          className="text-xs font-bold text-orange-600 bg-orange-50 px-4 py-2 rounded-xl hover:bg-orange-100"
        >
          View Order History
        </Link>
      </div>
    );
  }

  // Calculate current stage index
  const currentStepIndex = TIMELINE_STEPS.findIndex((s) => s.status === order.status);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/orders"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>My Orders</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono">Order #{order.orderNumber}</span>
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                order.status === 'DELIVERED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-orange-100 text-orange-800 animate-pulse'
              }`}
            >
              {formatStatusLabel(order.status)}
            </span>
          </div>
        </div>

        {/* Live Interactive Map */}
        <RealtimeMap
          restaurantName={order.restaurantName}
          restaurantAddress={order.restaurantAddress}
          deliveryAddress={order.deliveryAddress}
          status={order.status}
          riderName={order.riderName || 'Kofi Boateng'}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Live Status Timeline */}
          <div className="md:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-950">Delivery Timeline</h3>
                <span className="text-xs text-gray-500">
                  Est. Arrival: <span className="font-bold text-gray-900">{order.estimatedDeliveryTime}</span>
                </span>
              </div>

              {/* Stepper */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div key={step.status} className="relative flex items-start gap-3">
                      {/* Circle Dot */}
                      <div
                        className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm transition-colors ${
                          isDone
                            ? 'bg-orange-600 text-white ring-4 ring-orange-100'
                            : 'bg-white border-2 border-gray-300 text-gray-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                      </div>

                      <div className="min-w-0">
                        <div
                          className={`text-xs font-bold leading-none ${
                            isCurrent
                              ? 'text-orange-600 font-extrabold'
                              : isDone
                              ? 'text-gray-900'
                              : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Review Prompt if Delivered */}
              {order.status === 'DELIVERED' && !order.hasReview && (
                <div className="mt-6 pt-4 border-t border-gray-100 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-amber-900">How was your food?</div>
                    <div className="text-[11px] text-amber-700">
                      Rate {order.restaurantName} to help others in Accra discover great chops.
                    </div>
                  </div>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg shadow-sm"
                  >
                    Rate Meal
                  </button>
                </div>
              )}
            </div>

            {/* Rider Info Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Assigned Delivery Rider
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Bike className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-950">
                      {order.riderName || 'Kofi Boateng'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      ChopTime Certified Rider • Honda Ace 125 (#42)
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold mt-0.5">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span>4.9 (418 deliveries)</span>
                    </div>
                  </div>
                </div>

                <a
                  href={`tel:${order.riderPhone || '+233559876543'}`}
                  className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-bold py-2 px-3 rounded-xl transition-colors shrink-0"
                >
                  <Phone className="w-3.5 h-3.5 text-orange-600" />
                  <span>Call Rider</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Order Items & Receipt */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-orange-600" />
                  <h3 className="text-xs font-bold text-gray-950 uppercase tracking-wider">
                    Receipt Details
                  </h3>
                </div>
                <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Paid ({order.paymentMethod.replace('momo_', '').toUpperCase()})
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-100 space-y-2 text-xs">
                {order.items.map((item) => (
                  <div key={item.id} className="pt-2 first:pt-0 flex justify-between">
                    <div>
                      <div className="font-bold text-gray-900">
                        {item.quantity}x {item.name}
                      </div>
                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <div className="text-[11px] text-gray-500">
                          Add-ons: {item.selectedAddons.map((a) => a.name).join(', ')}
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-gray-900">
                      GH₵ {(item.itemTotalPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">GH₵ {order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-gray-900">GH₵ {order.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span className="font-semibold text-gray-900">GH₵ {order.serviceFee.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Savings</span>
                    <span>-GH₵ {order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100 flex justify-between items-baseline font-black text-gray-950">
                  <span className="text-xs">Total Paid</span>
                  <span className="text-base text-orange-600">GH₵ {order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Address Box */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Delivered To
                </span>
                <p className="font-bold text-gray-900">{order.deliveryAddress}</p>
                {order.digitalAddress && (
                  <p className="font-mono text-gray-500 mt-0.5 text-[11px]">
                    GPS: {order.digitalAddress}
                  </p>
                )}
                {order.deliveryNotes && (
                  <p className="text-[11px] text-gray-500 mt-1 italic">
                    Note: "{order.deliveryNotes}"
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Write Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleReviewSubmit}
            className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-200 space-y-4"
          >
            <div>
              <h3 className="text-base font-bold text-gray-950">Rate {order.restaurantName}</h3>
              <p className="text-xs text-gray-500">
                Share your feedback on the taste, packaging, and portion size.
              </p>
            </div>

            {/* Star Rating Selector */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Written Comment */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="The jollof was smoky and the tilapia was fresh! Loved the extra shito..."
                rows={3}
                className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="text-xs text-gray-500 px-3 py-2 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="text-xs font-bold bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl shadow-md"
              >
                {submittingReview ? 'Posting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
