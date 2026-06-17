import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  Users, Calendar, Wallet, FileText, ArrowRight,
  Activity, ShieldAlert, Loader2, Stethoscope, Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [patientsCount, setPatientsCount] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [revenueTotal, setRevenueTotal] = useState(0);
  const [error, setError] = useState(false);

  const fetchAdminStats = async () => {
    try {
      const [docsRes, patsRes, aptsRes, revRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/patients'),
        api.get('/appointments'),
        api.get('/revenue').catch(() => ({ data: [] }))
      ]);

      setDoctorsCount(docsRes.data?.length || 0);
      setPatientsCount(patsRes.data?.length || 0);
      setAppointments(aptsRes.data || []);
      
      const paidRev = (revRes.data || [])
        .filter(r => r.status === 'Paid')
        .reduce((acc, curr) => acc + curr.amount, 0);
      setRevenueTotal(paidRev);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <span className="text-sm font-bold text-slate-500">Retrieving administration dashboard metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center text-xs font-bold text-slate-500 flex flex-col items-center justify-center gap-2">
        <ShieldAlert className="w-8 h-8 text-amber-500" />
        <span>No Data Available</span>
      </div>
    );
  }

  // Recent Activity: Sort appointments by date to display the most recently booked/scheduled ones
  const recentActivities = [...appointments]
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Greeting Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Clinic Administration
        </h1>
        <p className="text-sm text-slate-500 font-semibold">
          Executive Workspace. Manage practitioners, audit registrations, and monitor patient appointment logs.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Doctors Count</span>
            <span className="text-lg font-black text-slate-800">{doctorsCount} <span className="text-xs font-bold text-slate-500">registered</span></span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Patients Count</span>
            <span className="text-lg font-black text-slate-800">{patientsCount} <span className="text-xs font-bold text-slate-500">registered</span></span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Appointments Count</span>
            <span className="text-lg font-black text-slate-800">{appointments.length} <span className="text-xs font-bold text-slate-500">total</span></span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Revenue</span>
            <span className="text-lg font-black text-slate-800">${revenueTotal} <span className="text-xs font-bold text-slate-500">USD</span></span>
          </div>
        </div>
      </div>

      {/* Main workspace layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Recent Activity Panel */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Activity className="w-4.5 h-4.5 text-primary" />
              Recent Activity
            </h3>

            {recentActivities.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Clock className="w-8 h-8 opacity-30 text-slate-400" />
                <span>No Data Available</span>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                {recentActivities.map((act, idx) => (
                  <div key={act.id || act._id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs font-semibold">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-800">New Appointment Booked</span>
                      <span className="text-slate-400 text-[10px]">{act.date}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Patient <strong className="text-slate-700">{act.patientName || 'Anonymous'}</strong> scheduled checkup with <strong className="text-slate-700">{act.doctorName || 'Specialist'}</strong> on {act.date} at {act.time}.
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        act.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                        act.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {act.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. Admin Management Panel Links */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-primary" />
              Quick Links
            </h3>
            
            <div className="flex flex-col gap-3">
              <Link 
                to="/admin/doctors" 
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all group"
              >
                <span>Manage Doctors Registry</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-slate-400" />
              </Link>
              
              <Link 
                to="/admin/patients" 
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all group"
              >
                <span>Manage Patient Directories</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-slate-400" />
              </Link>

              <Link 
                to="/admin/reports" 
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all group"
              >
                <span>View System Reports</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-slate-400" />
              </Link>

              <Link 
                to="/admin/revenue" 
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all group"
              >
                <span>Audit Financial Analytics</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-slate-400" />
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
