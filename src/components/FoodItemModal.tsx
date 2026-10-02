import React, { useState } from 'react';
import { X, Plus, Minus, Check, ShoppingBag } from 'lucide-react';
import { FoodItem, CartItem, Restaurant } from '../types';
import { useCart } from '../context/CartContext';

interface FoodItemModalProps {
  item: FoodItem;
  restaurant: Restaurant;
  onClose: () => void;
}

export const FoodItemModal: React.FC<FoodItemModalProps> = ({ item, restaurant, onClose }) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<{ [optionName: string]: string }>(() => {
    const initial: { [optionName: string]: string } = {};
    if (item.options) {
      item.options.forEach((opt) => {
        if (opt.choices.length > 0) {
          initial[opt.name] = opt.choices[0].label;
        }
      });
    }
    return initial;
  });

  const [selectedAddons, setSelectedAddons] = useState<{ name: string; price: number }[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Calculate total item price
  let optionsExtra = 0;
  if (item.options) {
    item.options.forEach((opt) => {
      const chosenLabel = selectedOptions[opt.name];
      const match = opt.choices.find((c) => c.label === chosenLabel);
      if (match) {
        optionsExtra += match.extraPrice;
      }
    });
  }

  const addonsExtra = selectedAddons.reduce((acc, curr) => acc + curr.price, 0);
  const unitPrice = item.price + optionsExtra + addonsExtra;
  const totalPrice = unitPrice * quantity;

  const toggleAddon = (addon: { name: string; price: number }) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.name === addon.name);
      if (exists) {
        return prev.filter((a) => a.name !== addon.name);
      } else {
        return [...prev, addon];
      }
    });
  };

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}`,
      foodItemId: item.id,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      name: item.name,
      price: item.price,
      quantity,
      selectedOptions,
      selectedAddons,
      specialInstructions: specialInstructions.trim() || undefined,
      itemTotalPrice: unitPrice,
      imageUrl: item.imageUrl,
    };

    const success = addItem(cartItem, {
      id: restaurant.id,
      name: restaurant.name,
      deliveryFee: restaurant.deliveryFee,
    });

    if (success) {
      setAddedSuccess(true);
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]">
        {/* Header Image */}
        <div className="relative h-48 w-full bg-gray-100 shrink-0">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 text-gray-700 hover:text-gray-900 flex items-center justify-center shadow-md transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-3 bg-gray-950/80 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
            {restaurant.name}
          </div>
        </div>

        {/* Scrollable details */}
        <div className="p-5 overflow-y-auto flex-1 divide-y divide-gray-100 space-y-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold text-gray-950">{item.name}</h2>
              <span className="text-lg font-extrabold text-orange-600 shrink-0">
                GH₵ {item.price.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Options (e.g. Protein choice / Rice style) */}
          {item.options &&
            item.options.map((opt) => (
              <div key={opt.name} className="pt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    {opt.name}
                  </label>
                  {opt.required && (
                    <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                      Required
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  {opt.choices.map((choice) => (
                    <label
                      key={choice.label}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        selectedOptions[opt.name] === choice.label
                          ? 'border-orange-600 bg-orange-50/50 text-gray-900 font-semibold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name={opt.name}
                          checked={selectedOptions[opt.name] === choice.label}
                          onChange={() =>
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [opt.name]: choice.label,
                            }))
                          }
                          className="text-orange-600 focus:ring-orange-500"
                        />
                        <span>{choice.label}</span>
                      </div>
                      {choice.extraPrice > 0 && (
                        <span className="text-gray-500 font-medium">
                          +GH₵ {choice.extraPrice.toFixed(2)}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}

          {/* Add-ons (e.g. Extra fried plantain, boiled egg, shito jar) */}
          {item.addons && item.addons.length > 0 && (
            <div className="pt-3">
              <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block mb-2">
                Ghanaian Extras & Add-ons
              </label>
              <div className="space-y-1.5">
                {item.addons.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.name === addon.name);
                  return (
                    <label
                      key={addon.name}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-orange-600 bg-orange-50/50 text-gray-900 font-semibold'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAddon(addon)}
                          className="rounded text-orange-600 focus:ring-orange-500"
                        />
                        <span>{addon.name}</span>
                      </div>
                      <span className="text-orange-600 font-medium">
                        +GH₵ {addon.price.toFixed(2)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Kitchen Instructions */}
          <div className="pt-3">
            <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block mb-1.5">
              Special Kitchen Instructions
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Please put extra shito in a separate cup, pack cutlery..."
              rows={2}
              className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600"
            />
          </div>
        </div>

        {/* Footer controls: Quantity + Add to Cart Button */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center gap-3 shrink-0">
          <div className="flex items-center border border-gray-200 bg-white rounded-xl shadow-sm">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="p-2.5 text-gray-600 hover:text-gray-900 disabled:opacity-30 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-gray-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-2.5 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={addedSuccess}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white text-xs font-bold shadow-md transition-all ${
              addedSuccess
                ? 'bg-emerald-600'
                : 'bg-orange-600 hover:bg-orange-700 active:scale-[0.98]'
            }`}
          >
            {addedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Order • GH₵ {totalPrice.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
