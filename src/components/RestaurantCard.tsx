import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Bike, CheckCircle2 } from 'lucide-react';
import { Restaurant } from '../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-200/80 hover:border-gray-300 hover:shadow-md transition-all duration-200"
    >
      {/* Cover image container */}
      <div className="relative h-44 sm:h-48 w-full bg-gray-100 overflow-hidden">
        <img
          src={restaurant.coverImageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          loading="lazy"
        />

        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent" />

        {/* Delivery Time Badge */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
          <Clock className="w-3.5 h-3.5 text-orange-600" />
          <span>
            {restaurant.estimatedDeliveryMin}–{restaurant.estimatedDeliveryMax} min
          </span>
        </div>

        {/* Featured or Open Status */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          {restaurant.isFeatured && (
            <span className="bg-orange-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              Popular
            </span>
          )}
          {!restaurant.isOpen && (
            <span className="bg-gray-900/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
              Closed
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-bold text-gray-950 text-base truncate group-hover:text-orange-600 transition-colors">
              {restaurant.name}
            </h3>
            {restaurant.isVerified && (
              <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 fill-orange-50" />
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 bg-gray-100 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-md shrink-0">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{restaurant.rating.toFixed(1)}</span>
            <span className="text-gray-400 font-normal">({restaurant.reviewCount})</span>
          </div>
        </div>

        {/* Cuisine Types */}
        <p className="text-xs text-gray-500 line-clamp-1 mb-2.5">
          {restaurant.cuisineType.join(' • ')}
        </p>

        {/* Footer info: neighborhood & delivery fee */}
        <div className="mt-auto pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
          <span className="font-medium text-gray-700">
            {restaurant.neighborhood}, {restaurant.city}
          </span>
          <div className="flex items-center gap-1 font-semibold text-gray-900">
            <Bike className="w-3.5 h-3.5 text-gray-400" />
            <span>GH₵ {restaurant.deliveryFee.toFixed(2)} del.</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
