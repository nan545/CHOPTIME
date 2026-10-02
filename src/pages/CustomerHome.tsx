import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  MapPin,
  Clock,
  Bike,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { getRestaurants, getAllFoodItems } from '../lib/db';
import { Restaurant, FoodItem } from '../types';
import { RestaurantCard } from '../components/RestaurantCard';
import { FoodItemModal } from '../components/FoodItemModal';
import { useCart } from '../context/CartContext';

const CUISINE_CATEGORIES = [
  { id: 'all', name: 'All Cuisines', icon: '🍽️' },
  { id: 'Ghanaian', name: 'Ghanaian Classics', icon: '🍲' },
  { id: 'Jollof & Grills', name: 'Jollof & Grills', icon: '🍗' },
  { id: 'Waakye & Local Pots', name: 'Waakye & Pots', icon: '🍛' },
  { id: 'Soups & Swallows', name: 'Fufu & Banku', icon: '🥣' },
  { id: 'Fast Food', name: 'Papaye & Burgers', icon: '🍔' },
  { id: 'Street Bites', name: 'Kelewele & Bites', icon: '🍌' },
  { id: 'Drinks & Sobolo', name: 'Sobolo & Juices', icon: '🍹' },
];

export const CustomerHome: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [popularDishes, setPopularDishes] = useState<FoodItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState<{ item: FoodItem; restaurant: Restaurant } | null>(null);

  const { selectedAddress } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [rests, foods] = await Promise.all([getRestaurants(), getAllFoodItems()]);
        setRestaurants(rests);
        setPopularDishes(foods.filter((f) => f.isPopular).slice(0, 6));
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredRestaurants =
    selectedCategory === 'all'
      ? restaurants
      : restaurants.filter((r) => r.cuisineType.some((c) => c.includes(selectedCategory)));

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-12">
      {/* Top Mobile Delivery Address Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 sm:hidden flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
          <span className="text-xs text-gray-500">Delivering to:</span>
          <span className="text-xs font-bold text-gray-900 truncate">
            {selectedAddress.area} ({selectedAddress.digitalAddress || 'GA-030'})
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* Promotional Akwaaba Banner */}
        <div className="relative rounded-2xl bg-gradient-to-r from-stone-900 to-gray-950 text-white overflow-hidden p-6 sm:p-8 border border-gray-800 shadow-sm">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-orange-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Akwaaba Promo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Enjoy Hot Ghanaian Meals Delivered in 30 Mins
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 mb-4 leading-relaxed">
              Use voucher code <span className="font-mono font-bold text-orange-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-700">AKWAABA20</span> at checkout for 20% off your first order!
            </p>
            <button
              onClick={() => navigate('/search')}
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-xl transition-colors shadow-md"
            >
              Order Meal Now
            </button>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden md:block opacity-40">
            <img
              src="https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop"
              alt="Ghanaian Jollof & Grills"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Cuisine Category Selector */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-950">
              Explore Cuisines
            </h2>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CUISINE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Restaurants Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-950">
                Top Restaurants in Accra & Kumasi
              </h2>
              <p className="text-xs text-gray-500">
                Freshly prepared and dispatched directly from restaurant kitchens
              </p>
            </div>
            <button
              onClick={() => navigate('/search')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5"
            >
              <span>See All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <p className="text-sm text-gray-500">
                No restaurants found for the selected category.
              </p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="mt-3 text-xs font-bold text-orange-600 hover:underline"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </div>

        {/* Popular Dishes / Quick Order Section */}
        {popularDishes.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-gray-950">
                    Most Ordered Dishes
                  </h2>
                </div>
                <p className="text-xs text-gray-500">
                  Customer favorites ordered across Accra today
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularDishes.map((dish) => {
                const rest = restaurants.find((r) => r.id === dish.restaurantId);
                return (
                  <div
                    key={dish.id}
                    onClick={() => {
                      if (rest) setSelectedFood({ item: dish, restaurant: rest });
                    }}
                    className="flex bg-white rounded-2xl overflow-hidden border border-gray-200/80 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all p-3 gap-3 items-center"
                  >
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 bg-gray-100"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                        {rest?.name || 'Restaurant'}
                      </span>
                      <h4 className="text-xs font-bold text-gray-950 truncate mt-0.5">
                        {dish.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                        {dish.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-extrabold text-gray-900">
                          GH₵ {dish.price.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                          + Add
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Why ChopTime Ghana Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-200">
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Fast Local Dispatch</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Reliable riders delivering warm food across Osu, East Legon, Cantonments, and Kumasi.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-200">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Paystack & MoMo Security</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Pay securely via MTN Mobile Money, Telecel Cash, AT Money, or Bank Card.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-200">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Real-Time Kitchen Sync</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Live order tracking from the chef’s ladle directly to your gate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Food Customization Modal */}
      {selectedFood && (
        <FoodItemModal
          item={selectedFood.item}
          restaurant={selectedFood.restaurant}
          onClose={() => setSelectedFood(null)}
        />
      )}
    </div>
  );
};
