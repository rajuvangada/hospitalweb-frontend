import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  Users, Calendar, Wallet, ArrowRight,
  Activity, ShieldAlert, Loader2, Stethoscope, Clock, AlertTriangle, UserPlus,
  FileText, ShieldCheck, Cpu
} from 'lucide-react';
import { LineChart, DonutChart } from '../components/ui/CustomCharts';

// Fallback Mock Datasets for Demo / Dev modes
const mockDoctorsCount = 14;
const mockPatientsCount = 128;
const mockAppointments = [
  { id: "apt-1", patientName: "Arthur Pendragon", doctorName: "Dr. Clara Oswald", date: "2026-06-17", time: "10:00 AM", status: "Completed" },
  { id: "apt-2", patientName: "Ginevra Weasley", doctorName: "Dr. Sarah Jenkins", date: "2026-06-17", time: "11:30 AM", status: "Completed" },
  { id: "apt-3", patientName: "Bruce Wayne", doctorName: "Dr. Sarah Jenkins", date: "2026-06-18", time: "09:00 AM", status: "Scheduled" },
  { id: "apt-4", patientName: "Selina Kyle", doctorName: "Dr. Clara Oswald", date: "2026-06-18", time: "02:00 PM", status: "Scheduled" },
  { id: "apt-5", patientName: "Peter Parker", doctorName: "Dr. Gregory House", date: "2026-06-19", time: "04:15 PM", status: "Scheduled" }
];
const mockRevenue = 5820;

const mockRevenueChartData = [
  { label: "Mon", value: 750 },
  { label: "Tue", value: 980 },
  { label: "Wed", value: 890 },
  { label: "Thu", value: 1240 },
  { label: "Fri", value: 1410 },
  { label: "Sat", value: 920 },
  { label: "Sun", value: 680 }
];

const mockDepartmentChartData = [
  { label: "Cardiology", value: 40, color: "#EA580C" },
  { label: "Pediatrics", value: 25, color: "#3B82F6" },
  { label: "Neurology", value: 15, color: "#06B6D4" },
  { label: "General Med", value: 20, color: "#22C55E" }
];

const mockLowInventory = [
  { item: "Paracetamol 650mg Tabs", stock: 12, unit: "boxes", status: "Critical" },
  { item: "Amoxicillin 500mg Caps", stock: 45, unit: "bottles", status: "Warning" },
  { item: "Disposable Syringes 5ml", stock: 80, unit: "units", status: "Warning" }
];

const mockDoctorPerformance = [
  { name: "Dr. Sarah Jenkins", dept: "Cardiology", consultations: 48, rating: 5.0 },
  { name: "Dr. Gregory House", dept: "Diagnostics", consultations: 32, rating: 4.8 },
  { name: "Dr. Clara Oswald", dept: "Pediatrics", consultations: 26, rating: 4.9 }
];

