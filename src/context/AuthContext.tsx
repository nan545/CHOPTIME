import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import { getUserProfile, saveUserProfile, seedDatabaseIfEmpty } from '../lib/db';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  profile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setDemoRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  customer: {
    uid: 'demo-customer-kwame',
    email: 'kwame.mensah@example.com',
    displayName: 'Kwame Mensah',
    phoneNumber: '+233 24 123 4567',
    role: 'customer',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces',
    createdAt: new Date().toISOString(),
  },
  restaurant: {
    uid: 'owner-buka',
    email: 'manager@bukarestaurant.com.gh',
    displayName: "Buka Restaurant Osu",
    phoneNumber: '+233 30 277 1234',
    role: 'restaurant',
    restaurantId: 'rest-buka-osu',
    avatarUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&h=150&fit=crop',
    createdAt: new Date().toISOString(),
  },
  rider: {
    uid: 'demo-rider-kofi',
    email: 'kofi.boateng.rider@example.com',
    displayName: 'Kofi Boateng',
    phoneNumber: '+233 55 987 6543',
    role: 'rider',
    vehicleType: 'Honda Ace 125 (Delivery Box #42)',
    licenseNumber: 'GH-M-2024-8842',
    riderApprovalStatus: 'approved',
    isOnline: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    createdAt: new Date().toISOString(),
  },
  admin: {
    uid: 'demo-admin-system',
    email: 'nharnharquophi19@gmail.com',
    displayName: 'Platform Admin',
    phoneNumber: '+233 20 000 1122',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    createdAt: new Date().toISOString(),
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('choptime_active_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEMO_PROFILES.customer;
      }
    }
    return DEMO_PROFILES.customer;
  });
  const [role, setRole] = useState<UserRole>(() => profile?.role || 'customer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seed database on app start
    seedDatabaseIfEmpty();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          let userProf = await getUserProfile(user.uid);
          if (!userProf) {
            // Assign admin role if email matches
            const userRole: UserRole =
              user.email === 'nharnharquophi19@gmail.com' ? 'admin' : 'customer';

            userProf = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'ChopTime User',
              phoneNumber: user.phoneNumber || '',
              avatarUrl: user.photoURL || '',
              role: userRole,
              createdAt: new Date().toISOString(),
            };
            await saveUserProfile(userProf);
          }
          setProfile(userProf);
          setRole(userProf.role);
          localStorage.setItem('choptime_active_profile', JSON.stringify(userProf));
        } catch (err) {
          console.error('Error loading user profile:', err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      console.error('Google Sign In failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      setProfile(DEMO_PROFILES.customer);
      setRole('customer');
      localStorage.removeItem('choptime_active_profile');
    } catch (error) {
      console.error('Sign Out failed:', error);
    }
  };

  const setDemoRole = (newRole: UserRole) => {
    const newProf = DEMO_PROFILES[newRole];
    setProfile(newProf);
    setRole(newRole);
    localStorage.setItem('choptime_active_profile', JSON.stringify(newProf));
    saveUserProfile(newProf).catch(console.error);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    setProfile(updated);
    setRole(updated.role);
    localStorage.setItem('choptime_active_profile', JSON.stringify(updated));
    await saveUserProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        role,
        loading,
        signInWithGoogle,
        signOut,
        setDemoRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
