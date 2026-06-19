import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Calendar, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthAppContext';
import { toast } from 'react-hot-toast';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.gender || !formData.dob || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    const registerToastId = toast.loading("Creating patient account...");

    // Map fields and supply defaults for bloodGroup and emergencyContact to satisfy backend Patient schema constraints
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender,
      dob: formData.dob,
      password: formData.password,
      bloodGroup: 'O+', // database schema required field fallback
      emergencyContact: 'Self (Standard Registration)' // database schema required field fallback
    };

    try {
      await register(payload);
      toast.success("Account created successfully! Welcome.", { id: registerToastId });
      navigate('/patient/dashboard');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Registration failed. Email might already exist.';
      toast.error(errMsg, { id: registerToastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F0EB] text-[#111827] flex items-center justify-center p-6 relative font-sans">
      
      <div className="max-w-lg w-full bg-white border border-[#E6E1DA] rounded-3xl p-8 shadow-xl relative">
        
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Link to="/" className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#EA580C] flex items-center justify-center text-white shrink-0">
              <span className="font-extrabold text-sm">✦</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#111827] font-display">
              Care<span className="text-[#EA580C] font-extrabold">Link</span>
            </span>
          </Link>
          <h2 className="text-xl font-extrabold text-[#111827] font-display">Patient Registration</h2>
          <p className="text-xs text-slate-500 mt-1">Sign up to access medical portals and book appointments online.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">Full Name</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#EA580C] transition-colors">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">Email Address</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#EA580C] transition-colors">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-all"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">Phone Number</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#EA580C] transition-colors">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 012-3456"
                  className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-all"
                />
              </div>
            </div>

            {/* Gender Select */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full h-11 px-4 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-all cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">Date of Birth</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#EA580C] transition-colors">
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  type="date"
                  name="dob"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-all cursor-pointer"
                />
              </div>
            </div>

            <div className="hidden sm:block"></div> {/* Grid spacer */}

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">Password</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#EA580C] transition-colors">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-all"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">Confirm Password</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#EA580C] transition-colors">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer text-xs uppercase tracking-wider font-display mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Complete Registration"
            )}
          </button>
        </form>

        {/* Login redirect */}
        <div className="mt-6 text-center text-xs">
          <span className="text-slate-500">Already have an account? </span>
          <Link to="/login" className="font-bold text-[#EA580C] hover:underline">
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
}
