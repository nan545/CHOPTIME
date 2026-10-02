import React, { useState, useEffect } from 'react';
import {
  Store,
  DollarSign,
  ShoppingBag,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Check,
  Utensils,
  Layers,
} from 'lucide-react';
import {
  subscribeToRestaurantOrders,
  updateOrderStatus,
  getFoodItemsByRestaurant,
  saveFoodItem,
  getRestaurantById,
  saveRestaurant,
} from '../lib/db';
import { Order, FoodItem, Restaurant, OrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';

export const RestaurantDashboard: React.FC = () => {
  const { profile } = useAuth();
  const restaurantId = profile?.restaurantId || 'rest-buka-osu';

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'settings'>('orders');
  const [loading, setLoading] = useState(true);

  // New Dish Modal
  const [showAddDish, setShowAddDish] = useState(false);
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishCategory, setDishCategory] = useState('Jollof & Grills');
  const [dishDesc, setDishDesc] = useState('');
  const [dishImage, setDishImage] = useState('https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [rest, foods] = await Promise.all([
          getRestaurantById(restaurantId),
          getFoodItemsByRestaurant(restaurantId),
        ]);
        setRestaurant(rest);
        setMenuItems(foods);
      } catch (err) {
        console.error('Failed to load restaurant data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Subscribe to live orders in real time
    const unsubscribe = subscribeToRestaurantOrders(restaurantId, (liveOrders) => {
      setOrders(liveOrders);
    });

    return () => unsubscribe();
  }, [restaurantId]);

  // Analytics calculation
  const totalRevenue = orders.reduce((sum, ord) => sum + ord.subtotal, 0);
  const pendingOrders = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PREPARING');
  const completedOrders = orders.filter((o) => o.status === 'DELIVERED');

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    await updateOrderStatus(orderId, nextStatus);
  };

  const handleToggleAvailability = async (item: FoodItem) => {
    const updated = { ...item, isAvailable: !item.isAvailable };
    await saveFoodItem(updated);
    setMenuItems((prev) => prev.map((f) => (f.id === item.id ? updated : f)));
  };

  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim() || !dishPrice) return;

    const newItem: FoodItem = {
      id: `food-${Date.now()}`,
      restaurantId,
      categoryId: `cat-${dishCategory.toLowerCase().replace(/\s+/g, '-')}`,
      categoryName: dishCategory,
      name: dishName.trim(),
      description: dishDesc.trim() || 'Prepared fresh with Ghanaian spices.',
      price: parseFloat(dishPrice),
      imageUrl: dishImage,
      isAvailable: true,
      isPopular: false,
      createdAt: new Date().toISOString(),
    };

    await saveFoodItem(newItem);
    setMenuItems((prev) => [newItem, ...prev]);
    setShowAddDish(false);
    setDishName('');
    setDishPrice('');
    setDishDesc('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-12">
      {/* Top Banner */}
      <div className="bg-amber-900 text-white py-6 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-800 border border-amber-700 flex items-center justify-center shrink-0">
              <Store className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black">{restaurant?.name || 'Restaurant Portal'}</h1>
                <span className="text-[10px] font-bold bg-amber-800 text-amber-200 px-2 py-0.5 rounded uppercase">
                  Kitchen Portal
                </span>
              </div>
              <p className="text-xs text-amber-200 mt-0.5">
                {restaurant?.neighborhood}, {restaurant?.city} • {restaurant?.openingHours}
              </p>
            </div>
          </div>

          {/* Quick Metrics Header */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="bg-amber-950/60 border border-amber-800/80 px-3 py-1.5 rounded-xl">
              <span className="text-amber-400 block text-[10px]">TOTAL REVENUE</span>
              <span className="text-base font-black">GH₵ {totalRevenue.toFixed(2)}</span>
            </div>
            <div className="bg-amber-950/60 border border-amber-800/80 px-3 py-1.5 rounded-xl">
              <span className="text-amber-400 block text-[10px]">ACTIVE KITCHEN</span>
              <span className="text-base font-black">{pendingOrders.length} Orders</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 text-xs font-bold pb-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
              activeTab === 'orders'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Kitchen Queue ({pendingOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
              activeTab === 'menu'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Menu Manager ({menuItems.length})</span>
          </button>
        </div>

        {/* Tab 1: Live Kitchen Orders Queue */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-950">Live Kitchen Orders</h3>
                <p className="text-xs text-gray-500">
                  Real-time sync: Updates show immediately on the customer’s phone and rider’s dispatch app.
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-200">
                <ShoppingBag className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-gray-900">No incoming orders right now</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Orders placed by customers in Accra will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className={`bg-white rounded-2xl p-5 border-2 shadow-sm space-y-3 ${
                      ord.status === 'CONFIRMED'
                        ? 'border-amber-500 bg-amber-50/20'
                        : ord.status === 'PREPARING'
                        ? 'border-orange-500 bg-orange-50/20'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black font-mono bg-gray-900 text-white px-2 py-0.5 rounded">
                            #{ord.orderNumber}
                          </span>
                          <span className="text-xs font-bold text-gray-900">{ord.customerName}</span>
                        </div>
                        <span className="text-[11px] text-gray-500 mt-0.5 block">
                          Phone: {ord.customerPhone}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          ord.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Ordered Dishes List */}
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 divide-y divide-gray-200 text-xs">
                      {ord.items.map((it) => (
                        <div key={it.id} className="py-1.5 first:pt-0 last:pb-0">
                          <div className="flex justify-between font-bold text-gray-900">
                            <span>
                              {it.quantity}x {it.name}
                            </span>
                            <span>GH₵ {(it.itemTotalPrice * it.quantity).toFixed(2)}</span>
                          </div>
                          {it.selectedAddons && it.selectedAddons.length > 0 && (
                            <div className="text-[10px] text-orange-600">
                              Extras: {it.selectedAddons.map((a) => a.name).join(', ')}
                            </div>
                          )}
                          {it.specialInstructions && (
                            <div className="text-[10px] italic text-gray-500">
                              Note: "{it.specialInstructions}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Action transition buttons for restaurant staff */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs font-extrabold text-gray-950">
                        Total: GH₵ {ord.total.toFixed(2)}
                      </span>

                      <div className="flex items-center gap-2">
                        {ord.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, 'PREPARING')}
                            className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-sm"
                          >
                            Start Cooking
                          </button>
                        )}

                        {ord.status === 'PREPARING' && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, 'READY_FOR_PICKUP')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-sm"
                          >
                            Mark Ready for Pickup
                          </button>
                        )}

                        {ord.status === 'READY_FOR_PICKUP' && (
                          <span className="text-[11px] font-semibold text-gray-500 italic">
                            Awaiting Rider Collection
                          </span>
                        )}

                        {ord.status === 'OUT_FOR_DELIVERY' && (
                          <span className="text-[11px] font-semibold text-blue-600">
                            Rider on the Road
                          </span>
                        )}

                        {ord.status === 'DELIVERED' && (
                          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Delivered
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Menu Manager */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-950">Menu Items & Pricing</h3>
                <p className="text-xs text-gray-500">
                  Add dishes, modify Cedis pricing, and toggle item availability.
                </p>
              </div>
              <button
                onClick={() => setShowAddDish(true)}
                className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Dish</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-amber-700 uppercase">
                        {item.categoryName}
                      </span>
                      <h4 className="text-xs font-bold text-gray-950 truncate mt-0.5">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                      <span className="text-xs font-black text-gray-900 mt-1 block">
                        GH₵ {item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                    </span>

                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className="text-xs font-semibold text-gray-600 hover:text-gray-900 underline"
                    >
                      {item.isAvailable ? 'Mark Sold Out' : 'Mark In Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add New Dish Modal */}
      {showAddDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateDish}
            className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-200 space-y-4"
          >
            <div>
              <h3 className="text-base font-bold text-gray-950">Add Menu Dish</h3>
              <p className="text-xs text-gray-500">
                Create a new food item for {restaurant?.name}.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Dish Name</label>
                <input
                  type="text"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="e.g. Red Red with Fried Snapper"
                  className="w-full p-2.5 border border-gray-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Price (GH₵)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={dishPrice}
                    onChange={(e) => setDishPrice(e.target.value)}
                    placeholder="75.00"
                    className="w-full p-2.5 border border-gray-200 rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Category</label>
                  <select
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="Jollof & Grills">Jollof & Grills</option>
                    <option value="Waakye & Local Pots">Waakye & Local Pots</option>
                    <option value="Soups & Swallows">Soups & Swallows</option>
                    <option value="Fast Food">Fast Food</option>
                    <option value="Street Bites">Street Bites</option>
                    <option value="Drinks & Sobolo">Drinks & Sobolo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  value={dishDesc}
                  onChange={(e) => setDishDesc(e.target.value)}
                  placeholder="Ingredients, seasonings, sides included..."
                  rows={2}
                  className="w-full p-2.5 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Image URL</label>
                <input
                  type="url"
                  value={dishImage}
                  onChange={(e) => setDishImage(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddDish(false)}
                className="text-xs text-gray-500 px-3 py-2 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white px-5 py-2 rounded-xl shadow-md"
              >
                Save Food Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
