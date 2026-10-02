import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UtensilsCrossed } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 400); // Allow fade out animation
    }, 1400);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950 text-white"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center"
          >
            {/* Logo */}
            <div className="w-20 h-20 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-950/40 mb-5">
              <UtensilsCrossed className="w-10 h-10 text-white" />
            </div>

            {/* App Name */}
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
              ChopTime <span className="text-orange-500">Ghana</span>
            </h1>

            {/* Tagline */}
            <p className="text-sm text-gray-400 font-medium">
              Accra & Kumasi’s Food Delivery Platform
            </p>

            {/* Loading indicator */}
            <div className="mt-8 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse delay-150"></span>
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse delay-300"></span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
