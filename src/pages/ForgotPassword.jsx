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
          <h2 className="text-2xl font-bold text-center text-slate-900">Reset Password</h2>
          <p className="text-sm text-slate-500 text-center mt-1.5 leading-relaxed">
            {!submitted 
              ? "Provide your email address below and we'll send reset instructions."
              : "Check your email inbox for password configuration details."}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        ) : (
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 text-center text-sm font-semibold text-slate-700 leading-relaxed">
            We've transmitted reset details to <span className="text-primary font-bold">{email}</span>. Click the link inside the email to complete the process.
          </div>
        )}

        <div className="mt-8 border-t border-slate-100 pt-5 text-center">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}
