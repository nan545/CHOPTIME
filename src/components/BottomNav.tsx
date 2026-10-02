import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, ShoppingBag, Clock, User, Store, Bike, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const BottomNav: React.FC = () => {
  const { role } = useAuth();
  const { items } = useCart();
  const cartCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 md:hidden pb-safe">
      <div className="flex items-center justify-around h-14 px-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full text-[10px] font-medium transition-colors ${
              isActive ? 'text-orange-600 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Explore</span>
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full text-[10px] font-medium transition-colors ${
              isActive ? 'text-orange-600 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>Search</span>
        </NavLink>

        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center w-full h-full text-[10px] font-medium transition-colors ${
              isActive ? 'text-orange-600 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-orange-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full text-[10px] font-medium transition-colors ${
              isActive ? 'text-orange-600 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <Clock className="w-5 h-5 mb-0.5" />
          <span>Orders</span>
        </NavLink>

        {role === 'restaurant' ? (
          <NavLink
            to="/restaurant"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full text-[10px] font-medium transition-colors ${
                isActive ? 'text-amber-700 font-bold' : 'text-gray-500 hover:text-gray-900'
              }`
            }
          >
            <Store className="w-5 h-5 mb-0.5" />
            <span>Portal</span>
          </NavLink>
        ) : role === 'rider' ? (
          <NavLink
            to="/rider"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full text-[10px] font-medium transition-colors ${
                isActive ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'
              }`
            }
          >
            <Bike className="w-5 h-5 mb-0.5" />
            <span>Rider</span>
          </NavLink>
        ) : role === 'admin' ? (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full text-[10px] font-medium transition-colors ${
                isActive ? 'text-purple-700 font-bold' : 'text-gray-500 hover:text-gray-900'
              }`
            }
          >
            <Shield className="w-5 h-5 mb-0.5" />
            <span>Admin</span>
          </NavLink>
        ) : (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full text-[10px] font-medium transition-colors ${
                isActive ? 'text-orange-600 font-bold' : 'text-gray-500 hover:text-gray-900'
              }`
            }
          >
            <User className="w-5 h-5 mb-0.5" />
            <span>Profile</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
};
