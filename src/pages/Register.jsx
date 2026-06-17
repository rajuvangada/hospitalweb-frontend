import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, User, Phone, Calendar, HeartPulse, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthAppContext';
import { toast } from 'react-hot-toast';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    gender: 'Male',
    bloodGroup: 'O+',
    allergies: '',
    emergencyContact: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.dob || !formData.emergencyContact) {
      toast.error("Please fill in all required registration fields");
      return;
    }

    setLoading(true);
    const registerToastId = toast.loading("Creating patient account...");

    try {
      await register(formData);
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4 py-12">
      {/* Visual background highlights */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-md relative z-10">
        
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
          <h2 className="text-2xl font-bold text-center text-slate-900">Patient Registration</h2>
          <p className="text-sm text-slate-500 mt-1.5 text-center">Sign up to schedule appointments and access reports online.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Phone className="w-5 h-5" />
                </span>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Date of Birth</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Calendar className="w-5 h-5" />
                </span>
                <input
                  type="date"
                  name="dob"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
              </div>
            </div>

            {/* Gender Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Blood Group Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Emergency Contact (Relation / Phone)</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <HeartPulse className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  name="emergencyContact"
                  required
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="Jane Doe (+1 555-000-0000)"
                  className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Allergies - Full Width */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Known Medical Allergies</label>
            <textarea
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              rows="2"
              placeholder="e.g. Penicillin, Pollen (Write 'None' if applicable)"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
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
                Creating Account...
              </>
            ) : (
              "Complete Registration"
            )}
          </button>
        </form>

        {/* Login redirect */}
        <div className="mt-8 text-center text-sm">
          <span className="text-slate-500">Already have an account? </span>
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
}
