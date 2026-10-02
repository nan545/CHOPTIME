/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { SplashScreen } from './components/SplashScreen';
import { OnboardingModal } from './components/OnboardingModal';

// Pages
import { CustomerHome } from './pages/CustomerHome';
import { SearchPage } from './pages/SearchPage';
import { RestaurantDetailPage } from './pages/RestaurantDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { RestaurantDashboard } from './pages/RestaurantDashboard';
import { RiderDashboard } from './pages/RiderDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Osu, Accra');

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('choptime_onboarding_completed');
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

          {showOnboarding && !showSplash && (
            <OnboardingModal onFinish={() => setShowOnboarding(false)} />
          )}

          <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
            <Navbar
              currentLocation={currentLocation}
              onLocationChange={setCurrentLocation}
            />

            <main className="flex-1">
              <Routes>
                <Route path="/" element={<CustomerHome />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order/:id" element={<OrderTrackingPage />} />
                <Route path="/orders" element={<OrderHistoryPage />} />
                <Route path="/restaurant" element={<RestaurantDashboard />} />
                <Route path="/rider" element={<RiderDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <BottomNav />
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
