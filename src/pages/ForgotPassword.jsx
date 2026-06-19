import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const toastId = toast.loading("Submitting recovery request...");
    
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success("Password reset instructions sent successfully!", { id: toastId });
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "An error occurred. Try again.";
      toast.error(errMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F0EB] text-[#111827] flex items-center justify-center p-6 relative font-sans">
      <div className="max-w-md w-full bg-white border border-[#E6E1DA] rounded-3xl p-8 shadow-xl relative">
        
        {/* Logo and Greeting */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link to="/" className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#EA580C] flex items-center justify-center text-white shrink-0">
              <span className="font-extrabold text-sm">✦</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#111827] font-display">
              Care<span className="text-[#EA580C] font-extrabold">Link</span>
            </span>
          </Link>
          <h2 className="text-xl font-extrabold text-[#111827] font-display">Reset Password</h2>
          <p className="text-xs text-slate-500 mt-2">
            {!submitted 
              ? "Provide your email address below and we'll send reset instructions."
              : "Check your email inbox for password configuration details."}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">Email Address</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#EA580C] transition-colors">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer text-xs uppercase tracking-wider font-display"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        ) : (
          <div className="bg-[#EA580C]/5 border border-[#EA580C]/10 rounded-2xl p-6 text-center text-xs font-semibold text-slate-700 leading-relaxed">
            We've transmitted reset details to <span className="text-[#EA580C] font-extrabold">{email}</span>. Click the link inside the email to complete the process.
          </div>
        )}

        <div className="mt-8 border-t border-slate-100 pt-5 text-center">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}