const mockSystemLogs = [
  { time: "05:30 PM", action: "Admin completed pharmacy invoice settlement inv-8814." },
  { time: "04:45 PM", action: "Dr. Jenkins signed prescriptions for Arthur Pendragon." },
  { time: "03:20 PM", action: "Patient Ginevra Weasley modified demographics details." },
  { time: "01:10 PM", action: "S3 health records directory daily database backup finalized." }
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [patientsCount, setPatientsCount] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [revenueTotal, setRevenueTotal] = useState(0);
  const [pendingUploadsCount, setPendingUploadsCount] = useState(0);

  const fetchAdminStats = async () => {
    try {
      const [docsRes, patsRes, aptsRes, revRes] = await Promise.all([
        api.get('/doctors').catch(() => ({ data: [] })),
        api.get('/patients').catch(() => ({ data: [] })),
        api.get('/appointments').catch(() => ({ data: [] })),
        api.get('/revenue').catch(() => ({ data: [] }))
      ]);

      const doctors = docsRes.data || [];
      const patients = patsRes.data || [];
      const apts = aptsRes.data || [];

      setDoctorsCount(doctors.length || mockDoctorsCount);
      setPatientsCount(patients.length || mockPatientsCount);
      setAppointments(apts.length > 0 ? apts : mockAppointments);
      
      const paidRev = (revRes.data || [])
        .filter(r => r.status === 'Paid')
        .reduce((acc, curr) => acc + curr.amount, 0);
        
      setRevenueTotal(paidRev || mockRevenue);

      // Read uploaded prescriptions count
      const allUploads = JSON.parse(localStorage.getItem('uploaded_prescriptions') || '[]');
      const pending = allUploads.filter(r => r.status === 'Pending').length;
      setPendingUploadsCount(pending);

    } catch (err) {
      console.error("Admin dashboard fetch error, using mockup data:", err);
      setDoctorsCount(mockDoctorsCount);
      setPatientsCount(mockPatientsCount);
      setAppointments(mockAppointments);
      setRevenueTotal(mockRevenue);
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

  const recentActivities = [...appointments]
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    .slice(0, 5);

  return (
    <div className="space-y-6 text-left font-sans animate-in fade-in-30">
      
      {/* Greeting Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-display">
          Clinic Administration
        </h1>
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
          Executive Workspace. Manage practitioners, audit registrations, and monitor patient logs.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Stethoscope className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Practitioners</span>
            <span className="text-base font-black text-foreground">{doctorsCount} active</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-505 flex items-center justify-center shrink-0">
            <Users className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Patients Case</span>
            <span className="text-base font-black text-foreground">{patientsCount} total</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Calendar className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Consultations</span>
            <span className="text-base font-black text-foreground">{appointments.length} active</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center shrink-0">
            <FileText className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Uploads Audits</span>
            <span className="text-base font-black text-foreground">{pendingUploadsCount} Pending</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4 sm:col-span-2 lg:col-span-1">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Wallet className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Billings Flow</span>
            <span className="text-base font-black text-foreground">${revenueTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LineChart 
            data={mockRevenueChartData} 
            title="Weekly Revenue Flow" 
            subtitle="Audit performance of checkup billing records (USD)"
          />
        </div>
        <div>
          <DonutChart 
            data={mockDepartmentChartData} 
            title="Patient Demographics Split" 
            subtitle="Hospital consultation department breakdown"
          />
        </div>
      </div>

      {/* Main split: Recent activities and alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Recent Activity log */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border pb-3 font-display">
            <Activity className="w-4.5 h-4.5 text-primary" />
            Clinical Consultation Audit Logs
          </h3>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {recentActivities.map((act, idx) => (
              <div key={act.id || act._id || idx} className="p-3 bg-muted/20 border border-border rounded-xl space-y-1.5 text-xs font-semibold">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-foreground">Appointment Confirmed</span>
                  <span className="text-muted-foreground text-[10px]">{act.date}</span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Patient <strong className="text-foreground">{act.patientName || 'Anonymous'}</strong> scheduled checkup with <strong className="text-foreground">{act.doctorName || act.doctor || 'Specialist'}</strong> on {act.date} at {act.time}.
                </p>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    act.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600' :
                    act.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-650'
                  }`}>
                    {act.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Alerts & Navigation */}
        <div className="space-y-6">
          {/* Pharmacy Low Inventory Alert Box */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border pb-3 font-display mb-4">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
              Low Stock Warnings
            </h3>
            
            <div className="space-y-3">
              {mockLowInventory.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-semibold p-2.5 bg-muted/20 border border-border rounded-xl">
                  <div>
                    <span className="text-foreground block font-bold">{item.item}</span>
                    <span className="text-[10px] text-muted-foreground block">Stock: {item.stock} {item.unit}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                    item.status === 'Critical' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Row: Doctor Performance Index & System Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* Doctor Performance */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 text-xs font-semibold">
          <h3 className="text-sm font-extrabold text-foreground border-b border-border pb-3 font-display flex items-center gap-2">
            <Stethoscope className="w-4.5 h-4.5 text-primary" />
            Practitioner Performance Index
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground pb-2">
                  <th className="py-2.5">Doctor</th>
                  <th className="py-2.5">Department</th>
                  <th className="py-2.5 text-center">Consultations</th>
                  <th className="py-2.5 text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/10 font-bold text-slate-655">
                {mockDoctorPerformance.map((doc, idx) => (
                  <tr key={idx}>
                    <td className="py-3 text-foreground">{doc.name}</td>
                    <td className="py-3">{doc.dept}</td>
                    <td className="py-3 text-center">{doc.consultations} Cases</td>
                    <td className="py-3 text-right flex items-center justify-end gap-1 text-[#EA580C]">
                      <span>{doc.rating.toFixed(1)}</span>
                      <Star className="w-3.5 h-3.5 fill-[#EA580C]" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Activity Logs */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 text-xs font-semibold">
          <h3 className="text-sm font-extrabold text-foreground border-b border-border pb-3 font-display flex items-center gap-2">
            <Cpu className="w-4.5 h-4.5 text-primary" />
            System Audit & Activity Logs
          </h3>
          <div className="space-y-3.5">
            {mockSystemLogs.map((log, idx) => (
              <div key={idx} className="flex gap-3 items-start p-2 bg-muted/10 border border-border/60 rounded-xl">
                <span className="text-[10px] text-primary font-black uppercase tracking-wider block shrink-0">{log.time}</span>
                <p className="text-muted-foreground font-semibold leading-relaxed">{log.action}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
