import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Utensils, Sliders, MapPin, ArrowRight, Check } from 'lucide-react';

interface OnboardingModalProps {
  onFinish: () => void;
}

const ONBOARDING_STEPS = [
  {
    icon: Utensils,
    title: 'Discover Authentic Local Flavors',
    description:
      'From sizzling firewood Jollof in Osu to legendary Auntie Muni Waakye in Labone and Kumasi favorites, order the meals you love.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=500&fit=crop',
    tag: 'Accra & Kumasi Restaurants',
  },
  {
    icon: Sliders,
    title: 'Customize Your Order Your Way',
    description:
      'Select your proteins, add extra black shito, plantain (dodo), fried wele, or boiled eggs with zero hassle.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=500&fit=crop',
    tag: 'Full Customization & Add-ons',
  },
  {
    icon: MapPin,
    title: 'Real-Time Live Delivery Tracking',
    description:
      'Watch your delivery dispatch from the restaurant kitchen straight to your gate with live rider status updates.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=500&fit=crop',
    tag: 'Instant Mobile Money & Card',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('choptime_onboarding_completed', 'true');
    onFinish();
  };

  const step = ONBOARDING_STEPS[currentStep];
  const IconComponent = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
      >
        {/* Step Image */}
        <div className="relative h-56 w-full bg-gray-900 overflow-hidden">
          <img
            src={step.image}
            alt={step.title}
            className="w-full h-full object-cover opacity-85 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent" />
          <div className="absolute top-4 left-4 bg-orange-600/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {step.tag}
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-xl bg-orange-600/90 flex items-center justify-center shrink-0 shadow-md">
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold leading-tight">{step.title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {ONBOARDING_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 transition-all rounded-full ${
                  idx === currentStep ? 'w-8 bg-orange-600' : 'w-2 bg-gray-300'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
            <button
              onClick={handleComplete}
              className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors py-2 px-3"
            >
              Skip
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold py-2.5 px-5 rounded-xl shadow-md transition-colors"
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? (
                <>
                  <span>Get Started</span>
                  <Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
