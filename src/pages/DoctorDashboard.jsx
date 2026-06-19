import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthAppContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  Users, Calendar, ClipboardCheck, Clock, FileText, ArrowRight,
  Activity, CheckCircle, Loader2, ShieldAlert, PenTool, Check, X, ShieldCheck
} from 'lucide-react';
import { BarChart } from '../components/ui/CustomCharts';

export default function DoctorDashboard() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState(false);

  // Doctor Uploaded Prescriptions Review States
  const [uploadedRxs, setUploadedRxs] = useState([]);
  const [feedbackNotes, setFeedbackNotes] = useState({});

  const fetchDashboardData = async () => {
    try {
      const [aptsRes, prescRes] = await Promise.all([
        api.get('/appointments').catch(() => ({ data: [] })),
        api.get('/prescriptions').catch(() => ({ data: [] }))
      ]);

      const docApts = (aptsRes.data || []).filter(apt => apt.doctor === user.id || apt.doctorId === user.id);
      setAppointments(docApts);
      setPrescriptions(prescRes.data || []);
      
      // Load uploaded prescriptions for this doctor
      const allUploads = JSON.parse(localStorage.getItem('uploaded_prescriptions') || '[]');
      const docUploads = allUploads.filter(r => r.doctorId === user.id);
      setUploadedRxs(docUploads);

    } catch (err) {
      console.error("Doctor dashboard fetch error:", err.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user.id]);

  const handleMarkComplete = async (id) => {
    const actionToastId = toast.loading("Marking appointment completed...");
    try {
      await api.put(`/appointments/${id}`, { status: 'Completed' });
      toast.success("Appointment completed successfully!", { id: actionToastId });
      fetchDashboardData();
    } catch (err) {
      toast.error("Failed to update appointment status", { id: actionToastId });
    }
  };

  const handleReviewUpload = (recordId, newStatus) => {
    const actionToastId = toast.loading("Registering prescription status...");
    try {
      const allUploads = JSON.parse(localStorage.getItem('uploaded_prescriptions') || '[]');
      const updated = allUploads.map(rec => {
        if (rec.id === recordId) {
          return {
            ...rec,
            status: newStatus,
            notes: feedbackNotes[recordId] || "Reviewed by clinician."
          };
        }
        return rec;
      });

      localStorage.setItem('uploaded_prescriptions', JSON.stringify(updated));
      toast.success(`Prescription record successfully ${newStatus}!`, { id: actionToastId });
      
      // Reload
      const docUploads = updated.filter(r => r.doctorId === user.id);
      setUploadedRxs(docUploads);
    } catch (e) {
      toast.error("Review update failed", { id: actionToastId });
    }
  };

  const handleNoteChange = (recordId, value) => {
    setFeedbackNotes(prev => ({ ...prev, [recordId]: value }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#EA580C]" />
        <span className="text-xs font-bold text-slate-500">Retrieving clinic dashboard metrics...</span>
      </div>
    );
  }

  // Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter(apt => apt.date === todayStr && apt.status === 'Scheduled');
  
  // Active patient metrics
  const uniquePatientIds = [...new Set(appointments.map(apt => apt.patientId || apt.patient))];
  const totalPatientsCount = uniquePatientIds.length;

  // Pending prescriptions from appointments
  const prescriptionAptIds = prescriptions.map(p => p.appointmentId);
  const pendingPrescriptionApts = appointments.filter(apt => 
    !prescriptionAptIds.includes(apt.id) && 
    !prescriptionAptIds.includes(apt._id) &&
    apt.status !== 'Cancelled'
  );

  // Active Patients list matching columns
  const activePatientsList = [
    { name: "Arthur Pendragon", age: 34, gender: "Male", lastVisit: "2026-06-17", status: "Recovering" },
    { name: "Bruce Wayne", age: 42, gender: "Male", lastVisit: "2026-06-18", status: "Critical" },
    { name: "Selina Kyle", age: 29, gender: "Female", lastVisit: "2026-06-16", status: "Stable" },
    { name: "Ginevra Weasley", age: 24, gender: "Female", lastVisit: "2026-06-15", status: "Recovering" }
  ];

  // SVG Chart data
  const weeklyTrends = [
    { label: 'Mon', value: 2 },
    { label: 'Tue', value: appointments.length > 0 ? appointments.length : 1 },
    { label: 'Wed', value: appointments.length + 1 },
    { label: 'Thu', value: todayApts.length + 2 },
    { label: 'Fri', value: 3 },
    { label: 'Sat', value: 1 }
  ];

  // Calendar Shift Slots
  const calendarSlots = [
    { time: "09:00 AM", status: "Booked", patient: "Arthur Pendragon" },
    { time: "10:30 AM", status: "Available", patient: "" },
    { time: "11:00 AM", status: "Booked", patient: "Ginevra Weasley" },
    { time: "02:00 PM", status: "Available", patient: "" },
    { time: "03:30 PM", status: "Available", patient: "" }
  ];

  return (
    <div className="space-y-6 text-left font-sans animate-in fade-in-30">
      
      {/* Greeting Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#111827] font-display">
          Welcome, {user?.name}
        </h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          Clinician Portal. Review daily schedules, patient files, and pending prescription uploads.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4 group hover:border-[#EA580C]/30 transition-all">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Today's Appointments</span>
            <span className="text-2xl font-black text-slate-850 block leading-none font-display">{todayApts.length}</span>
            <span className="text-[10px] font-bold text-slate-450 block">Active listings</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#EA580C] border border-orange-100 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4 group hover:border-[#EA580C]/30 transition-all">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Patients</span>
            <span className="text-2xl font-black text-slate-850 block leading-none font-display">{totalPatientsCount}</span>
            <span className="text-[10px] font-bold text-emerald-600 block">↑ Assigned cases</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 border border-indigo-100 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4 group hover:border-[#EA580C]/30 transition-all">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Pending Scripts (Rx)</span>
            <span className="text-2xl font-black text-slate-850 block leading-none font-display">{pendingPrescriptionApts.length}</span>
            <span className="text-[10px] font-bold text-red-500 block">Requires Rx formulation</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-600 border border-yellow-100 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Split layout: Table and chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Today's Appointments & Analytics (2/3 width) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Patients Table list */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-extrabold text-[#111827] border-b border-[#E6E1DA] pb-3 mb-4 font-display flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-[#EA580C]" /> Active Clinic Patients Case Ledger
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E6E1DA] text-slate-400 font-extrabold uppercase tracking-widest text-[9px] pb-2">
                    <th className="py-2.5">Profile</th>
                    <th className="py-2.5">Age / Gender</th>
                    <th className="py-2.5">Last Visit Date</th>
                    <th className="py-2.5">Clinical Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                  {activePatientsList.map((pat, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 font-bold text-[#111827] flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center font-bold text-[10px]">
                          {pat.name.charAt(0)}
                        </div>
                        <span>{pat.name}</span>
                      </td>
                      <td className="py-3">{pat.age} Years / {pat.gender}</td>
                      <td className="py-3">{pat.lastVisit}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          pat.status === 'Critical' ? 'bg-red-500/10 text-red-500' :
                          pat.status === 'Stable' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-605'
                        }`}>
                          {pat.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Patient Uploaded Prescriptions Review Panel */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-extrabold text-[#111827] border-b border-[#E6E1DA] pb-3 mb-4 font-display flex items-center gap-2">
              <ClipboardCheck className="w-4.5 h-4.5 text-[#EA580C]" /> Patient Uploaded Prescriptions Review
            </h3>
            
            {uploadedRxs.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">No patient uploaded prescription documents pending review.</p>
            ) : (
              <div className="space-y-4">
                {uploadedRxs.map(rec => (
                  <div key={rec.id} className="p-4 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs flex flex-col gap-3">
                    <div className="flex justify-between items-center pb-2 border-b border-[#E6E1DA]">
                      <div>
                        <span className="font-extrabold text-slate-800 text-sm">{rec.patientName}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">File: {rec.fileName} — Uploaded {rec.date}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        rec.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' :
                        rec.status === 'Rejected' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {rec.status}
                      </span>
                    </div>

                    <p className="text-slate-500 leading-relaxed font-semibold">"Patient Note: {rec.description}"</p>

                    {rec.status === 'Pending' ? (
                      <div className="space-y-3 pt-2">
                        <input
                          type="text"
                          placeholder="Add diagnostic notes or advice..."
                          value={feedbackNotes[rec.id] || ''}
                          onChange={(e) => handleNoteChange(rec.id, e.target.value)}
                          className="w-full h-10 px-3.5 bg-white border border-[#E6E1DA] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReviewUpload(rec.id, 'Approved')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleReviewUpload(rec.id, 'Rejected')}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded-lg uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-450 italic mt-1 font-semibold">Feedback: "{rec.notes}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bar Chart analytics */}
          <div className="w-full">
            <BarChart 
              data={weeklyTrends}
              title="Weekly Consultation Volume" 
              subtitle="Total patients diagnostic load by weekday"
            />
          </div>

        </div>

        {/* Right Side: Shift Calendar and Schedules (1/3 width) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Calendar Shift view */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-sm text-left">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider border-b border-[#E6E1DA] pb-2 mb-4">
              Daily Calendar Shift Slots
            </h3>
            <div className="space-y-3.5">
              {calendarSlots.map((slot, idx) => (
                <div key={idx} className="p-3 bg-[#F4F0EB]/60 border border-[#E6E1DA] rounded-xl flex justify-between items-center text-xs font-semibold">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-[#EA580C]" />
                    <span className="font-extrabold text-slate-800">{slot.time}</span>
                  </div>
                  <div>
                    {slot.status === 'Booked' ? (
                      <span className="text-[10px] text-slate-450">
                        Booked: <strong className="font-extrabold text-slate-700">{slot.patient}</strong>
                      </span>
                    ) : (
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Available
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's appointments schedule list */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider border-b border-[#E6E1DA] pb-2 font-display">
                Upcoming Consultations
              </h3>

              {todayApts.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">No appointments scheduled for today.</p>
              ) : (
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {todayApts.map(apt => (
                    <div key={apt.id || apt._id} className="p-3 bg-slate-50 border border-[#E6E1DA] rounded-xl space-y-3 text-xs font-semibold">
                      <div className="flex justify-between items-center pb-2 border-b border-[#E6E1DA]">
                        <span className="font-bold text-slate-800">{apt.patientName}</span>
                        <span className="text-[#EA580C] font-black">{apt.time}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed italic">"Reason: {apt.reason}"</p>
                      <div className="flex gap-2 pt-2">
                        <Link 
                          to={`/doctor/write-prescription?aptId=${apt.id || apt._id}`}
                          className="px-3.5 py-2 bg-[#EA580C] text-white font-bold text-[9px] uppercase tracking-wider rounded-lg hover:bg-[#EA580C]/90 transition-colors flex items-center gap-1 font-display"
                        >
                          <PenTool className="w-3 h-3" /> Prescribe
                        </Link>
                        <button
                          onClick={() => handleMarkComplete(apt.id || apt._id)}
                          className="px-3.5 py-2 border border-[#E6E1DA] hover:bg-slate-100 text-slate-700 font-bold text-[9px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
