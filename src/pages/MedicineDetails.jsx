import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthAppContext';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, ShieldAlert, PhoneCall, Mail, MapPin, 
  ChevronDown, LogOut, Loader2, ShoppingCart, Award, Clock
} from 'lucide-react';

export default function MedicineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  // Fallback details if database item is missing or backend offline
  const mockDetails = {
    "med-1": { name: "Paracetamol 650mg", category: "Analgesic", price: 4.99, availability: true, dosage: "Take 1 tablet every 6 hours as needed for fever or pain.", manufacturer: "CareLink Labs Inc.", sideEffects: "Mild nausea, skin rash (rare).", instructions: "Keep out of reach of children. Store below 25°C." },
    "med-2": { name: "Amoxicillin 500mg", category: "Antibiotic", price: 12.50, availability: true, dosage: "1 capsule three times a day for 7-10 days.", manufacturer: "BioPharma Pharmaceuticals", sideEffects: "Diarrhea, stomach upset.", instructions: "Complete the entire course." },
    "med-3": { name: "Ibuprofen 400mg", category: "Anti-inflammatory", price: 6.20, availability: true, dosage: "Take 1 tablet with meals or milk every 8 hours.", manufacturer: "NovaHealth Diagnostics", sideEffects: "Acid reflux, stomach pain.", instructions: "Take with food." },
    "med-4": { name: "Cetirizine 10mg", category: "Antihistamine", price: 5.40, availability: true, dosage: "Take 1 tablet once daily in the evening.", manufacturer: "SinoRx Formulations", sideEffects: "Dry mouth, light fatigue.", instructions: "Avoid operating heavy machinery if drowsy." }
  };

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const res = await api.get(`/medicines/${id}`);
        // Enrich
        const fallback = mockDetails[id] || Object.values(mockDetails)[0];
        setMedicine({
          ...res.data,
          dosage: res.data.dosage || fallback.dosage,
          manufacturer: res.data.manufacturer || fallback.manufacturer,
          sideEffects: res.data.sideEffects || fallback.sideEffects,
          instructions: res.data.instructions || fallback.instructions
        });
      } catch (err) {
        console.warn("Medicine details API offline, loading mock fallback:", err.message);
        const fallback = mockDetails[id] || Object.values(mockDetails)[0];
        setMedicine({
          id,
          ...fallback
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMedicine();
  }, [id]);

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully!");
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    return `/${user.role}/dashboard`;
  };

  const handleAddToCart = () => {
    if (!medicine) return;
    try {
      const cart = JSON.parse(localStorage.getItem('medicine_cart') || '[]');
      const existingIdx = cart.findIndex(item => item.id === medicine.id || item._id === medicine.id);
      
      if (existingIdx > -1) {
        cart[existingIdx].quantity = (cart[existingIdx].quantity || 1) + 1;
      } else {
        cart.push({
          id: medicine.id || medicine._id || id,
          name: medicine.name,
          category: medicine.category,
          price: medicine.price,
          quantity: 1
        });
      }
      
      localStorage.setItem('medicine_cart', JSON.stringify(cart));
      toast.success(`Added ${medicine.name} to cart!`);
    } catch (e) {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <div className="bg-[#F4F0EB] text-[#111827] min-h-screen flex flex-col font-sans">
      
      {/* Sticky Navbar */}
      <header className="sticky top-0 inset-x-0 bg-white/85 backdrop-blur-md border-b border-[#E6E1DA] z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#EA580C] flex items-center justify-center text-white shrink-0">
              <span className="font-extrabold text-xs">✦</span>
            </div>
            <span className="text-base font-bold tracking-tight text-[#111827] font-display">
              Care<span className="text-[#EA580C] font-extrabold">Link</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-100 hover:bg-slate-200 border border-[#E6E1DA] rounded-full transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-700">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-[#E6E1DA] shadow-xl z-50 flex flex-col py-2 animate-in fade-in-50">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                    </div>
                    <Link to={getDashboardPath()} className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold hover:bg-slate-50 text-slate-700 transition-colors">
                      <Activity className="w-4.5 h-4.5 text-slate-400" /> My Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold hover:bg-red-50 text-red-500 transition-colors text-left w-full mt-1 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-xs font-bold text-slate-700 px-4 py-2 hover:text-[#EA580C]">
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-6 py-12 flex-1 w-full flex flex-col justify-center text-left">
        <Link 
          to="/patient/medicines" 
          className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-[#EA580C] transition-colors mb-6 uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Browse Medicines
        </Link>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-[#EA580C]" />
            <span className="text-xs font-bold text-slate-500">Retrieving formulation details...</span>
          </div>
        ) : medicine ? (
          <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-xs font-semibold text-slate-655">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-44 h-44 bg-[#F4F0EB] rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border border-[#E6E1DA]">
                <span className="font-extrabold text-[#EA580C] text-2xl font-display uppercase">Rx</span>
              </div>
              <div className="space-y-3.5 flex-1 text-left">
                <span className="text-[9px] bg-[#EA580C]/10 text-[#EA580C] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
                  {medicine.category}
                </span>
                <h1 className="text-2xl font-black text-slate-900 leading-tight font-display">{medicine.name}</h1>
                <div className="pt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 font-display">${medicine.price}</span>
                  <span className="text-[9px] text-slate-450 font-bold uppercase">per unit</span>
                </div>
                <div className="pt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    medicine.availability ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {medicine.availability ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>

            {/* Medical details lists */}
            <div className="border-t border-[#E6E1DA] pt-6 space-y-4 text-left">
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Dosage Details</span>
                <p className="text-slate-500 mt-1 leading-relaxed">{medicine.dosage}</p>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Manufacturer Manufacturer</span>
                <p className="text-slate-500 mt-1">{medicine.manufacturer}</p>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Reported Side Effects</span>
                <p className="text-red-500/90 mt-1 leading-relaxed">{medicine.sideEffects}</p>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Instructions & Storage</span>
                <p className="text-slate-500 mt-1 leading-relaxed">{medicine.instructions}</p>
              </div>
            </div>

            {/* Cart Trigger Button */}
            <div className="pt-6 border-t border-[#E6E1DA]">
              <button
                onClick={handleAddToCart}
                disabled={!medicine.availability}
                className="w-full h-11 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider text-[10px] cursor-pointer shadow-md disabled:opacity-50 transition-all shadow-[#EA580C]/25"
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart Catalog
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#E6E1DA] rounded-3xl p-8 shadow-sm text-center flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-inner">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h2 className="text-base font-extrabold text-slate-900">No Data Available</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                This formulation registry is currently unavailable. Consult our clinical desk.
              </p>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
