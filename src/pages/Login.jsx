import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, Phone } from 'lucide-react';
import { AuthContext } from '../context/AuthAppContext';
import { toast } from 'react-hot-toast';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [identifier, setIdentifier] = useState(''); // email or phone number
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error("Please fill in all credential fields");
      return;
    }

    setLoading(true);
    const loginToastId = toast.loading("Verifying credentials...");

    try {
      const data = await login(identifier, password);
      toast.success(`Welcome back, ${data.name}!`, { id: loginToastId });
      
      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Invalid credentials. Please verify and try again.';
      toast.error(errMsg, { id: loginToastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F0EB] text-[#111827] flex items-center justify-center p-6 relative font-sans">
      
      <div className="max-w-md w-full bg-white border border-[#E6E1DA] rounded-3xl p-8 shadow-xl relative">
        
        {/* Hospital Branding */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Link to="/" className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#EA580C] flex items-center justify-center text-white shrink-0">
              <span className="font-extrabold text-sm">✦</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#111827] font-display">
              Care<span className="text-[#EA580C] font-extrabold">Link</span>
            </span>
          </Link>
          <h2 className="text-xl font-extrabold text-[#111827] font-display">Sign In</h2>
          <p className="text-xs text-slate-500 mt-1">Access your clinical dashboard portals.</p>
        </div>

        {/* Login Method Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => { setLoginMethod('email'); setIdentifier(''); }}
            className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              loginMethod === 'email' ? 'bg-white text-[#EA580C] shadow-sm' : 'text-slate-500'
            }`}
          >
            Email Address
          </button>
          <button
            type="button"
            onClick={() => { setLoginMethod('phone'); setIdentifier(''); }}
            className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              loginMethod === 'phone' ? 'bg-white text-[#EA580C] shadow-sm' : 'text-slate-500'
            }`}
          >
            Phone Number
          </button>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Identifier Input */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
              {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#EA580C] transition-colors">
                {loginMethod === 'email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
              </span>
              <input
                type={loginMethod === 'email' ? 'email' : 'text'}
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={loginMethod === 'email' ? 'name@hospital.com' : '+1 (555) 012-3456'}
                className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">Password</label>
              <Link 
                to="/forgot-password" 
                className="text-[10px] font-bold text-[#EA580C] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative group">
              <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#EA580C] transition-colors">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer text-xs uppercase tracking-wider font-display mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Register link */}
        <div className="mt-6 text-center text-xs">
          <span className="text-slate-500">Don't have a patient account? </span>
          <Link to="/register" className="font-bold text-[#EA580C] hover:underline">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
}
