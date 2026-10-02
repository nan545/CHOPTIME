import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Phone,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Check,
  Plus,
  AlertCircle,
  Clock,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../lib/db';
import { Order, PaymentMethod, DeliveryAddress } from '../types';

export const CheckoutPage: React.FC = () => {
  const {
    items,
    restaurant,
    subtotal,
    deliveryFee,
    serviceFee,
    discount,
    total,
    coupon,
    selectedAddress,
    setSelectedAddress,
    savedAddresses,
    addSavedAddress,
    clearCart,
  } = useCart();

  const { profile } = useAuth();
  const navigate = useNavigate();

  // Contact & Delivery state
  const [customerPhone, setCustomerPhone] = useState(profile?.phoneNumber || '024 123 4567');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentGateway, setPaymentGateway] = useState<'hubtel' | 'paystack'>('hubtel');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('momo_mtn');

  // Address modal state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newTitle, setNewTitle] = useState('My Residence');
  const [newStreet, setNewStreet] = useState('');
  const [newArea, setNewArea] = useState('Osu, Accra');
  const [newDigitalAddress, setNewDigitalAddress] = useState('GA-030-');

  // Payment processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const [momoPromptOpen, setMomoPromptOpen] = useState(false);
  const [momoPin, setMomoPin] = useState('');

  if (items.length === 0 || !restaurant) {
    navigate('/cart');
    return null;
  }

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim()) return;
    const newAddr: DeliveryAddress = {
      id: `addr-${Date.now()}`,
      title: newTitle,
      streetAddress: newStreet,
      area: newArea,
      digitalAddress: newDigitalAddress,
      isDefault: false,
    };
    addSavedAddress(newAddr);
    setShowAddAddress(false);
  };

  const handlePlaceOrder = async () => {
    if (!customerPhone.trim()) {
      alert('Please enter a valid Ghana phone number so the delivery rider can reach you.');
      return;
    }

    setIsProcessing(true);
    const gatewayName = paymentGateway === 'hubtel' ? 'Hubtel Merchant Gateway' : 'Paystack Ghana';
    setProcessingStep(`Connecting to ${gatewayName}...`);

    // Simulate real payment provider roundtrip
    if (paymentMethod.startsWith('momo_')) {
      // Show MoMo authorization prompt
      setTimeout(() => {
        setProcessingStep(`Sending ${paymentGateway === 'hubtel' ? 'Hubtel' : 'Paystack'} MoMo prompt to ` + customerPhone);
        setMomoPromptOpen(true);
      }, 700);
      return;
    } else {
      // Card / Cash
      const prefix = paymentGateway === 'hubtel' ? 'TX-HUBTEL-' : 'TX-PAYSTACK-';
      finalizeOrder(prefix + Math.floor(100000 + Math.random() * 900000));
    }
  };

  const finalizeOrder = async (reference: string) => {
    const gatewayLabel = paymentGateway === 'hubtel' ? 'Hubtel Ghana API' : 'Paystack Ghana';
    setProcessingStep(`Verifying transaction via ${gatewayLabel} & recording order in database...`);

    const orderId = `ord-${Date.now()}`;
    const orderNumber = `${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: profile?.uid || 'guest-customer',
      customerName: profile?.displayName || 'Customer',
      customerPhone,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantAddress: '10th Street, Osu, Accra',
      restaurantPhone: '+233 30 277 1234',
      items,
      subtotal,
      deliveryFee,
      serviceFee,
      discount,
      total,
      status: 'CONFIRMED',
      paymentMethod,
      paymentStatus: 'SUCCESS',
      paymentReference: reference,
      deliveryAddress: `${selectedAddress.streetAddress}, ${selectedAddress.area}`,
      digitalAddress: selectedAddress.digitalAddress || '',
      deliveryNotes: deliveryNotes.trim() || '',
      couponCode: coupon?.code || '',
      timeline: [
        {
          status: 'PAID',
          label: `Payment Verified via ${gatewayLabel}`,
          timestamp: new Date().toISOString(),
          note: `Ref: ${reference}`,
        },
        {
          status: 'CONFIRMED',
          label: 'Order Confirmed by Restaurant',
          timestamp: new Date().toISOString(),
          note: `${restaurant.name} kitchen has queued your order`,
        },
      ],
      estimatedDeliveryTime: '30–45 mins',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await createOrder(newOrder);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      clearCart();
      setIsProcessing(false);
      setMomoPromptOpen(false);
      navigate(`/order/${orderId}`);
    } catch (err) {
      console.error('Failed to create order:', err);
      alert('Order creation failed. Please check connection and try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-950">Secure Checkout</h1>
          <p className="text-xs text-gray-500">
            Confirm your delivery address and payment for {restaurant.name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            {/* Step 1: Delivery Address */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </div>
                  <h3 className="text-sm font-bold text-gray-950">Delivery Address</h3>
                </div>
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New</span>
                </button>
              </div>

              {/* Saved Address Cards */}
              <div className="space-y-2">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between ${
                      selectedAddress.id === addr.id
                        ? 'border-orange-600 bg-orange-50/40 shadow-sm'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        checked={selectedAddress.id === addr.id}
                        onChange={() => setSelectedAddress(addr)}
                        className="mt-0.5 text-orange-600 focus:ring-orange-500"
                      />
                      <div>
                        <span className="font-bold text-gray-900 block">{addr.title}</span>
                        <span className="text-gray-600 block mt-0.5">{addr.streetAddress}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-500 font-medium">{addr.area}</span>
                          {addr.digitalAddress && (
                            <span className="bg-gray-100 text-gray-700 font-mono text-[10px] px-1.5 py-0.5 rounded border border-gray-200">
                              {addr.digitalAddress}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedAddress.id === addr.id && (
                      <Check className="w-4 h-4 text-orange-600 shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              {/* Add Address Form Modal */}
              {showAddAddress && (
                <form
                  onSubmit={handleAddNewAddress}
                  className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 animate-in fade-in duration-150"
                >
                  <h4 className="text-xs font-bold text-gray-900">Add New Ghana Delivery Address</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1 font-semibold">
                        Label (e.g. Home, Office)
                      </label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1 font-semibold">
                        Area / Neighborhood
                      </label>
                      <input
                        type="text"
                        value={newArea}
                        onChange={(e) => setNewArea(e.target.value)}
                        placeholder="Osu, East Legon..."
                        className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="text-xs">
                    <label className="text-[10px] text-gray-500 block mb-1 font-semibold">
                      Street & House Number
                    </label>
                    <input
                      type="text"
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      placeholder="House 22, Ring Road Central..."
                      className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                      required
                    />
                  </div>
                  <div className="text-xs">
                    <label className="text-[10px] text-gray-500 block mb-1 font-semibold">
                      Ghana Post GPS Digital Address (Optional)
                    </label>
                    <input
                      type="text"
                      value={newDigitalAddress}
                      onChange={(e) => setNewDigitalAddress(e.target.value)}
                      placeholder="GA-030-4921"
                      className="w-full p-2 border border-gray-200 rounded-lg bg-white font-mono uppercase"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="text-xs text-gray-500 px-3 py-1.5 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="text-xs font-bold bg-orange-600 text-white px-4 py-1.5 rounded-lg shadow-sm"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Step 2: Contact Phone & Rider Notes */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">
                  2
                </div>
                <h3 className="text-sm font-bold text-gray-950">Contact & Delivery Notes</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    Ghana Phone Number (For Rider & MoMo)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="024 123 4567"
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 font-mono text-sm"
                    required
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Our rider will call this number upon arriving at your gate.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    Delivery Instructions for Rider (Optional)
                  </label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Ring the bell at the black gate, don't honk..."
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method Selection */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </div>
                  <h3 className="text-sm font-bold text-gray-950">Payment Gateway & Method</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentGateway('hubtel')}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                      paymentGateway === 'hubtel'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Hubtel Ghana (0% Setup Fee)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentGateway('paystack')}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                      paymentGateway === 'paystack'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Paystack
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">Active Processor:</span>
                  <span className="font-bold text-gray-900">
                    {paymentGateway === 'hubtel' ? 'Hubtel Merchant Direct Gateway (Accra)' : 'Paystack Payments (Ghana)'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0 self-start sm:self-auto">
                  ✓ Interactive Mode (No API keys required)
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {/* MTN Mobile Money */}
                <label
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'momo_mtn'
                      ? 'border-orange-600 bg-orange-50/40 shadow-sm font-bold text-gray-950'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'momo_mtn'}
                      onChange={() => setPaymentMethod('momo_mtn')}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <div className="w-8 h-8 rounded-lg bg-yellow-400 text-black font-black text-[10px] flex items-center justify-center shrink-0 shadow-sm">
                      MTN
                    </div>
                    <div>
                      <span>MTN Mobile Money</span>
                      <span className="block text-[11px] font-normal text-gray-500">
                        Instant prompt to your MoMo wallet
                      </span>
                    </div>
                  </div>
                  <Smartphone className="w-4 h-4 text-gray-400" />
                </label>

                {/* Telecel Cash / Vodafone Cash */}
                <label
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'momo_vodafone'
                      ? 'border-orange-600 bg-orange-50/40 shadow-sm font-bold text-gray-950'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'momo_vodafone'}
                      onChange={() => setPaymentMethod('momo_vodafone')}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-sm">
                      TEL
                    </div>
                    <div>
                      <span>Telecel Cash (Vodafone)</span>
                      <span className="block text-[11px] font-normal text-gray-500">
                        Authorize with your Telecel Cash voucher
                      </span>
                    </div>
                  </div>
                  <Smartphone className="w-4 h-4 text-gray-400" />
                </label>

                {/* AT Money */}
                <label
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'momo_airteltigo'
                      ? 'border-orange-600 bg-orange-50/40 shadow-sm font-bold text-gray-950'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'momo_airteltigo'}
                      onChange={() => setPaymentMethod('momo_airteltigo')}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-sm">
                      AT
                    </div>
                    <div>
                      <span>AT Money (AirtelTigo)</span>
                      <span className="block text-[11px] font-normal text-gray-500">
                        Fast and secure wallet deduction
                      </span>
                    </div>
                  </div>
                  <Smartphone className="w-4 h-4 text-gray-400" />
                </label>

                {/* Credit / Debit Card */}
                <label
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-orange-600 bg-orange-50/40 shadow-sm font-bold text-gray-950'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <div className="w-8 h-8 rounded-lg bg-gray-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      CARD
                    </div>
                    <div>
                      <span>Debit / Credit Card</span>
                      <span className="block text-[11px] font-normal text-gray-500">
                        Visa, Mastercard & GhIPSS Gh-link
                      </span>
                    </div>
                  </div>
                  <CreditCard className="w-4 h-4 text-gray-400" />
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'cash_on_delivery'
                      ? 'border-orange-600 bg-orange-50/40 shadow-sm font-bold text-gray-950'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={() => setPaymentMethod('cash_on_delivery')}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      CASH
                    </div>
                    <div>
                      <span>Cash on Delivery</span>
                      <span className="block text-[11px] font-normal text-gray-500">
                        Pay exact cash to rider upon arrival
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Confirmation Box */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">
                Order Review
              </h3>

              <div className="space-y-2 text-xs">
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between items-start text-gray-700">
                    <span className="truncate pr-2">
                      {i.quantity}x {i.name}
                    </span>
                    <span className="font-semibold text-gray-900 shrink-0">
                      GH₵ {(i.itemTotalPrice * i.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">GH₵ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-gray-900">GH₵ {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span className="font-semibold text-gray-900">GH₵ {serviceFee.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon ({coupon?.code})</span>
                    <span>-GH₵ {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100 flex justify-between items-baseline">
                  <span className="text-sm font-extrabold text-gray-950">Grand Total</span>
                  <span className="text-xl font-black text-orange-600">
                    GH₵ {total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Pay & Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-[0.99]"
              >
                {isProcessing ? (
                  <span>Processing Payment...</span>
                ) : (
                  <>
                    <span>Confirm & Pay GH₵ {total.toFixed(2)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MoMo Authorization Simulator Modal */}
      {momoPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-gray-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-yellow-400 text-black mx-auto flex items-center justify-center font-black text-lg shadow-md">
              MoMo
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-950">
                Authorize Payment of GH₵ {total.toFixed(2)}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Prompt sent via <span className="font-bold text-gray-800">{paymentGateway === 'hubtel' ? 'Hubtel Merchant Direct' : 'Paystack Ghana'}</span> to <span className="font-mono font-bold text-gray-800">{customerPhone}</span>.
              </p>
            </div>

            <div className={`p-3 rounded-xl text-left text-xs space-y-1 border ${
              paymentGateway === 'hubtel'
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-yellow-50 border-yellow-200 text-yellow-900'
            }`}>
              <div className="font-bold flex items-center gap-1">
                <AlertCircle className={`w-3.5 h-3.5 ${paymentGateway === 'hubtel' ? 'text-blue-700' : 'text-yellow-700'}`} />
                <span>{paymentGateway === 'hubtel' ? 'Hubtel Ghana Direct Receive' : 'Paystack MoMo Simulation'}</span>
              </div>
              <p className={`text-[11px] ${paymentGateway === 'hubtel' ? 'text-blue-800' : 'text-yellow-800'}`}>
                {paymentGateway === 'hubtel'
                  ? 'Hubtel sends a direct network push prompt directly to MTN, Telecel, or AT subscribers with 0% setup fee. Enter your 4-digit PIN to authorize:'
                  : 'In production, Paystack issues a USSD prompt directly to the subscriber’s SIM. Enter your 4-digit PIN below to authorize:'}
              </p>
            </div>

            <div>
              <input
                type="password"
                maxLength={4}
                value={momoPin}
                onChange={(e) => setMomoPin(e.target.value)}
                placeholder="• • • •"
                className="w-32 mx-auto text-center tracking-widest text-lg font-black p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                autoFocus
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setMomoPromptOpen(false);
                  setIsProcessing(false);
                }}
                className="flex-1 text-xs text-gray-600 hover:text-gray-900 py-2.5 rounded-xl border border-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  finalizeOrder('TX-MOMO-' + Math.floor(100000 + Math.random() * 900000))
                }
                className="flex-1 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-xl shadow-md"
              >
                Approve Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
