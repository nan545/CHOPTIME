import React from 'react';
import { MapPin, Navigation, Bike, ExternalLink, Store } from 'lucide-react';
import { OrderStatus } from '../types';

interface RealtimeMapProps {
  restaurantName: string;
  restaurantAddress: string;
  deliveryAddress: string;
  status: OrderStatus;
  riderName?: string;
  riderLocation?: { lat: number; lng: number };
}

export const RealtimeMap: React.FC<RealtimeMapProps> = ({
  restaurantName,
  restaurantAddress,
  deliveryAddress,
  status,
  riderName,
}) => {
  // Determine rider progress along the route based on actual order status
  let riderProgressPercent = 10;
  let statusMessage = 'Order confirmed. Awaiting restaurant preparation.';

  if (status === 'PREPARING') {
    riderProgressPercent = 15;
    statusMessage = 'Food is currently cooking in the kitchen.';
  } else if (status === 'READY_FOR_PICKUP' || status === 'RIDER_ASSIGNED') {
    riderProgressPercent = 25;
    statusMessage = `${riderName || 'Rider'} is heading to ${restaurantName}.`;
  } else if (status === 'PICKED_UP') {
    riderProgressPercent = 40;
    statusMessage = `${riderName || 'Rider'} just picked up your meal.`;
  } else if (status === 'OUT_FOR_DELIVERY') {
    riderProgressPercent = 75;
    statusMessage = `${riderName || 'Rider'} is on the road heading to your address.`;
  } else if (status === 'DELIVERED') {
    riderProgressPercent = 100;
    statusMessage = 'Order successfully delivered to your gate!';
  }

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    restaurantAddress + ', Ghana'
  )}&destination=${encodeURIComponent(deliveryAddress + ', Ghana')}`;

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 text-white relative shadow-md">
      {/* Map visual canvas simulation with street grid lines */}
      <div className="relative h-64 w-full bg-slate-950 overflow-hidden flex flex-col justify-between p-4">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Header HUD */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-semibold text-gray-200">
              {status === 'DELIVERED' ? 'Delivery Complete' : 'Live Tracking GPS'}
            </span>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 font-medium bg-orange-950/40 border border-orange-800/60 px-3 py-1.5 rounded-xl transition-colors"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Animated Road / Route Graphic */}
        <div className="relative z-10 my-auto px-6 py-4">
          {/* Connecting Road Line */}
          <div className="relative h-2 w-full bg-gray-800 rounded-full overflow-hidden">
            {/* Active progress trail */}
            <div
              className="h-full bg-gradient-to-r from-orange-600 via-amber-500 to-emerald-500 transition-all duration-1000 ease-out"
              style={{ width: `${riderProgressPercent}%` }}
            />
          </div>

          {/* Markers along the route */}
          <div className="relative flex justify-between items-center -mt-5">
            {/* Restaurant Marker */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg border-2 border-slate-900">
                <Store className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px] font-bold text-gray-300 mt-1 max-w-[80px] truncate text-center">
                {restaurantName}
              </span>
            </div>

            {/* Rider Moving Pin */}
            <div
              className="absolute transition-all duration-1000 ease-out flex flex-col items-center -translate-x-1/2"
              style={{ left: `${Math.max(10, Math.min(90, riderProgressPercent))}%` }}
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-xl border-2 border-white ring-4 ring-blue-500/20 animate-bounce">
                <Bike className="w-5 h-5 text-white" />
              </div>
              <span className="text-[9px] font-extrabold bg-blue-900/90 text-blue-200 px-1.5 py-0.5 rounded-md mt-0.5 whitespace-nowrap shadow">
                {riderName || 'ChopRider'}
              </span>
            </div>

            {/* Customer Gate Marker */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg border-2 border-slate-900">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px] font-bold text-gray-300 mt-1 max-w-[80px] truncate text-center">
                Your Gate
              </span>
            </div>
          </div>
        </div>

        {/* Bottom live stats banner */}
        <div className="relative z-10 bg-gray-900/90 backdrop-blur-md rounded-xl p-3 border border-gray-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="text-gray-300 line-clamp-1">{statusMessage}</span>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-xs font-bold text-white">
              {status === 'DELIVERED' ? 'Arrived' : status === 'OUT_FOR_DELIVERY' ? '8–12 min' : '20–30 min'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
