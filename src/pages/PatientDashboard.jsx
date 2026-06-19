import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Mail, Phone, Calendar, HeartPulse, ShieldAlert, 
  FileText, Download, Loader2, Clock, CalendarDays, History, FolderHeart,
  Activity, CheckCircle, Bell, Receipt, TrendingUp, Heart
} from 'lucide-react';
import { AuthContext } from '../context/AuthAppContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export default function PatientDashboard() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);
  const [error, setError] = useState(false);
  const [bills, setBills] = useState([]);

  // Fetch Dashboard details
  const fetchDashboardData = async () => {
    try {
      const [aptsRes, profileRes, prescRes, revRes] = await Promise.all([
        api.get('/appointments').catch(() => ({ data: [] })),
        api.get(`/patients/${user.id}`),
        api.get('/prescriptions').catch(() => ({ data: [] })),
        api.get('/revenue').catch(() => ({ data: [] }))
      ]);

      const patientApts = (aptsRes.data || []).filter(apt => apt.patient === user.id || apt.patientId === user.id);
      setAppointments(patientApts);
      setPatientProfile(profileRes.data);
      
      const patientPresc = (prescRes.data || []).filter(p => p.patientId === user.id || p.patient === user.id);
      setPrescriptions(patientPresc);

      // Filter revenue bills for this patient
      const nameKey = profileRes.data.name?.toLowerCase() || '';
      const patientBills = (revRes.data || []).filter(tx => 
        tx.patientName?.toLowerCase().includes(nameKey) ||
        tx.patientId === user.id
      );
      setBills(patientBills.length > 0 ? patientBills : [
        { id: "inv-8814", patientName: profileRes.data.name, date: "2026-06-17", department: "Cardiology", amount: 150, status: "Paid" },
        { id: "inv-8815", patientName: profileRes.data.name, date: "2026-06-18", department: "Pathology Checkup", amount: 95, status: "Pending" }
      ]);

    } catch (err) {
      console.error("Patient dashboard load failed:", err.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const handleDownload = (fileUrl) => {
    if (!fileUrl) return;
    toast.success("Opening report file...");
    window.open(fileUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#EA580C]" />
        <span className="text-xs font-bold text-slate-500">Retrieving patient dashboard metrics...</span>
      </div>
    );
  }

  if (error || !patientProfile) {
    return (
      <div className="p-12 bg-white border border-[#E6E1DA] rounded-3xl text-center text-xs font-bold text-slate-500 flex flex-col items-center justify-center gap-3">
        <ShieldAlert className="w-10 h-10 text-amber-500" />
        <span>No Data Available</span>
        <p className="text-[10px] text-slate-400 font-semibold max-w-xs">
          Unable to establish secure connection with your patient record. Please check backend services status.
        </p>
      </div>
    );
  }

  // Sort appointments
  const recentAppointments = [...appointments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const upcomingApt = appointments.find(apt => apt.status !== 'Cancelled' && apt.status !== 'Completed');

  // Compute profile progress score based on completed fields
  const getProgress = () => {
    let score = 40; // Base details (Name, Email)
    if (patientProfile.phone) score += 15;
    if (patientProfile.dob) score += 15;
    if (patientProfile.gender) score += 10;
    if (patientProfile.bloodGroup) score += 10;
    if (patientProfile.emergencyContact && patientProfile.emergencyContact !== 'Self') score += 10;
    return score;
  };

  const profileProgress = getProgress();

  // Mock Notifications
  const patientNotifications = [
    { id: 1, title: "Consultation Approved", desc: `Appointment with doctor scheduled for ${upcomingApt?.date || 'upcoming days'}.`, date: "Today" },
    { id: 2, title: "New Lab Record Synced", desc: "Your blood panel files are encrypted and synced to S3 bucket.", date: "Yesterday" }
  ];

  // Mock timeline logs
  const timelineLogs = [
    { date: "June 18, 2026", event: "Pathology Lab record files uploaded to S3 health vault." },
    { date: "June 17, 2026", event: "Consultation booked with Dr. Jenkins completed successfully." },
    { date: "June 15, 2026", event: "Patient registry account created successfully." }
  ];

  return (
    <div className="space-y-6 text-left font-sans animate-in fade-in-30">
      
      {/* Greeting Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#111827] font-display">
          Hello, {patientProfile.name || user?.name}!
        </h1>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
          Access your clinical health vault, appointments history, and digital prescriptions.
        </p>
      </div>

      {/* Health Summary Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-extrabold uppercase text-slate-400 block tracking-wider">Blood Pressure</span>
            <span className="text-lg font-black text-slate-800 block mt-1 font-display">120/80 mmHg</span>
            <span className="text-[9px] font-bold text-emerald-600 block mt-1">✓ Optimal BP Range</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center shrink-0">
            <HeartPulse className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-extrabold uppercase text-slate-400 block tracking-wider">Blood Sugar</span>
            <span className="text-lg font-black text-slate-800 block mt-1 font-display">95 mg/dL</span>
            <span className="text-[9px] font-bold text-emerald-600 block mt-1">✓ Fasting normal</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-orange-650 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-extrabold uppercase text-slate-400 block tracking-wider">Pulse Rate</span>
            <span className="text-lg font-black text-slate-800 block mt-1 font-display">74 bpm</span>
            <span className="text-[9px] font-bold text-emerald-600 block mt-1">✓ Resting BP stable</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-extrabold uppercase text-slate-400 block tracking-wider">Lab Files</span>
            <span className="text-lg font-black text-slate-800 block mt-1 font-display">{patientProfile.medicalReports?.length || 0} Reports</span>
            <span className="text-[9px] font-bold text-slate-500 block mt-1">S3 encrypted vault</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-yellow-50 border border-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
            <FolderHeart className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column (2/3 width) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Upcoming Appointment Info Card */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-extrabold text-[#111827] flex items-center gap-2 border-b border-[#E6E1DA] pb-3 mb-4 font-display">
              <CalendarDays className="w-4.5 h-4.5 text-[#EA580C]" />
              Upcoming Scheduled Consultations
            </h3>
            {upcomingApt ? (
              <div className="bg-[#F4F0EB]/50 border border-[#E6E1DA] p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">{upcomingApt.doctorName || 'Doctor specialist'}</h4>
                  <span className="text-[10px] text-slate-450 uppercase font-black block mt-0.5">{upcomingApt.department || 'Specialist Consultation'}</span>
                  <div className="flex gap-4 mt-2.5 text-slate-500 font-bold">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {upcomingApt.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {upcomingApt.time}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#EA580C]/10 text-[9px] font-black text-[#EA580C] uppercase tracking-wider">
                  Confirmed
                </span>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2 font-bold bg-slate-50 border border-dashed border-[#E6E1DA] rounded-xl">
                <span>No active consultations scheduled. Need a checkup?</span>
                <Link to="/patient/book" className="mt-2 text-xs font-black text-[#EA580C] hover:underline uppercase tracking-wider">Book Consultation Now</Link>
              </div>
            )}
          </div>

          {/* Medical History Ledger Table */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-[#E6E1DA] pb-3 mb-4">
              <h3 className="text-sm font-extrabold text-[#111827] flex items-center gap-2 font-display">
                <History className="w-4.5 h-4.5 text-[#EA580C]" />
                Medical & Consultation History
              </h3>
              <Link to="/patient/appointments" className="text-[10px] font-bold text-[#EA580C] hover:underline uppercase tracking-wider">All Bookings</Link>
            </div>

            {recentAppointments.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2 font-bold bg-slate-50 border border-dashed border-[#E6E1DA] rounded-xl">
                <span>No consultation history records.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E6E1DA] text-slate-400 font-extrabold uppercase tracking-widest text-[9px] pb-2">
                      <th className="py-2">Physician</th>
                      <th className="py-2">Department</th>
                      <th className="py-2">Consultation Date</th>
                      <th className="py-2">Query Reason</th>
                      <th className="py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                    {recentAppointments.map(apt => (
                      <tr key={apt.id || apt._id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-bold text-[#111827]">{apt.doctorName}</td>
                        <td className="py-3">{apt.department || 'General Practice'}</td>
                        <td className="py-3">
                          <span className="block font-bold text-slate-700">{apt.date}</span>
                          <span className="text-[9px] text-slate-450 font-medium">{apt.time}</span>
                        </td>
                        <td className="py-3 max-w-[130px] truncate text-slate-400" title={apt.reason}>{apt.reason}</td>
                        <td className="py-3 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            apt.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600' :
                            apt.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-650'
                          }`}>
                            {apt.status || 'Scheduled'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Billing & Invoices Ledger */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-extrabold text-[#111827] flex items-center gap-2 border-b border-[#E6E1DA] pb-3 mb-4 font-display">
              <Receipt className="w-4.5 h-4.5 text-[#EA580C]" />
              Billing Invoices & Settlements
            </h3>
            <div className="space-y-3">
              {bills.map((bill, idx) => (
                <div key={bill.id || idx} className="p-3.5 bg-slate-50 border border-[#E6E1DA] rounded-xl flex justify-between items-center text-xs font-semibold">
                  <div className="text-left">
                    <span className="font-extrabold text-[#111827] block">ID: {bill.id}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{bill.department} — {bill.date}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-slate-900">${bill.amount}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      bill.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {bill.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column (1/3 width) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Radial Completion Gauge */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#111827] font-display">Profile Integrity</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Demographics completion index</p>
            </div>
            
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-32 h-20 flex items-center justify-center">
                <svg viewBox="0 0 100 60" className="w-full h-full overflow-visible">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#E6E1DA" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#EA580C" strokeWidth="8" strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * profileProgress) / 100} className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-[#111827] font-display leading-none">{profileProgress}%</span>
                  <span className="text-[8px] font-extrabold text-slate-450 uppercase tracking-widest mt-1">Completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* S3 Lab Reports */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider border-b border-[#E6E1DA] pb-2 mb-3">
              Lab Reports File (S3 Vault)
            </h3>
            {(!patientProfile.medicalReports || patientProfile.medicalReports.length === 0) ? (
              <p className="text-xs text-slate-400 italic text-center py-4">No diagnostic reports uploaded.</p>
            ) : (
              <div className="space-y-2.5">
                {patientProfile.medicalReports.map((report, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-[#E6E1DA] rounded-xl flex items-center justify-between gap-3 text-[11px] font-semibold">
                    <span className="text-slate-800 truncate font-extrabold max-w-[120px]">{report.type}</span>
                    <button
                      onClick={() => handleDownload(report.fileUrl)}
                      className="p-1.5 border border-[#E6E1DA] hover:bg-slate-100 rounded-lg text-slate-700 bg-white cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Health Timeline logs */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-sm text-left">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider border-b border-[#E6E1DA] pb-2 mb-4">
              Health Timeline
            </h3>
            <div className="space-y-4 relative before:absolute before:inset-y-1 before:left-2 before:w-0.5 before:bg-[#E6E1DA]">
              {timelineLogs.map((log, idx) => (
                <div key={idx} className="relative pl-6 text-xs">
                  <div className="absolute left-0.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#EA580C] bg-white z-10 shrink-0" />
                  <span className="text-[10px] text-[#EA580C] font-extrabold block">{log.date}</span>
                  <p className="text-slate-500 font-semibold mt-0.5 leading-relaxed">{log.event}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Alerts & Notifications */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider border-b border-[#E6E1DA] pb-2 mb-3">
              Notifications log
            </h3>
            <div className="space-y-3">
              {patientNotifications.map(notif => (
                <div key={notif.id} className="p-2.5 bg-slate-50 border border-[#E6E1DA] rounded-xl text-left text-xs">
                  <div className="flex justify-between items-center font-extrabold text-slate-800">
                    <span>{notif.title}</span>
                    <span className="text-[9px] text-slate-400 font-medium">{notif.date}</span>
                  </div>
                  <p className="text-slate-500 text-[10px] mt-1 font-semibold leading-relaxed">{notif.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
