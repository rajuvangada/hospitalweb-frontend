import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Mail, Phone, Calendar, HeartPulse, ShieldAlert, 
  FileText, Download, Loader2, Clock, Activity, FileSpreadsheet
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

  const fetchDashboardData = async () => {
    try {
      const [aptsRes, profileRes, prescRes] = await Promise.all([
        api.get('/appointments'),
        api.get(`/patients/${user.id}`),
        api.get('/prescriptions').catch(() => ({ data: [] }))
      ]);

      const patientApts = (aptsRes.data || []).filter(apt => apt.patient === user.id || apt.patientId === user.id);
      setAppointments(patientApts);
      setPatientProfile(profileRes.data);
      
      const patientPresc = (prescRes.data || []).filter(p => p.patientId === user.id || p.patient === user.id);
      setPrescriptions(patientPresc);
    } catch (err) {
      console.error("Patient dashboard load failed:", err.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user.id]);

  const handleDownload = (fileUrl) => {
    if (!fileUrl) return;
    toast.success("Opening report file...");
    window.open(fileUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <span className="text-sm font-bold text-slate-500">Retrieving patient dashboard metrics...</span>
      </div>
    );
  }

  if (error || !patientProfile) {
    return (
      <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center text-xs font-bold text-slate-500 flex flex-col items-center justify-center gap-3">
        <ShieldAlert className="w-10 h-10 text-amber-500" />
        <span>No Data Available</span>
        <p className="text-[10px] text-slate-400 font-semibold max-w-xs">
          Unable to establish secure connection with your patient record. Please check backend services status.
        </p>
      </div>
    );
  }

  // Get recent 5 appointments sorted by date/time
  const recentAppointments = [...appointments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Greeting Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Hello, {patientProfile.name || user?.name}!
        </h1>
        <p className="text-sm text-slate-500 font-semibold">
          Access your clinical health vault, appointments history, and digital prescriptions.
        </p>
      </div>

      {/* Grid: Profile Card & Recent Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Profile Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                {(patientProfile.name || user?.name || 'P').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">{patientProfile.name || user?.name}</h3>
                <span className="text-[9px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mt-0.5 inline-block">
                  Patient Profile
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{patientProfile.email || user?.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{patientProfile.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>DOB: {patientProfile.dob || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Gender: {patientProfile.gender || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <HeartPulse className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Blood Group: <strong className="text-primary font-black">{patientProfile.bloodGroup || 'Not specified'}</strong></span>
              </div>
              <div className="flex items-start gap-2.5 pt-2 border-t border-slate-100">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Allergies</span>
                  <span className="text-slate-800 text-[11px] font-bold block mt-0.5 leading-relaxed">
                    {patientProfile.allergies || 'None declared'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link 
              to="/patient/profile" 
              className="w-full py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              Update Medical Profile
            </Link>
          </div>
        </div>

        {/* 2. Recent Appointments Panel */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-primary" />
                Recent Appointments
              </h3>
              <Link 
                to="/patient/appointments"
                className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
              >
                View History
              </Link>
            </div>

            {recentAppointments.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Calendar className="w-8 h-8 opacity-30 text-slate-400" />
                <span>No Appointments Available</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] pb-2">
                      <th className="py-2.5">Doctor</th>
                      <th className="py-2.5">Department</th>
                      <th className="py-2.5">Date & Time</th>
                      <th className="py-2.5">Reason</th>
                      <th className="py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {recentAppointments.map(apt => (
                      <tr key={apt.id || apt._id}>
                        <td className="py-3 font-bold text-slate-800">{apt.doctorName || 'Specialist'}</td>
                        <td className="py-3">{apt.department || 'Clinical'}</td>
                        <td className="py-3">
                          <span className="block font-bold">{apt.date}</span>
                          <span className="text-[10px] text-slate-450 font-normal">{apt.time}</span>
                        </td>
                        <td className="py-3 max-w-[150px] truncate text-slate-500" title={apt.reason}>{apt.reason}</td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            apt.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                            apt.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
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

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link 
              to="/patient/book" 
              className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
            >
              Book New Appointment Checkup
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Uploaded Files & Prescription History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 3. Uploaded Files Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4.5 h-4.5 text-primary" />
                Uploaded Diagnostic Files
              </h3>
              <Link 
                to="/patient/records"
                className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
              >
                Upload File
              </Link>
            </div>

            {(!patientProfile.medicalReports || patientProfile.medicalReports.length === 0) ? (
              <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <FileText className="w-8 h-8 opacity-30 text-slate-400" />
                <span>No Data Available</span>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
                {patientProfile.medicalReports.map((report, idx) => (
                  <div key={report.id || report._id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-slate-800 font-extrabold block truncate">{report.type}</span>
                        <span className="text-[10px] text-slate-500 block truncate font-medium mt-0.5">{report.description}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Uploaded on: {new Date(report.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(report.fileUrl)}
                      className="p-2 border border-slate-200 hover:bg-slate-150 rounded-xl text-slate-700 bg-white cursor-pointer transition-colors"
                      title="Download/View File"
                    >
                      <Download className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. Prescription History Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-primary" />
                Prescription History
              </h3>
              <Link 
                to="/patient/prescriptions"
                className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
              >
                All Prescriptions
              </Link>
            </div>

            {prescriptions.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <FileText className="w-8 h-8 opacity-30 text-slate-400" />
                <span>No Data Available</span>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
                {prescriptions.map(presc => (
                  <div key={presc.id || presc._id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs font-semibold">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <div>
                        <span className="font-extrabold text-slate-800 block">Diagnosis: {presc.diagnosis}</span>
                        <span className="text-[10px] text-slate-450 block font-medium mt-0.5">Prescribed by {presc.doctorName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">{presc.date}</span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Medicines ({presc.medicines?.length || 0})</span>
                      <div className="flex flex-wrap gap-1.5">
                        {presc.medicines?.map((med, idx) => (
                          <span key={idx} className="px-2 py-1 bg-white border border-slate-200 text-slate-700 text-[10px] rounded-lg">
                            {med.name} - <strong className="text-primary font-bold">{med.dosage}</strong>
                          </span>
                        ))}
                      </div>
                    </div>

                    {presc.notes && (
                      <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-100 leading-normal">
                        "Advice: {presc.notes}"
                      </p>
                    )}
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
