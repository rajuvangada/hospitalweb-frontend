import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Loader2, Database, ShieldCheck, MapPin } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  // Checkout Form State
  const [deliveryData, setDeliveryData] = useState({
    address: '',
    phone: '',
    notes: ''
  });

  const loadCart = () => {
    try {
      const items = JSON.parse(localStorage.getItem('medicine_cart') || '[]');
      setCartItems(items);
    } catch (e) {
      setCartItems([]);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQty = (itemId, change) => {
    const updated = cartItems.map(item => {
      if (item.id === itemId) {
        const newQty = (item.quantity || 1) + change;
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }).filter(item => item.quantity > 0);

    setCartItems(updated);
    localStorage.setItem('medicine_cart', JSON.stringify(updated));
  };

  const handleRemoveItem = (itemId) => {
    const filtered = cartItems.filter(item => item.id !== itemId);
    setCartItems(filtered);
    localStorage.setItem('medicine_cart', JSON.stringify(filtered));
    toast.success("Removed formulation from cart");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryData(prev => ({ ...prev, [name]: value }));
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% sales tax
  const delivery = subtotal > 30 ? 0 : 3.99; // Free over $30
  const grandTotal = subtotal > 0 ? (subtotal + tax + delivery) : 0;

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setCheckoutLoading(true);
    const checkoutToastId = toast.loading("Processing clinical pharmacy order...");

    setTimeout(() => {
      try {
        const userStored = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Add transaction ledger to localStorage 'revenue' to sync with admin/dashboard invoices
        const revenueLedger = JSON.parse(localStorage.getItem('revenue') || '[]');
        const invoiceId = `inv-${Math.floor(1000 + Math.random() * 9000)}`;
        
        revenueLedger.push({
          id: invoiceId,
          patientName: userStored.name || "Patient Customer",
          date: new Date().toISOString().split('T')[0],
          department: "Pharmacy Order",
          amount: Math.round(grandTotal),
          status: "Pending" // Simulated outstanding balance
        });
        localStorage.setItem('revenue', JSON.stringify(revenueLedger));

        // Clear cart
        localStorage.removeItem('medicine_cart');
        setCartItems([]);
        
        toast.success(`Checkout complete! Order settled as invoice ${invoiceId}.`, { id: checkoutToastId });
        navigate('/patient/dashboard');
      } catch (err) {
        toast.error("Checkout failed, please try again", { id: checkoutToastId });
      } finally {
        setCheckoutLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="space-y-6 text-left font-sans animate-in fade-in-30">
      
      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#111827] font-display">Medicine Cart</h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Review ordered prescriptions, quantities, and dispatch details.</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="p-16 border border-dashed border-[#E6E1DA] rounded-3xl text-center text-xs font-bold text-slate-400 flex flex-col items-center gap-4 bg-white max-w-md mx-auto">
          <ShoppingCart className="w-12 h-12 text-slate-350" />
          <span>Your cart is empty.</span>
          <Link 
            to="/patient/medicines" 
            className="px-5 py-2.5 bg-[#EA580C] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            Browse Formulations <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Side: Cart Items Table (2/3 width) */}
          <div className="lg:col-span-8 bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-[#111827] border-b border-[#E6E1DA] pb-2 font-display">
              Cart Items
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E6E1DA] text-slate-400 font-extrabold uppercase tracking-widest text-[9px] pb-2">
                    <th className="py-2.5">Formulation</th>
                    <th className="py-2.5">Category</th>
                    <th className="py-2.5">Price</th>
                    <th className="py-2.5 text-center">Quantity</th>
                    <th className="py-2.5 text-right">Subtotal</th>
                    <th className="py-2.5 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-655">
                  {cartItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 font-bold text-[#111827]">{item.name}</td>
                      <td className="py-3.5">
                        <span className="text-[8px] bg-[#EA580C]/10 text-[#EA580C] px-2 py-0.5 rounded-md uppercase tracking-wider font-extrabold">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5">${item.price.toFixed(2)}</td>
                      <td className="py-3.5">
                        <div className="flex items-center justify-center gap-2 max-w-[90px] mx-auto bg-slate-50 border border-[#E6E1DA] rounded-lg p-1.5">
                          <button 
                            onClick={() => handleUpdateQty(item.id, -1)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-extrabold text-slate-800 text-[11px]">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateQty(item.id, 1)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 text-right font-black text-slate-800">${(item.price * item.quantity).toFixed(2)}</td>
                      <td className="py-3.5 text-center">
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Side: Order Summary & Simulated Checkout (1/3 width) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Price Calculations */}
            <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider border-b border-[#E6E1DA] pb-2 font-display">
                Order Summary
              </h3>
              <div className="space-y-3.5 text-xs font-semibold text-slate-500">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span className="font-bold text-slate-850">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sales Tax (8%)</span>
                  <span className="font-bold text-slate-850">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery fee</span>
                  <span className="font-bold text-slate-850">
                    {delivery === 0 ? "Free" : `$${delivery.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-[#E6E1DA] pt-3.5 flex justify-between text-[#111827] font-black text-sm">
                  <span>Total Due</span>
                  <span className="text-[#EA580C]">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Details Checkout Form */}
            <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider border-b border-[#E6E1DA] pb-2 mb-4 font-display">
                Delivery Details
              </h3>
              <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs font-semibold text-slate-600">
                
                {/* Shipping address */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Shipping Address</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#EA580C] transition-colors">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      name="address"
                      required
                      value={deliveryData.address}
                      onChange={handleInputChange}
                      placeholder="123 Hospital Lane, Apt 4B"
                      className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Contact Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={deliveryData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 012-3456"
                    className="w-full h-11 px-4 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Delivery Instructions</label>
                  <textarea
                    name="notes"
                    rows="2"
                    value={deliveryData.notes}
                    onChange={handleInputChange}
                    placeholder="Leave with receptionist, ring bell, etc."
                    className="w-full p-3 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20"
                  />
                </div>

                {/* Checkout Trigger */}
                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full h-11 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 uppercase tracking-wider text-[10px] cursor-pointer transition-all shadow-md shadow-[#EA580C]/25 disabled:opacity-50 mt-4"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4.5 h-4.5" /> Confirm Order
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
