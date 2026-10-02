import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Clock,
  Bike,
  MapPin,
  Phone,
  CheckCircle2,
  ShoppingBag,
  ArrowLeft,
  Utensils,
  MessageSquare,
} from 'lucide-react';
import { getRestaurantById, getFoodItemsByRestaurant, getReviewsForRestaurant } from '../lib/db';
import { Restaurant, FoodItem, Review } from '../types';
import { FoodItemModal } from '../components/FoodItemModal';
import { useCart } from '../context/CartContext';

export const RestaurantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  const { items, total } = useCart();
  const totalCartCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  useEffect(() => {
    async function loadRestaurant() {
      if (!id) return;
      setLoading(true);
      try {
        const [rest, foods, revs] = await Promise.all([
          getRestaurantById(id),
          getFoodItemsByRestaurant(id),
          getReviewsForRestaurant(id),
        ]);
        setRestaurant(rest);
        setFoodItems(foods);
        setReviews(revs);
      } catch (err) {
        console.error('Error loading restaurant detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRestaurant();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-gray-500">Loading restaurant menu...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Restaurant Not Found</h2>
        <p className="text-xs text-gray-500 mb-4">
          The restaurant you requested could not be located or has closed.
        </p>
        <Link
          to="/"
          className="text-xs font-bold text-orange-600 bg-orange-50 px-4 py-2 rounded-xl hover:bg-orange-100"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  // Extract unique food categories
  const categories = ['all', ...Array.from(new Set(foodItems.map((f) => f.categoryName)))];

  const displayedFoods =
    selectedCategory === 'all'
      ? foodItems
      : foodItems.filter((f) => f.categoryName === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 pb-28 md:pb-16">
      {/* Cover Image Header */}
      <div className="relative h-56 sm:h-72 w-full bg-gray-950 overflow-hidden">
        <img
          src={restaurant.coverImageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />

        {/* Back Button */}
        <Link
          to="/"
          className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-md hover:bg-white transition-colors"
          aria-label="Back to explore"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 space-y-6">
        {/* Restaurant Profile Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-md bg-gray-100 shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-gray-950">
                    {restaurant.name}
                  </h1>
                  {restaurant.isVerified && (
                    <CheckCircle2 className="w-5 h-5 text-orange-600 fill-orange-50 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
                  {restaurant.description}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-orange-600" />
                    {restaurant.address}, {restaurant.neighborhood}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {restaurant.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-200/60 font-bold text-sm">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{restaurant.rating.toFixed(1)}</span>
                <span className="text-xs text-amber-700 font-normal">
                  ({restaurant.reviewCount} reviews)
                </span>
              </div>
              <div className="text-[11px] text-gray-500 mt-1 font-medium">
                Min. Order: GH₵ {restaurant.minOrder.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Delivery & Hours Bar */}
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-4 h-4 text-orange-600 shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px]">DELIVERY TIME</span>
                <span className="font-bold">
                  {restaurant.estimatedDeliveryMin}–{restaurant.estimatedDeliveryMax} Mins
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Bike className="w-4 h-4 text-orange-600 shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px]">DELIVERY FEE</span>
                <span className="font-bold">GH₵ {restaurant.deliveryFee.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Utensils className="w-4 h-4 text-orange-600 shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px]">CUISINE</span>
                <span className="font-bold truncate max-w-[120px]">
                  {restaurant.cuisineType.join(', ')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  restaurant.isOpen ? 'bg-emerald-500' : 'bg-red-500'
                }`}
              />
              <div>
                <span className="text-gray-400 block text-[10px]">STATUS</span>
                <span className="font-bold">
                  {restaurant.isOpen ? 'Open Now' : 'Closed'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu vs Reviews Tabs */}
        <div className="flex items-center gap-3 border-b border-gray-200 text-sm font-bold">
          <button
            onClick={() => setActiveTab('menu')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'menu'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Menu Dishes ({foodItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'reviews'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Customer Reviews ({reviews.length})</span>
          </button>
        </div>

        {/* Tab 1: Menu Dishes */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors whitespace-nowrap border ${
                    selectedCategory === cat
                      ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {cat === 'all' ? 'All Dishes' : cat}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedFoods.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedFood(item)}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-200/80 hover:border-gray-300 hover:shadow-md cursor-pointer transition-all p-3.5"
                >
                  <div className="flex gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-24 h-24 rounded-xl object-cover shrink-0 bg-gray-100 group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-bold text-gray-950 text-sm truncate group-hover:text-orange-600 transition-colors">
                          {item.name}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="mt-auto pt-2 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-gray-950">
                          GH₵ {item.price.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg transition-colors">
                          Customize +
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Reviews */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Verified Customer Reviews</h3>
                <p className="text-xs text-gray-500">
                  Only customers who placed and completed an order can leave feedback.
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-gray-950">{restaurant.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400 block">out of 5.0</span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">
                No customer reviews yet. Be the first to order and review {restaurant.name}!
              </p>
            ) : (
              <div className="divide-y divide-gray-100 space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">{rev.customerName}</span>
                      <div className="flex items-center text-amber-500 text-xs">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar if items are in cart */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-14 md:bottom-4 left-0 right-0 z-30 px-4">
          <div className="max-w-xl mx-auto">
            <Link
              to="/cart"
              className="flex items-center justify-between bg-orange-600 hover:bg-orange-700 text-white p-3.5 rounded-2xl shadow-xl transition-all"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-700 flex items-center justify-center font-bold text-xs">
                  {totalCartCount}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold leading-none">View Cart</div>
                  <div className="text-[10px] text-orange-200 mt-0.5">
                    {restaurant.name}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 font-extrabold text-sm">
                <span>GH₵ {total.toFixed(2)}</span>
                <ShoppingBag className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Customization Modal */}
      {selectedFood && (
        <FoodItemModal
          item={selectedFood}
          restaurant={restaurant}
          onClose={() => setSelectedFood(null)}
        />
      )}
    </div>
  );
};
