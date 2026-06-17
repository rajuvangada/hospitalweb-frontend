import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthAppContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  Users, Calendar, ClipboardCheck, Clock, FileText, ArrowRight,
  Activity, CheckCircle, Loader2, ShieldAlert, PenTool
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [aptsRes, prescRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/prescriptions').catch(() => ({ data: [] }))
      ]);

      const docApts = (aptsRes.data || []).filter(apt => apt.doctor === user.id || apt.doctorId === user.id);
      setAppointments(docApts);
      setPrescriptions(prescRes.data || []);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <span className="text-sm font-bold text-slate-500">Retrieving clinic dashboard metrics...</span>
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

  // Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter(apt => apt.date === todayStr && apt.status === 'Scheduled');
  
  // Calculate distinct patients count
  const uniquePatientIds = [...new Set(appointments.map(apt => apt.patientId || apt.patient))];
  const totalPatientsCount = uniquePatientIds.length;

  // Pending prescriptions: Scheduled or Completed appointments of this doctor that do NOT have a prescription matching their ID yet
  const prescriptionAptIds = prescriptions.map(p => p.appointmentId);
  const pendingPrescriptionApts = appointments.filter(apt => 
    !prescriptionAptIds.includes(apt.id) && 
    !prescriptionAptIds.includes(apt._id) &&
    apt.status !== 'Cancelled'
  );

  return (
    <div className="space-y-8">
      {/* Greeting Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Welcome, {user?.name}
        </h1>
        <p className="text-sm text-slate-500 font-semibold">
          Clinician Portal. Review daily schedules, patient files, and pending prescriptions.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Today's Appointments</span>
            <span className="text-lg font-black text-slate-800">{todayApts.length} <span className="text-xs font-bold text-slate-500">scheduled</span></span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Patients Count</span>
            <span className="text-lg font-black text-slate-800">{totalPatientsCount} <span className="text-xs font-bold text-slate-500">assigned</span></span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pending Prescriptions</span>
            <span className="text-lg font-black text-slate-800">{pendingPrescriptionApts.length} <span className="text-xs font-bold text-slate-500">to write</span></span>
          </div>
        </div>
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. Today's Appointments Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Activity className="w-4.5 h-4.5 text-primary" />
              Today's Appointments
            </h3>

            {todayApts.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CheckCircle className="w-8 h-8 text-emerald-500/50" />
                <span>No Data Available</span>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                {todayApts.map(apt => (
                  <div key={apt.id || apt._id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs font-semibold">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-800">{apt.patientName || 'Patient'}</span>
                      <span className="text-primary font-bold">{apt.time}</span>
                    </div>
                    <p className="text-slate-500 text-[10px] italic leading-normal">
                      "Reason: {apt.reason}"
                    </p>
                    {apt.symptoms && (
                      <p className="text-[10px] text-slate-400">
                        Symptoms: <strong className="font-bold text-slate-650">{apt.symptoms}</strong>
                      </p>
                    )}
                    <div className="flex gap-2 pt-1 border-t border-slate-100">
                      <Link 
                        to={`/doctor/write-prescription?aptId=${apt.id || apt._id}`}
                        className="px-3 py-1 bg-primary text-white font-black text-[10px] uppercase rounded-lg hover:bg-primary/95 transition-colors flex items-center gap-1"
                      >
                        <PenTool className="w-3 h-3" /> Prescribe Rx
                      </Link>
                      <button
                        onClick={() => handleMarkComplete(apt.id || apt._id)}
                        className="px-3 py-1 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[10px] uppercase rounded-lg transition-colors cursor-pointer"
                      >
                        Complete Checkup
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. Pending Prescriptions Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-4.5 h-4.5 text-primary" />
              Pending Prescriptions
            </h3>

            {pendingPrescriptionApts.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CheckCircle className="w-8 h-8 text-emerald-500/50" />
                <span>No Data Available</span>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                {pendingPrescriptionApts.map(apt => (
                  <div key={apt.id || apt._id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs font-semibold flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-extrabold text-slate-800 block truncate">{apt.patientName || 'Patient'}</span>
                      <span className="text-[10px] text-slate-550 block truncate font-medium mt-0.5">Reason: {apt.reason}</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{apt.date} at {apt.time} ({apt.status})</span>
                    </div>
                    <Link 
                      to={`/doctor/write-prescription?aptId=${apt.id || apt._id}`}
                      className="px-3.5 py-2 bg-primary text-white font-bold text-[10px] uppercase tracking-wider rounded-xl hover:bg-primary/95 transition-colors shrink-0 flex items-center gap-1.5"
                    >
                      <PenTool className="w-3.5 h-3.5" /> Write Rx
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
