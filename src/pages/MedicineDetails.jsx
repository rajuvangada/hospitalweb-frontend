import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthAppContext';
import { toast } from 'react-hot-toast';
import { 
  Activity, ArrowLeft, ShieldAlert, PhoneCall, Mail, MapPin, 
  ChevronDown, LogOut, Loader2 
} from 'lucide-react';

export default function MedicineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const res = await api.get(`/medicines/${id}`);
        setMedicine(res.data);
      } catch (err) {
        console.warn("Medicine details API returned error:", err.message);
        setMedicine(null);
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

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen flex flex-col font-sans">
      
      {/* Sticky Navbar */}
      <header className="sticky top-0 inset-x-0 bg-white border-b border-slate-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
              <Activity className="w-5.5 h-5.5" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900">
              Apollo<span className="text-primary">HMS</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-600">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/#about" className="hover:text-primary transition-colors">About Hospital</Link>
            <Link to="/#doctors" className="hover:text-primary transition-colors">Doctors</Link>
            <Link to="/#medicines" className="hover:text-primary transition-colors">Medicines</Link>
            <Link to="/#services" className="hover:text-primary transition-colors">Services</Link>
            <Link to="/#appointments" className="hover:text-primary transition-colors">Appointments</Link>
            <Link to="/#contact" className="hover:text-primary transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-700">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 flex flex-col py-2 animate-in fade-in-50">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                    </div>
                    <Link to={getDashboardPath()} className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold hover:bg-slate-50 text-slate-700 transition-colors">
                      <Activity className="w-4 h-4 text-slate-400" /> My Dashboard
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
                <Link to="/login" className="text-xs font-bold text-slate-700 px-4 py-2 hover:text-primary transition-colors">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-5 py-2 text-xs font-bold bg-primary hover:bg-primary/95 text-white rounded-full transition-all shadow-md"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-6 py-12 flex-1 w-full flex flex-col justify-center">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors mb-6 uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home Page
        </Link>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <span className="text-xs font-bold text-slate-500">Retrieving formulation details...</span>
          </div>
        ) : medicine ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-48 h-48 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
                <img 
                  src={medicine.imageUrl || "/favicon.svg"} 
                  alt={medicine.name}
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="space-y-3 flex-1">
                <span className="text-[10px] bg-primary/10 text-primary font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
                  {medicine.category}
                </span>
                <h1 className="text-2xl font-black text-slate-900 leading-tight">{medicine.name}</h1>
                <p className="text-slate-500 text-xs leading-relaxed">{medicine.description || "No description available."}</p>
                <div className="pt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">${medicine.price}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">per unit</span>
                </div>
                <div className="pt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    medicine.availability ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {medicine.availability ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-inner">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h2 className="text-base font-extrabold text-slate-900">No Data Available</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                This medicine is currently out of stock or its formulation registry is unavailable. Consult our clinical desk for details.
              </p>
            </div>
            <Link 
              to="/" 
              className="mt-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              Return to Catalog
            </Link>
          </div>
        )}
      </main>

      {/* Emergency Helpline Banner */}
      <section className="bg-amber-500 text-white py-4 border-b border-amber-600">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-black uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 animate-bounce" />
            <span>24/7 Emergency Dispatch Helpline:</span>
            <span className="underline">+1 (555) 012-HMS1</span>
          </div>
          <div>Integrated Trauma & Ambulance Services</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800 mb-8">
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">ApolloHMS</h4>
            <p className="leading-relaxed text-slate-500 max-w-xs">
              Complete Hospital Management System. Formulating schedules, medical files, digital prescriptions and financial billing logs.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Contact Registrar</h4>
            <div className="space-y-2 text-slate-500">
              <div className="flex items-center gap-2"><PhoneCall className="w-4 h-4 text-primary shrink-0" /> <span>+1 (555) 012-HMS1</span></div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary shrink-0" /> <span>registrar@apollohms.com</span></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary shrink-0" /> <span>742 Medical Center Blvd, Health City</span></div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Patient Links</h4>
            <div className="grid grid-cols-2 gap-2 font-bold text-slate-500">
              <Link to="/login" className="hover:text-primary transition-colors">Sign In</Link>
              <Link to="/register" className="hover:text-primary transition-colors">Register Account</Link>
              <Link to="/forgot-password" className="hover:text-primary transition-colors">Reset Password</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-600">
          <span>&copy; {new Date().getFullYear()} ApolloHMS Clinics Inc. All rights reserved. Inspiration design Apollo Pharmacy.</span>
        </div>
      </footer>

    </div>
  );
}
