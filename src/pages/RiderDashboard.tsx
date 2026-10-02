import React, { useState, useEffect } from 'react';
import {
  Bike,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  DollarSign,
  Clock,
  ArrowRight,
  ExternalLink,
  Power,
  Store,
  User,
  Search,
  FileText,
  AlertCircle,
  X,
  ChevronRight,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { subscribeToAllOrders, updateOrderStatus } from '../lib/db';
import { Order, OrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';

export const RiderDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'all-customer-orders' | 'active' | 'history'>('available');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAllOrders((all) => {
      setOrders(all);
    });
    return () => unsubscribe();
  }, []);

  const riderName = profile?.displayName || 'Kofi Boateng';
  const riderPhone = profile?.phoneNumber || '+233 55 987 6543';

  // Active delivery for this rider
  const activeDelivery = orders.find(
    (o) =>
      (o.riderName === riderName || o.riderId === profile?.uid) &&
      o.status !== 'DELIVERED' &&
      o.status !== 'CANCELLED'
  );

  // Orders available for pickup
  const availablePickupOrders = orders.filter(
    (o) =>
      (o.status === 'READY_FOR_PICKUP' || o.status === 'PREPARING' || o.status === 'CONFIRMED') &&
      (!o.riderId || o.riderId === '')
  );

  // Completed deliveries for this rider
  const completedDeliveries = orders.filter(
    (o) => (o.riderName === riderName || o.riderId === profile?.uid) && o.status === 'DELIVERED'
  );

  const todayEarnings = completedDeliveries.reduce((acc, curr) => acc + curr.deliveryFee, 0);

  // Filter orders based on search query
  const filterOrders = (list: Order[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q) ||
        o.deliveryAddress.toLowerCase().includes(q) ||
        o.restaurantName.toLowerCase().includes(q) ||
        (o.digitalAddress && o.digitalAddress.toLowerCase().includes(q))
    );
  };

  const handleAcceptOrder = async (order: Order) => {
    await updateOrderStatus(
      order.id,
      'RIDER_ASSIGNED',
      `Rider ${riderName} accepted the delivery`,
      {
        riderId: profile?.uid || 'rider-kofi',
        riderName,
        riderPhone,
      }
    );
    setActiveTab('active');
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
    if (status === 'DELIVERED') {
      setActiveTab('history');
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Delivered</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">Out for Delivery</span>;
      case 'PICKED_UP':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Picked Up</span>;
      case 'RIDER_ASSIGNED':
        return <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Rider Assigned</span>;
      case 'READY_FOR_PICKUP':
        return <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">Ready for Pickup</span>;
      case 'PREPARING':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Kitchen Cooking</span>;
      case 'CONFIRMED':
      case 'PAID':
        return <span className="bg-cyan-100 text-cyan-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Paid & Confirmed</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-12">
      {/* Top Rider HUD */}
      <div className="bg-slate-900 text-white py-5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-md">
              <Bike className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black">{riderName}</h1>
                <span className="text-[10px] font-bold bg-blue-900 text-blue-300 px-2 py-0.5 rounded uppercase">
                  Accra Dispatch Pool
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Honda Ace 125 (Box #42) • {riderPhone}
              </p>
            </div>
          </div>

          {/* Quick Metrics & Online Toggle */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-colors ${
                isOnline
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isOnline ? 'Online • Ready' : 'Offline'}</span>
            </button>

            <div className="bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-xl">
              <span className="text-slate-400 block text-[10px]">TODAY'S EARNINGS</span>
              <span className="text-sm font-black text-emerald-400">
                GH₵ {todayEarnings.toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-xl">
              <span className="text-slate-400 block text-[10px]">ALL CUSTOMER ORDERS</span>
              <span className="text-sm font-black text-blue-400">{orders.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs for Rider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'available'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Available Pickup Requests ({availablePickupOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('all-customer-orders')}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'all-customer-orders'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>All Customer Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'active'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>Active Mission {activeDelivery ? `(#${activeDelivery.orderNumber})` : '(0)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Completed Trips ({completedDeliveries.length})</span>
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer orders by name, phone, area (e.g. Cantonments, East Legon), or order #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* TAB 1: Available Pickup Requests */}
        {activeTab === 'available' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-gray-950">
                  Open Customer Orders Ready for Pickup ({filterOrders(availablePickupOrders).length})
                </h2>
                <p className="text-xs text-gray-500">
                  Orders placed by customers waiting for courier acceptance in Accra
                </p>
              </div>
            </div>

            {filterOrders(availablePickupOrders).length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm space-y-2">
                <Bike className="w-10 h-10 text-gray-300 mx-auto" />
                <h3 className="text-sm font-bold text-gray-900">No open pickup requests right now</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  All active orders are currently assigned or in transit. Switch to "All Customer Orders" to see all requests.
                </p>
                <button
                  onClick={() => setActiveTab('all-customer-orders')}
                  className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                >
                  View All Customer Orders &rarr;
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filterOrders(availablePickupOrders).map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-blue-400 shadow-sm flex flex-col justify-between transition-all space-y-4"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-gray-900">
                              #{ord.orderNumber}
                            </span>
                            {getStatusBadge(ord.status)}
                          </div>
                          <span className="text-[11px] text-gray-400 mt-0.5 block">
                            Placed {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">
                            Rider Fee
                          </span>
                          <span className="text-base font-black text-emerald-600">
                            GH₵ {ord.deliveryFee.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Customer & Delivery Destination */}
                      <div className="mt-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                            <span>Customer: {ord.customerName}</span>
                          </div>
                          <a
                            href={`tel:${ord.customerPhone}`}
                            className="text-[11px] text-blue-700 font-bold hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" /> {ord.customerPhone}
                          </a>
                        </div>
                        <div className="text-xs text-gray-600 flex items-start gap-1 pt-1">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                          <span>{ord.deliveryAddress}</span>
                        </div>
                        {ord.digitalAddress && (
                          <div className="text-[10px] font-mono text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 inline-block mt-1">
                            GPS: {ord.digitalAddress}
                          </div>
                        )}
                        {ord.deliveryNotes && (
                          <p className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 mt-1">
                            <strong>Note:</strong> "{ord.deliveryNotes}"
                          </p>
                        )}
                      </div>

                      {/* Restaurant Pickup Location */}
                      <div className="mt-3 bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                            <Store className="w-3.5 h-3.5 text-orange-600" />
                            <span>Pickup: {ord.restaurantName}</span>
                          </div>
                          <span className="text-[11px] text-gray-500">{ord.restaurantPhone}</span>
                        </div>
                        <p className="text-xs text-gray-500">{ord.restaurantAddress}</p>
                      </div>

                      {/* Items Summary */}
                      <div className="mt-3 text-xs text-gray-600">
                        <span className="font-semibold text-gray-900">Order Items: </span>
                        {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-gray-100">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="text-xs font-bold text-gray-700 hover:text-blue-600 py-2 px-3 rounded-xl border border-gray-200 hover:bg-gray-50"
                      >
                        View Full Details
                      </button>

                      <button
                        onClick={() => handleAcceptOrder(ord)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>Accept Delivery Mission</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: All Customer Orders in Accra Platform */}
        {activeTab === 'all-customer-orders' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-black text-gray-950">
                  All Customer Orders Across Platform ({filterOrders(orders).length})
                </h2>
                <p className="text-xs text-gray-500">
                  Full visibility for riders: live stream of orders placed by customers
                </p>
              </div>
              <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-bold">
                Live Dispatch Feed
              </span>
            </div>

            {filterOrders(orders).length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                No orders match your filter criteria.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filterOrders(orders).map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 sm:p-5 hover:bg-gray-50/60 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-sm text-gray-950">
                          #{ord.orderNumber}
                        </span>
                        {getStatusBadge(ord.status)}
                        <span className="text-xs text-gray-400 font-medium">
                          • {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Customer Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Customer</span>
                          <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                            <span>{ord.customerName}</span>
                            <a
                              href={`tel:${ord.customerPhone}`}
                              className="text-blue-600 hover:underline font-mono text-[11px]"
                            >
                              ({ord.customerPhone})
                            </a>
                          </div>
                          <p className="text-gray-600 text-[11px] truncate">
                            {ord.deliveryAddress}
                          </p>
                          {ord.digitalAddress && (
                            <span className="text-[10px] font-mono bg-gray-100 px-1.5 py-0.2 rounded border border-gray-200">
                              {ord.digitalAddress}
                            </span>
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Vendor & Food</span>
                          <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-orange-600" />
                            <span>{ord.restaurantName}</span>
                          </div>
                          <p className="text-gray-500 text-[11px] truncate">
                            {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                          </p>
                          <div className="text-[11px] font-bold text-emerald-700">
                            Total: GH₵ {ord.total.toFixed(2)} (Delivery Fee: GH₵ {ord.deliveryFee.toFixed(2)})
                          </div>
                        </div>
                      </div>

                      {ord.deliveryNotes && (
                        <div className="text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded-lg border border-amber-200/80">
                          <strong>Delivery Note:</strong> "{ord.deliveryNotes}"
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col lg:flex-row items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="text-xs font-bold text-gray-700 hover:text-blue-600 py-2 px-3 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        Inspect
                      </button>

                      {(!ord.riderId || ord.riderId === '') && ord.status !== 'DELIVERED' && ord.status !== 'CANCELLED' ? (
                        <button
                          onClick={() => handleAcceptOrder(ord)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-sm transition-colors"
                        >
                          Accept Trip
                        </button>
                      ) : ord.riderName ? (
                        <span className="text-[11px] text-gray-500 font-medium bg-gray-100 px-2.5 py-1 rounded-lg">
                          Rider: {ord.riderName}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Active Delivery Mission */}
        {activeTab === 'active' && (
          <div>
            {activeDelivery ? (
              <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-blue-600 shadow-md space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                    <h2 className="text-base font-black text-gray-950">Active Mission Route</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-400">
                      Order #{activeDelivery.orderNumber}
                    </span>
                    {getStatusBadge(activeDelivery.status)}
                  </div>
                </div>

                {/* Pickup Restaurant & Customer Gate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Pickup Restaurant */}
                  <div className="bg-orange-50/70 p-4 rounded-xl border border-orange-200 space-y-2">
                    <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-orange-600" /> Step 1: Pickup from Restaurant
                    </span>
                    <p className="font-bold text-gray-950 text-sm">{activeDelivery.restaurantName}</p>
                    <p className="text-gray-600">{activeDelivery.restaurantAddress}</p>
                    <a
                      href={`tel:${activeDelivery.restaurantPhone}`}
                      className="inline-flex items-center gap-1.5 text-orange-700 font-bold hover:underline bg-white px-2.5 py-1 rounded-lg border border-orange-200"
                    >
                      <Phone className="w-3 h-3" /> Call Restaurant ({activeDelivery.restaurantPhone})
                    </a>
                  </div>

                  {/* Customer Drop-off */}
                  <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-2">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-600" /> Step 2: Deliver to Customer Gate
                    </span>
                    <p className="font-bold text-gray-950 text-sm">{activeDelivery.customerName}</p>
                    <p className="text-gray-600">{activeDelivery.deliveryAddress}</p>
                    {activeDelivery.digitalAddress && (
                      <p className="font-mono text-gray-700 text-[11px] bg-white px-2 py-0.5 rounded border border-blue-200 inline-block">
                        GPS Address: {activeDelivery.digitalAddress}
                      </p>
                    )}
                    <div>
                      <a
                        href={`tel:${activeDelivery.customerPhone}`}
                        className="inline-flex items-center gap-1.5 text-blue-700 font-bold hover:underline bg-white px-2.5 py-1 rounded-lg border border-blue-200"
                      >
                        <Phone className="w-3 h-3" /> Call Customer ({activeDelivery.customerPhone})
                      </a>
                    </div>
                  </div>
                </div>

                {/* Delivery Notes from Customer */}
                {activeDelivery.deliveryNotes && (
                  <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                    <span className="font-bold block uppercase text-[10px] text-amber-700">
                      Customer Gate Instructions
                    </span>
                    <p>"{activeDelivery.deliveryNotes}"</p>
                  </div>
                )}

                {/* Turn-by-Turn GPS Map Directions */}
                <div className="flex justify-end">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                      activeDelivery.restaurantAddress + ', Ghana'
                    )}&destination=${encodeURIComponent(activeDelivery.deliveryAddress + ', Ghana')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Launch Google Maps GPS Route</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Delivery Items */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                  <h4 className="text-xs font-bold text-gray-900">Food Items to Verify at Kitchen:</h4>
                  <ul className="text-xs text-gray-600 space-y-1 divide-y divide-gray-200/60">
                    {activeDelivery.items.map((item, idx) => (
                      <li key={idx} className="pt-1 flex items-center justify-between">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-bold text-gray-900">
                          GH₵ {(item.itemTotalPrice * item.quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stepper Buttons */}
                <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Current Mission Status
                    </span>
                    <span className="text-sm font-black text-white">
                      {activeDelivery.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {activeDelivery.status === 'RIDER_ASSIGNED' && (
                      <button
                        onClick={() => handleUpdateStatus(activeDelivery.id, 'PICKED_UP')}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-colors"
                      >
                        1. Confirm Food Picked Up from Kitchen
                      </button>
                    )}

                    {activeDelivery.status === 'PICKED_UP' && (
                      <button
                        onClick={() => handleUpdateStatus(activeDelivery.id, 'OUT_FOR_DELIVERY')}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-colors"
                      >
                        2. Start Ride to Customer (Out for Delivery)
                      </button>
                    )}

                    {activeDelivery.status === 'OUT_FOR_DELIVERY' && (
                      <button
                        onClick={() => handleUpdateStatus(activeDelivery.id, 'DELIVERED')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>3. Confirm Handover & Complete Delivery</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center shadow-sm space-y-3">
                <Bike className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-900">No active delivery mission</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Pick an available customer order to begin a delivery task.
                </p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Browse Available Customer Requests ({availablePickupOrders.length})
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Delivery History */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-gray-950">
                  Completed Customer Deliveries ({completedDeliveries.length})
                </h2>
                <p className="text-xs text-gray-500">History of trips completed by {riderName}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Earned</span>
                <span className="text-sm font-black text-emerald-600">GH₵ {todayEarnings.toFixed(2)}</span>
              </div>
            </div>

            {completedDeliveries.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                You haven't completed any deliveries yet today.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {completedDeliveries.map((ord) => (
                  <div key={ord.id} className="p-4 hover:bg-gray-50 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-gray-900">#{ord.orderNumber}</span>
                        <span className="text-xs font-medium text-gray-900">{ord.restaurantName} &rarr; {ord.customerName}</span>
                      </div>
                      <p className="text-xs text-gray-500">{ord.deliveryAddress}</p>
                      <span className="text-[10px] text-gray-400">
                        Delivered at {new Date(ord.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-600">
                        +GH₵ {ord.deliveryFee.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-gray-400 block">Payout Settled</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">
                  Customer Order #{selectedOrder.orderNumber}
                </h3>
                <span className="text-xs text-gray-400">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Details Card */}
            <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-2">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">Customer Information</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">{selectedOrder.customerName}</span>
                <a
                  href={`tel:${selectedOrder.customerPhone}`}
                  className="text-xs font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1 hover:underline"
                >
                  <Phone className="w-3 h-3" /> Call: {selectedOrder.customerPhone}
                </a>
              </div>
              <div className="text-xs text-gray-700 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <span>{selectedOrder.deliveryAddress}</span>
              </div>
              {selectedOrder.digitalAddress && (
                <div className="text-[11px] font-mono text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200 inline-block">
                  GPS: {selectedOrder.digitalAddress}
                </div>
              )}
              {selectedOrder.deliveryNotes && (
                <div className="text-xs text-amber-900 bg-amber-50 p-2 rounded border border-amber-200">
                  <strong>Delivery Notes:</strong> "{selectedOrder.deliveryNotes}"
                </div>
              )}
            </div>

            {/* Restaurant Card */}
            <div className="bg-orange-50/60 p-4 rounded-xl border border-orange-200 space-y-1 text-xs">
              <span className="text-[10px] font-bold text-orange-800 uppercase block">Pickup Location</span>
              <div className="flex items-center justify-between font-bold text-gray-900">
                <span>{selectedOrder.restaurantName}</span>
                <a href={`tel:${selectedOrder.restaurantPhone}`} className="text-orange-700 hover:underline">
                  {selectedOrder.restaurantPhone}
                </a>
              </div>
              <p className="text-gray-600">{selectedOrder.restaurantAddress}</p>
            </div>

            {/* Dishes */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-900">Customer Dishes:</span>
              <div className="divide-y divide-gray-100 text-xs text-gray-700">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">
                        {item.quantity}x {item.name}
                      </span>
                      {item.specialInstructions && (
                        <p className="text-[11px] text-gray-500 italic">"{item.specialInstructions}"</p>
                      )}
                    </div>
                    <span className="font-bold text-gray-900">
                      GH₵ {(item.itemTotalPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Meal Subtotal:</span>
                <span>GH₵ {selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>Rider Delivery Payout:</span>
                <span>GH₵ {selectedOrder.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-gray-950 border-t border-gray-200 pt-1 text-sm">
                <span>Customer Total:</span>
                <span>GH₵ {selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-xs font-bold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl"
              >
                Close
              </button>

              {(!selectedOrder.riderId || selectedOrder.riderId === '') &&
                selectedOrder.status !== 'DELIVERED' &&
                selectedOrder.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleAcceptOrder(selectedOrder)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-colors"
                  >
                    Accept & Assign to Me
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
