import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthAppContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { User, Phone, Calendar, HeartPulse, ShieldAlert, Loader2, Mail, ShieldCheck } from 'lucide-react';

export default function PatientProfile() {
  const { user, updateProfileState } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    bloodGroup: 'O+',
    allergies: '',
    emergencyContact: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/patients/${user.id}`);
        const data = res.data;
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          dob: data.dob || '',
          gender: data.gender || 'Male',
          bloodGroup: data.bloodGroup || 'O+',
          allergies: data.allergies || '',
          emergencyContact: data.emergencyContact || ''
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load profile details from server");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    const saveToastId = toast.loading("Saving profile modifications...");

    try {
      const res = await api.put(`/patients/${user.id}`, formData);
      updateProfileState(res.data);
      toast.success("Profile updated successfully!", { id: saveToastId });
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || "Failed to update profile details";
      toast.error(errMsg, { id: saveToastId });
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <span className="text-xs font-bold text-slate-500">Retrieving profile parameters...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl text-left font-sans">
      {/* Page header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-850 dark:text-white font-display">Patient Demographics</h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Verify your personal and clinical details mapped to your patient account.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleUpdate} className="space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400 flex items-center justify-center font-bold text-3xl shrink-0">
              {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-center sm:text-left space-y-1.5">
              <h2 className="text-xl font-bold text-slate-850 dark:text-white font-display">{formData.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-[9px] font-black text-emerald-600 uppercase tracking-widest block sm:inline-block">
                Clinical Account Synced
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-550">Full Name</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full h-11 pl-11 pr-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Email (Disabled) */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-550">Email Address (Read-Only)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full h-11 pl-11 pr-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-550 dark:text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-550">Phone Number</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Phone className="w-4.5 h-4.5" />
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full h-11 pl-11 pr-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Date of birth */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-550">Date of Birth</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Calendar className="w-4.5 h-4.5" />
                </span>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  className="w-full h-11 pl-11 pr-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-550">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Blood group */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-550">Blood Type</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <HeartPulse className="w-4.5 h-4.5" />
                </span>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full h-11 pl-11 pr-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* Allergies */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-550 flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-danger" />
                <span>Known Medical Allergies</span>
              </label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                rows="2"
                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-205 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Emergency Contact */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-550">Emergency Contact Details</label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                required
                className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saveLoading}
            className="px-6 h-11 bg-[#0F4C81] hover:bg-[#0F4C81]/95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer font-display"
          >
            {saveLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Profile Details"
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
