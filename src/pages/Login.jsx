import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthAppContext';
import { toast } from 'react-hot-toast';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all credentials fields");
      return;
    }

    setLoading(true);
    const loginToastId = toast.loading("Verifying credentials...");

    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data.name}!`, { id: loginToastId });
      
      // Redirect based on user role
      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Invalid email or password';
      toast.error(errMsg, { id: loginToastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4">
      {/* Visual background highlights */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-md relative z-10">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Apollo<span className="text-primary">HMS</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-center text-slate-900">Sign In</h2>
          <p className="text-sm text-slate-500 mt-1.5 text-center">Access your clinical dashboard portals.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
              <Link 
                to="/forgot-password" 
                className="text-xs font-semibold text-primary hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative group">
              <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Register link */}
        <div className="mt-8 text-center text-sm">
          <span className="text-slate-500">Don't have a patient account? </span>
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
}
