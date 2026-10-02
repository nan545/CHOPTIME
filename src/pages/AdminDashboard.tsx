import React, { useState, useEffect } from 'react';
import {
  Shield,
  DollarSign,
  ShoppingBag,
  Store,
  Bike,
  Users,
  Check,
  X,
  Plus,
  Tag,
  Settings,
  Clock,
  TrendingUp,
  AlertTriangle,
  Search,
  Phone,
  MapPin,
  FileText,
  ChevronRight,
  User,
  Filter,
  Package,
} from 'lucide-react';
import {
  getRestaurants,
  saveRestaurant,
  getAllCoupons,
  saveCoupon,
  subscribeToAllOrders,
  getAllUsers,
  updateOrderStatus,
} from '../lib/db';
import { Restaurant, Coupon, Order, OrderStatus, UserProfile } from '../types';

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'overview' | 'restaurants' | 'coupons' | 'settings'>('orders');

  // Customer Orders Filters
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Coupon Creation
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponValue, setCouponValue] = useState('20');
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponMinOrder, setCouponMinOrder] = useState('50');

  useEffect(() => {
    async function loadData() {
      try {
        const [r, c, u] = await Promise.all([getRestaurants(), getAllCoupons(), getAllUsers()]);
        setRestaurants(r);
        setCoupons(c);
        setUsers(u);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      }
    }
    loadData();

    const unsubscribe = subscribeToAllOrders((liveOrders) => {
      setOrders(liveOrders);
    });

    return () => unsubscribe();
  }, []);

  const totalPlatformRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  ).length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'DELIVERED').length;

  const handleToggleRestaurantVerification = async (rest: Restaurant) => {
    const updated = { ...rest, isVerified: !rest.isVerified };
    await saveRestaurant(updated);
    setRestaurants((prev) => prev.map((r) => (r.id === rest.id ? updated : r)));
  };

  const handleToggleCouponActive = async (coup: Coupon) => {
    const updated = { ...coup, isActive: !coup.isActive };
    await saveCoupon(updated);
    setCoupons((prev) => prev.map((c) => (c.id === coup.id ? updated : c)));
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: couponCode.trim().toUpperCase(),
      discountType: couponType,
      discountValue: parseFloat(couponValue),
      minOrder: parseFloat(couponMinOrder),
      isActive: true,
      usageCount: 0,
    };

    await saveCoupon(newCoupon);
    setCoupons((prev) => [newCoupon, ...prev]);
    setShowAddCoupon(false);
    setCouponCode('');
  };

  const handleAdminStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus, `Status updated by Platform Administrator to ${newStatus}`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  // Filtered customer orders list
  const filteredOrders = orders.filter((ord) => {
    // 1. Status Filter
    if (statusFilter !== 'ALL' && ord.status !== statusFilter) {
      return false;
    }
    // 2. Search Query
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase().trim();
      return (
        ord.orderNumber.toLowerCase().includes(q) ||
        ord.customerName.toLowerCase().includes(q) ||
        ord.customerPhone.toLowerCase().includes(q) ||
        ord.deliveryAddress.toLowerCase().includes(q) ||
        ord.restaurantName.toLowerCase().includes(q) ||
        (ord.digitalAddress && ord.digitalAddress.toLowerCase().includes(q)) ||
        (ord.riderName && ord.riderName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Delivered</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">Out for Delivery</span>;
      case 'PICKED_UP':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Picked Up by Rider</span>;
      case 'RIDER_ASSIGNED':
        return <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Rider Assigned</span>;
      case 'READY_FOR_PICKUP':
        return <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Ready for Pickup</span>;
      case 'PREPARING':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Cooking in Kitchen</span>;
      case 'CONFIRMED':
      case 'PAID':
        return <span className="bg-cyan-100 text-cyan-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Paid & Confirmed</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-12">
      {/* Admin Header */}
      <div className="bg-purple-950 text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-purple-900 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-700 flex items-center justify-center text-white shadow-lg shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black">ChopTime Administrator</h1>
                <span className="text-[10px] font-bold bg-purple-800 text-purple-200 px-2 py-0.5 rounded uppercase">
                  Central Operations
                </span>
              </div>
              <p className="text-xs text-purple-300 mt-0.5">
                Real-Time Orders Governance & Multi-Vendor Control Panel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-purple-900/80 border border-purple-800 px-4 py-2 rounded-xl text-xs">
              <span className="text-purple-300 text-[10px] uppercase font-bold block">
                Total Platform Orders
              </span>
              <span className="text-base font-black text-white">{totalOrdersCount} Orders</span>
            </div>

            <div className="bg-purple-900/80 border border-purple-800 px-4 py-2 rounded-xl text-xs">
              <span className="text-purple-300 text-[10px] uppercase font-bold block">
                Platform Volume (GH₵)
              </span>
              <span className="text-base font-black text-emerald-400">
                GH₵ {totalPlatformRevenue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">All Customer Orders</span>
              <ShoppingBag className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-gray-950">{totalOrdersCount}</div>
            <span className="text-[11px] text-gray-500 mt-0.5 block">Total orders in database</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Active / In-Transit</span>
              <Bike className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-600">{activeOrdersCount}</div>
            <span className="text-[11px] text-gray-500 mt-0.5 block">Kitchen or out with rider</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Delivered</span>
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{deliveredOrdersCount}</div>
            <span className="text-[11px] text-gray-500 mt-0.5 block">Successfully completed</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Food Vendors</span>
              <Store className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-black text-orange-600">{restaurants.length}</div>
            <span className="text-[11px] text-gray-500 mt-0.5 block">Accra & Kumasi kitchens</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 text-xs font-bold pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Customer Orders Central ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Platform Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('restaurants')}
            className={`px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'restaurants'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Restaurant Governance ({restaurants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'coupons'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Coupons & Discounts ({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Payment Gateways (Hubtel & Paystack)</span>
          </button>
        </div>

        {/* TAB 1: Customer Orders Central (Admin Primary Tab) */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Search and Filters Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by customer name, phone, area (e.g. Osu, Cantonments), restaurant, or order #..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <span className="text-xs text-gray-500 shrink-0 font-medium">
                  Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> customer orders
                </span>
              </div>

              {/* Status Filter Badges */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold scrollbar-none">
                <span className="text-gray-400 mr-1 flex items-center gap-1 shrink-0">
                  <Filter className="w-3 h-3" /> Status:
                </span>
                {[
                  { id: 'ALL', label: `All (${orders.length})` },
                  { id: 'CONFIRMED', label: `Confirmed (${orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PAID').length})` },
                  { id: 'PREPARING', label: `In Kitchen (${orders.filter((o) => o.status === 'PREPARING').length})` },
                  { id: 'READY_FOR_PICKUP', label: `Ready/Dispatch (${orders.filter((o) => o.status === 'READY_FOR_PICKUP').length})` },
                  { id: 'OUT_FOR_DELIVERY', label: `Out for Delivery (${orders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length})` },
                  { id: 'DELIVERED', label: `Delivered (${orders.filter((o) => o.status === 'DELIVERED').length})` },
                  { id: 'CANCELLED', label: `Cancelled (${orders.filter((o) => o.status === 'CANCELLED').length})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id as any)}
                    className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                      statusFilter === f.id
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Feed */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 shadow-sm space-y-2">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-sm font-bold text-gray-900">No customer orders found</h3>
                <p className="text-xs text-gray-500">
                  Try adjusting your search criteria or status filter.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-purple-300 shadow-sm transition-all space-y-3"
                  >
                    {/* Top Row: Order # + Status + Price */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-sm text-gray-950">
                          #{ord.orderNumber}
                        </span>
                        {getStatusBadge(ord.status)}
                        <span className="text-[11px] font-mono text-gray-400">
                          ID: {ord.id}
                        </span>
                        <span className="text-xs text-gray-400">
                          • {new Date(ord.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Amount</span>
                          <span className="text-base font-black text-gray-950">
                            GH₵ {ord.total.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-200">
                          {ord.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Middle Grid: Customer Info vs Restaurant Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {/* Customer Column */}
                      <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 space-y-1">
                        <span className="text-[10px] font-bold text-blue-800 uppercase block">Customer Details</span>
                        <div className="font-bold text-gray-900 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                            {ord.customerName}
                          </span>
                          <a
                            href={`tel:${ord.customerPhone}`}
                            className="text-blue-700 hover:underline flex items-center gap-1 font-mono text-[11px]"
                          >
                            <Phone className="w-3 h-3" /> {ord.customerPhone}
                          </a>
                        </div>
                        <div className="text-gray-600 flex items-start gap-1 pt-1">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                          <span>{ord.deliveryAddress}</span>
                        </div>
                        {ord.digitalAddress && (
                          <div className="text-[10px] font-mono text-gray-600 bg-white px-2 py-0.5 rounded border border-blue-200 inline-block">
                            GPS: {ord.digitalAddress}
                          </div>
                        )}
                        {ord.deliveryNotes && (
                          <div className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 mt-1">
                            <strong>Note:</strong> "{ord.deliveryNotes}"
                          </div>
                        )}
                      </div>

                      {/* Restaurant Column */}
                      <div className="bg-orange-50/50 p-3.5 rounded-xl border border-orange-100 space-y-1">
                        <span className="text-[10px] font-bold text-orange-800 uppercase block">Restaurant Vendor</span>
                        <div className="font-bold text-gray-900 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Store className="w-3.5 h-3.5 text-orange-600" />
                            {ord.restaurantName}
                          </span>
                          <span className="text-[11px] text-gray-500 font-mono">{ord.restaurantPhone}</span>
                        </div>
                        <p className="text-gray-600">{ord.restaurantAddress}</p>
                        <div className="pt-1 text-[11px] text-gray-600">
                          <span className="font-semibold text-gray-800">Dishes: </span>
                          {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                      </div>

                      {/* Dispatch & Rider Column */}
                      <div className="bg-purple-50/50 p-3.5 rounded-xl border border-purple-100 space-y-2">
                        <span className="text-[10px] font-bold text-purple-800 uppercase block">Courier Dispatch</span>
                        {ord.riderName ? (
                          <div className="space-y-1">
                            <div className="font-bold text-gray-900 flex items-center gap-1">
                              <Bike className="w-3.5 h-3.5 text-purple-700" />
                              <span>{ord.riderName}</span>
                            </div>
                            <p className="text-gray-600 text-[11px]">Contact: {ord.riderPhone}</p>
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                              Rider Fee: GH₵ {ord.deliveryFee.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-xs text-amber-700 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              No Rider Assigned
                            </span>
                            <p className="text-[11px] text-gray-500">
                              Order is queued in Accra rider dispatch pool.
                            </p>
                          </div>
                        )}

                        <div className="pt-1 text-[10px] text-gray-500 font-mono">
                          Payment: {ord.paymentMethod.toUpperCase()} • Ref: {ord.paymentReference || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Admin Status Actions Bar */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700">Admin Status Override:</span>
                        <select
                          value={ord.status}
                          onChange={(e) => handleAdminStatusChange(ord.id, e.target.value as OrderStatus)}
                          className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="PENDING_PAYMENT">Pending Payment</option>
                          <option value="PAID">Paid</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="PREPARING">Preparing (Kitchen)</option>
                          <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                          <option value="RIDER_ASSIGNED">Rider Assigned</option>
                          <option value="PICKED_UP">Picked Up</option>
                          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-1.5 px-3.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Receipt & Timeline</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Overview (Platform Summary) */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-950">Recent Platform Orders Stream</h3>
                <p className="text-xs text-gray-500">Live order activity across Ghana</p>
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-purple-700 hover:underline"
              >
                View Full Orders Central &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Order</th>
                    <th className="p-3.5">Restaurant</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Phone</th>
                    <th className="p-3.5">Delivery Address</th>
                    <th className="p-3.5">Total</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/50">
                      <td className="p-3.5 font-mono font-bold text-gray-900">#{ord.orderNumber}</td>
                      <td className="p-3.5 font-medium text-gray-900">{ord.restaurantName}</td>
                      <td className="p-3.5 text-gray-700 font-semibold">{ord.customerName}</td>
                      <td className="p-3.5 font-mono text-gray-600">{ord.customerPhone}</td>
                      <td className="p-3.5 text-gray-600 truncate max-w-[180px]">{ord.deliveryAddress}</td>
                      <td className="p-3.5 font-bold text-gray-900">GH₵ {ord.total.toFixed(2)}</td>
                      <td className="p-3.5">{getStatusBadge(ord.status)}</td>
                      <td className="p-3.5">
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setActiveTab('orders');
                          }}
                          className="text-purple-700 hover:underline font-bold"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Restaurant Management */}
        {activeTab === 'restaurants' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-950">Registered Food Vendors</h3>
                <p className="text-xs text-gray-500">Manage verification and listing status</p>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {restaurants.map((rest) => (
                <div key={rest.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={rest.logoUrl}
                      alt={rest.name}
                      className="w-12 h-12 rounded-xl object-cover bg-gray-100"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-gray-900 text-xs">{rest.name}</h4>
                        {rest.isVerified && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 rounded">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {rest.neighborhood}, {rest.city} • {rest.phone}
                      </p>
                      <span className="text-[11px] text-gray-400">
                        Rating: {rest.rating} ★ ({rest.reviewCount} reviews) • Del. Fee: GH₵ {rest.deliveryFee.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleRestaurantVerification(rest)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                      rest.isVerified
                        ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    }`}
                  >
                    {rest.isVerified ? 'Revoke Verification' : 'Verify Restaurant'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Coupons */}
        {activeTab === 'coupons' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-950">Discount Promo Codes</h3>
                <p className="text-xs text-gray-500">Manage customer promotional discounts</p>
              </div>
              <button
                onClick={() => setShowAddCoupon(true)}
                className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Coupon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {c.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-700 font-bold pt-1">
                      {c.discountType === 'percentage'
                        ? `${c.discountValue}% Off Total Order`
                        : `GH₵ ${c.discountValue.toFixed(2)} Flat Discount`}
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Min. Order: GH₵ {c.minOrder.toFixed(2)} • Used: {c.usageCount} times
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleCouponActive(c)}
                    className="w-full text-xs font-bold py-1.5 border border-gray-200 rounded-xl hover:bg-gray-50"
                  >
                    {c.isActive ? 'Deactivate Code' : 'Enable Code'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Payment Gateways */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-emerald-950">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-sm">
                ✓
              </div>
              <div className="text-xs space-y-1">
                <h4 className="font-extrabold text-sm text-emerald-900">
                  Ready Mode: Full Mock & Live API Integration Available
                </h4>
                <p className="text-emerald-800 leading-relaxed">
                  The application is configured to run out-of-the-box without requiring live Hubtel or Paystack keys. All payment flows simulate Ghana payment authorizations and generate real orders saved directly to your live Firestore database.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hubtel Card */}
              <div className="bg-white p-5 rounded-2xl border-2 border-blue-600 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                      H
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-950">Hubtel Merchant Gateway</h4>
                      <span className="text-[10px] text-blue-700 bg-blue-50 font-bold px-2 py-0.5 rounded-full">
                        Native Ghana Direct MoMo
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    0 GH₵ Setup Fee
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  Hubtel provides direct API endpoints for instant Mobile Money prompts to MTN MoMo, Telecel Cash, and AT Money wallets without monthly maintenance fees.
                </p>
              </div>

              {/* Paystack Card */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 text-white font-black text-sm flex items-center justify-center shadow-md">
                      P
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-950">Paystack Ghana</h4>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded-full">
                        Cards + MoMo + Apple Pay
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    0 GH₵ Setup Fee
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  Paystack allows instant checkout for Debit Cards (Visa/Mastercard) and Ghana Mobile Money. Free merchant account with no maintenance charge.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Admin Customer Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-gray-900">
                    Order #{selectedOrder.orderNumber}
                  </h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <span className="text-xs text-gray-400">
                  ID: {selectedOrder.id} • Placed {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Details Box */}
            <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">Customer Information</span>
              <div className="flex items-center justify-between font-bold text-gray-900">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  {selectedOrder.customerName}
                </span>
                <a href={`tel:${selectedOrder.customerPhone}`} className="text-blue-700 hover:underline">
                  {selectedOrder.customerPhone}
                </a>
              </div>
              <div className="text-gray-700 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <span>{selectedOrder.deliveryAddress}</span>
              </div>
              {selectedOrder.digitalAddress && (
                <div className="font-mono text-gray-700 bg-white px-2 py-0.5 rounded border border-blue-200 inline-block text-[11px]">
                  GhanaPost GPS: {selectedOrder.digitalAddress}
                </div>
              )}
              {selectedOrder.deliveryNotes && (
                <div className="text-amber-900 bg-amber-50 p-2 rounded border border-amber-200">
                  <strong>Customer Delivery Instructions:</strong> "{selectedOrder.deliveryNotes}"
                </div>
              )}
            </div>

            {/* Restaurant & Rider Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-orange-50/60 p-3 rounded-xl border border-orange-200 space-y-1">
                <span className="text-[10px] font-bold text-orange-800 uppercase block">Food Vendor</span>
                <div className="font-bold text-gray-900">{selectedOrder.restaurantName}</div>
                <p className="text-gray-500 text-[11px]">{selectedOrder.restaurantAddress}</p>
                <p className="text-gray-500 text-[11px]">{selectedOrder.restaurantPhone}</p>
              </div>

              <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-200 space-y-1">
                <span className="text-[10px] font-bold text-purple-800 uppercase block">Courier / Rider</span>
                <div className="font-bold text-gray-900">
                  {selectedOrder.riderName ? selectedOrder.riderName : 'Unassigned Rider'}
                </div>
                <p className="text-gray-500 text-[11px]">{selectedOrder.riderPhone || 'Awaiting rider pickup'}</p>
                <p className="text-emerald-700 font-bold text-[11px]">
                  Rider Fee: GH₵ {selectedOrder.deliveryFee.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Itemized Receipt */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-900">Meal Items Ordered:</span>
              <div className="divide-y divide-gray-100 text-xs">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-900">
                        {item.quantity}x {item.name}
                      </div>
                      {item.specialInstructions && (
                        <p className="text-[11px] text-gray-500 italic">"{item.specialInstructions}"</p>
                      )}
                    </div>
                    <span className="font-bold text-gray-900">GH₵ {(item.itemTotalPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Accounting */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs space-y-1.5">
              <div className="flex justify-between text-gray-600">
                <span>Meal Subtotal:</span>
                <span>GH₵ {selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee:</span>
                <span>GH₵ {selectedOrder.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Platform Service Fee:</span>
                <span>GH₵ {selectedOrder.serviceFee.toFixed(2)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Promo Discount ({selectedOrder.couponCode || 'PROMO'}):</span>
                  <span>-GH₵ {selectedOrder.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-gray-950 text-sm border-t border-gray-200 pt-1.5">
                <span>Grand Total:</span>
                <span>GH₵ {selectedOrder.total.toFixed(2)}</span>
              </div>
              <div className="text-[11px] text-gray-500 pt-1">
                Payment: {selectedOrder.paymentMethod.toUpperCase()} • Ref: {selectedOrder.paymentReference || 'N/A'} • Status: {selectedOrder.paymentStatus}
              </div>
            </div>

            {/* Audit Timeline */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-gray-900 block">Order Audit Log:</span>
              <div className="space-y-1 text-xs">
                {selectedOrder.timeline.map((evt, idx) => (
                  <div key={idx} className="bg-gray-50 p-2 rounded-lg border border-gray-200 flex items-start justify-between">
                    <div>
                      <span className="font-bold text-gray-800">{evt.label}</span>
                      {evt.note && <p className="text-[11px] text-gray-500">{evt.note}</p>}
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-700">Change Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleAdminStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                  className="bg-gray-50 border border-gray-300 rounded-xl px-2.5 py-1 text-xs font-semibold text-gray-900"
                >
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PREPARING">Preparing</option>
                  <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-xs font-bold text-gray-700 hover:text-gray-950 px-4 py-2 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {showAddCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateCoupon}
            className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-gray-200 space-y-4"
          >
            <div>
              <h3 className="text-base font-bold text-gray-950">Create Ghana Promo Code</h3>
              <p className="text-xs text-gray-500">Add a discount code for customers</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CHOP30"
                  className="w-full p-2.5 border border-gray-200 rounded-xl font-mono uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Type</label>
                  <select
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="percentage">% Percentage</option>
                    <option value="fixed">GH₵ Fixed</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Value</label>
                  <input
                    type="number"
                    value={couponValue}
                    onChange={(e) => setCouponValue(e.target.value)}
                    placeholder="20"
                    className="w-full p-2.5 border border-gray-200 rounded-xl font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Min Order (GH₵)</label>
                <input
                  type="number"
                  value={couponMinOrder}
                  onChange={(e) => setCouponMinOrder(e.target.value)}
                  placeholder="60"
                  className="w-full p-2.5 border border-gray-200 rounded-xl font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCoupon(false)}
                className="text-xs text-gray-500 px-3 py-2 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white px-5 py-2 rounded-xl shadow-md"
              >
                Create Coupon
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
