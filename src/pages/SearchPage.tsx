import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, X, SlidersHorizontal } from 'lucide-react';
import { getRestaurants, getAllFoodItems } from '../lib/db';
import { Restaurant, FoodItem } from '../types';
import { RestaurantCard } from '../components/RestaurantCard';
import { FoodItemModal } from '../components/FoodItemModal';

export const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [maxDeliveryFee, setMaxDeliveryFee] = useState<number>(20);
  const [selectedFood, setSelectedFood] = useState<{ item: FoodItem; restaurant: Restaurant } | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [r, f] = await Promise.all([getRestaurants(), getAllFoodItems()]);
        setRestaurants(r);
        setFoodItems(f);
      } catch (err) {
        console.error('Failed to load search data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const term = searchTerm.toLowerCase().trim();

  // Filter restaurants
  const matchedRestaurants = restaurants.filter((r) => {
    if (selectedCity !== 'all' && r.city.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }
    if (onlyOpen && !r.isOpen) {
      return false;
    }
    if (r.deliveryFee > maxDeliveryFee) {
      return false;
    }
    if (!term) return true;
    return (
      r.name.toLowerCase().includes(term) ||
      r.description.toLowerCase().includes(term) ||
      r.neighborhood.toLowerCase().includes(term) ||
      r.cuisineType.some((c) => c.toLowerCase().includes(term))
    );
  });

  // Filter food items
  const matchedFoods = foodItems.filter((f) => {
    if (!term) return false; // only show food matches if search term entered
    return (
      f.name.toLowerCase().includes(term) ||
      f.description.toLowerCase().includes(term) ||
      f.categoryName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        {/* Search Header */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for restaurants, Jollof, Waakye, Tilapia, Papaye, Banku..."
              className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 bg-gray-50"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
            <span className="font-bold text-gray-500 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters:
            </span>

            {/* City Filter */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1 text-gray-700 font-semibold focus:outline-none"
            >
              <option value="all">All Cities (Accra & Kumasi)</option>
              <option value="Accra">Accra Only</option>
              <option value="Kumasi">Kumasi Only</option>
            </select>

            {/* Open Now toggle */}
            <button
              onClick={() => setOnlyOpen(!onlyOpen)}
              className={`px-3 py-1 rounded-lg border font-semibold transition-colors ${
                onlyOpen
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              Open Now
            </button>

            {/* Max Delivery Fee */}
            <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200">
              <span className="text-gray-600">Max Delivery:</span>
              <span className="font-bold text-gray-900">GH₵ {maxDeliveryFee}</span>
              <input
                type="range"
                min="10"
                max="25"
                step="1"
                value={maxDeliveryFee}
                onChange={(e) => setMaxDeliveryFee(Number(e.target.value))}
                className="w-16 accent-orange-600"
              />
            </div>
          </div>
        </div>

        {/* Matching Dishes (if search term is entered) */}
        {term && matchedFoods.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider mb-3">
              Dishes Matching "{searchTerm}" ({matchedFoods.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {matchedFoods.map((dish) => {
                const rest = restaurants.find((r) => r.id === dish.restaurantId);
                return (
                  <div
                    key={dish.id}
                    onClick={() => {
                      if (rest) setSelectedFood({ item: dish, restaurant: rest });
                    }}
                    className="flex bg-white rounded-xl border border-gray-200 p-3 gap-3 items-center hover:border-gray-300 cursor-pointer shadow-sm"
                  >
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-16 h-16 rounded-lg object-cover shrink-0 bg-gray-100"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-orange-600">
                        {rest?.name}
                      </span>
                      <h4 className="text-xs font-bold text-gray-950 truncate">
                        {dish.name}
                      </h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-bold text-gray-900">
                          GH₵ {dish.price.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
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

        {/* Restaurants Results */}
        <div>
          <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider mb-3">
            Restaurants ({matchedRestaurants.length})
          </h3>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : matchedRestaurants.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <p className="text-sm text-gray-500">
                No restaurants match your search and filter criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {matchedRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </div>
      </div>

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
