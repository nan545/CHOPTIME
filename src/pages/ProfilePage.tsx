import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  Store,
  Bike,
  LogOut,
  Check,
  Edit2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { UserRole } from '../types';

export const ProfilePage: React.FC = () => {
  const { profile, role, setDemoRole, updateProfile, signInWithGoogle, signOut, currentUser } =
    useAuth();
  const { savedAddresses } = useCart();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.displayName || '');
  const [phone, setPhone] = useState(profile?.phoneNumber || '');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      displayName: name.trim(),
      phoneNumber: phone.trim(),
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-950">Account Profile</h1>
          <p className="text-xs text-gray-500">Manage your profile details and settings</p>
        </div>

        {/* User Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={
                  profile?.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop'
                }
                alt={profile?.displayName}
                className="w-16 h-16 rounded-full object-cover border-2 border-orange-500"
              />
              <div>
                <h3 className="text-base font-bold text-gray-950">{profile?.displayName}</h3>
                <span className="text-xs text-gray-500">{profile?.email}</span>
                <div className="mt-1">
                  <span className="text-[10px] font-bold uppercase bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md">
                    {role} account
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          {/* Edit Profile Form */}
          {isEditing && (
            <form
              onSubmit={handleSaveProfile}
              className="pt-4 border-t border-gray-100 space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-gray-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-gray-500 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-orange-600 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Saved Addresses */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-600" />
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Saved Delivery Addresses
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            {savedAddresses.map((addr) => (
              <div
                key={addr.id}
                className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-start justify-between"
              >
                <div>
                  <span className="font-bold text-gray-900 block">{addr.title}</span>
                  <span className="text-gray-600 block">{addr.streetAddress}, {addr.area}</span>
                  {addr.digitalAddress && (
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                      GPS: {addr.digitalAddress}
                    </span>
                  )}
                </div>
                {addr.isDefault && (
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                    Default
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Role Switcher Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Quick Multi-Role Perspective
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Test and evaluate the food delivery platform from each user perspective.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
            <button
              onClick={() => setDemoRole('customer')}
              className={`p-3 rounded-xl border text-center transition-all ${
                role === 'customer'
                  ? 'border-orange-600 bg-orange-50 text-orange-700 font-bold shadow-sm'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <User className="w-4 h-4 mx-auto mb-1 text-orange-600" />
              <span>Customer</span>
            </button>

            <button
              onClick={() => setDemoRole('restaurant')}
              className={`p-3 rounded-xl border text-center transition-all ${
                role === 'restaurant'
                  ? 'border-amber-700 bg-amber-50 text-amber-800 font-bold shadow-sm'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Store className="w-4 h-4 mx-auto mb-1 text-amber-700" />
              <span>Restaurant</span>
            </button>

            <button
              onClick={() => setDemoRole('rider')}
              className={`p-3 rounded-xl border text-center transition-all ${
                role === 'rider'
                  ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-sm'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Bike className="w-4 h-4 mx-auto mb-1 text-blue-600" />
              <span>Rider</span>
            </button>

            <button
              onClick={() => setDemoRole('admin')}
              className={`p-3 rounded-xl border text-center transition-all ${
                role === 'admin'
                  ? 'border-purple-700 bg-purple-50 text-purple-800 font-bold shadow-sm'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Shield className="w-4 h-4 mx-auto mb-1 text-purple-700" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Authentication Controls */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-gray-900">Account Access</h4>
            <p className="text-[11px] text-gray-500">
              {currentUser ? `Signed in as ${currentUser.email}` : 'Signed in as Demo User'}
            </p>
          </div>

          {currentUser ? (
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-50"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign in with Google</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
