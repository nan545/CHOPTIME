import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, ShoppingBag, ArrowRight, CheckCircle2, ChevronRight, Bike } from 'lucide-react';
import { subscribeToCustomerOrders, formatStatusLabel } from '../lib/db';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const customerId = profile?.uid || 'guest-customer';
    setLoading(true);

    const unsubscribe = subscribeToCustomerOrders(customerId, (fetchedOrders) => {
      setOrders(fetchedOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const activeOrders = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const pastOrders = orders.filter((o) => o.status === 'DELIVERED' || o.status === 'CANCELLED');

  const handleReorder = (order: Order) => {
    if (order.items.length > 0) {
      // Re-add items
      order.items.forEach((item) => {
        addItem(item, {
          id: order.restaurantId,
          name: order.restaurantName,
          deliveryFee: order.deliveryFee,
        });
      });
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-950">My Orders</h1>
          <p className="text-xs text-gray-500">Track current meals and view your dining history</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-gray-950">No orders placed yet</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1 mb-4 leading-relaxed">
              Order fresh local Ghanaian chops from Buka, Auntie Muni, Papaye, or Starbites today!
            </p>
            <Link
              to="/"
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-md inline-block"
            >
              Start Ordering
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Orders Section */}
            {activeOrders.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                  <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider">
                    Active Deliveries ({activeOrders.length})
                  </h3>
                </div>

                <div className="space-y-3">
                  {activeOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white rounded-2xl p-5 border-2 border-orange-500/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-gray-950">
                            {ord.restaurantName}
                          </h4>
                          <span className="text-[11px] font-mono text-gray-400">
                            #{ord.orderNumber}
                          </span>
                        </div>
                        <div className="text-xs text-orange-600 font-bold mt-0.5">
                          {formatStatusLabel(ord.status)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </p>
                        <span className="text-xs font-bold text-gray-900 mt-1 block">
                          Total: GH₵ {ord.total.toFixed(2)}
                        </span>
                      </div>

                      <Link
                        to={`/order/${ord.id}`}
                        className="flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-md shrink-0 transition-colors"
                      >
                        <Bike className="w-4 h-4" />
                        <span>Track Live Delivery</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Orders Section */}
            {pastOrders.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider">
                  Past Orders
                </h3>

                <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden shadow-sm">
                  {pastOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-950">
                            {ord.restaurantName}
                          </h4>
                          <span className="text-[11px] font-mono text-gray-400">
                            #{ord.orderNumber}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">
                          {new Date(ord.createdAt).toLocaleDateString()} • GH₵ {ord.total.toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to={`/order/${ord.id}`}
                          className="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 font-semibold px-3 py-1.5 rounded-lg"
                        >
                          View Receipt
                        </Link>
                        <button
                          onClick={() => handleReorder(ord)}
                          className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg"
                        >
                          Reorder Meal
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
