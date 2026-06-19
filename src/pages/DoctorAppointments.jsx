import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthAppContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Table } from '../components/ui/Table';
import { TableSkeleton } from '../components/ui/Skeleton';
import { FileText, XCircle, Eye } from 'lucide-react';

const mockApts = [
  {
    id: "apt-101",
    patientName: "Alexander Carter",
    patientId: "pat-12",
    date: "2026-06-18",
    time: "10:30 AM",
    reason: "Chronic migraine and visual auras",
    symptoms: "Severe pulsating pain on left side, sensitivity to light, nausea for 3 days.",
    status: "Scheduled"
  },
  {
    id: "apt-102",
    patientName: "Emily Watson",
    patientId: "pat-45",
    date: "2026-06-18",
    time: "11:15 AM",
    reason: "Post-op checkup (Laparoscopy)",
    symptoms: "Minor abdominal soreness, healing incisions are clean with no discharge.",
    status: "Scheduled"
  },
  {
    id: "apt-103",
    patientName: "Marcus Vance",
    patientId: "pat-89",
    date: "2026-06-17",
    time: "09:00 AM",
    reason: "Hypertension therapy monitoring",
    symptoms: "Mild fatigue in the mornings. Average BP reading 138/88 mmHg.",
    status: "Completed",
    diagnosis: "Essential Stage 1 Hypertension, controlled",
    notes: "Continue Valsartan 80mg daily. Patient advised to reduce sodium intake and review in 3 months."
  },
  {
    id: "apt-104",
    patientName: "Sophia Martinez",
    patientId: "pat-32",
    date: "2026-06-16",
    time: "02:30 PM",
    reason: "Persistent throat pain and dry cough",
    symptoms: "Tickling throat sensation, painful swallowing, low-grade fever.",
    status: "Cancelled"
  }
];

export default function DoctorAppointments() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  
  // View Details Modal
  const [selectedApt, setSelectedApt] = useState(null);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      const filtered = res.data.filter(apt => apt.doctorId === user?.id || apt.doctor === user?.id);
      
      if (filtered.length === 0 && user?.id === 'test-user-id') {
        setAppointments(mockApts);
      } else {
        setAppointments(filtered);
      }
    } catch (err) {
      console.error("Failed to load appointments:", err);
      if (user?.id === 'test-user-id') {
        setAppointments(mockApts);
      } else {
        toast.error("Failed to load appointments registry.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAppointments();
    }
  }, [user?.id]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    
    try {
      if (user?.id === 'test-user-id' || id.startsWith('apt-')) {
        // Mock cancellation locally
        setAppointments(prev => 
          prev.map(apt => apt.id === id ? { ...apt, status: 'Cancelled' } : apt)
        );
        toast.success("Appointment cancelled successfully (Demo Mode).");
        return;
      }
      await api.put(`/appointments/${id}`, { status: 'Cancelled' });
      toast.success("Appointment cancelled successfully.");
      fetchAppointments();
    } catch (err) {
      toast.error("Failed to cancel appointment.");
    }
  };

  // Filter
  const filteredApts = appointments.filter(apt => {
    if (statusFilter === 'All') return true;
    return apt.status === statusFilter;
  });

  const columns = [
    { 
      header: "Patient Name", 
      key: "patientName", 
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
            {row.patientName ? row.patientName.charAt(0).toUpperCase() : 'P'}
          </div>
          <span className="font-extrabold text-slate-800 dark:text-slate-100">{row.patientName}</span>
        </div>
      )
    },
    { header: "Date", key: "date", sortable: true },
    { header: "Time", key: "time", sortable: true },
    { 
      header: "Reason for Visit", 
      key: "reason",
      render: (row) => <span className="line-clamp-1 max-w-[200px] text-slate-500 dark:text-slate-400 font-medium">{row.reason}</span>
    },
    { 
      header: "Status", 
      key: "status", 
      sortable: true,
      render: (row) => {
        let badgeColor = "bg-primary/10 text-primary";
        if (row.status === 'Cancelled') badgeColor = "bg-danger/10 text-danger";
        if (row.status === 'Completed') badgeColor = "bg-success/10 text-success";
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
            {row.status}
          </span>
        );
      }
    }
  ];

  const actions = (row) => (
    <div className="flex gap-2">
      <button
        onClick={() => setSelectedApt(row)}
        className="p-1.5 border border-border hover:bg-muted text-foreground rounded-lg transition-colors cursor-pointer"
        title="View details"
      >
        <Eye className="w-4 h-4" />
      </button>

      {row.status === 'Scheduled' && (
        <>
          <Link
            to={`/doctor/write-prescription?aptId=${row.id}`}
            className="p-1.5 border border-primary/25 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg transition-colors flex items-center justify-center"
            title="Prescribe Rx & Complete"
          >
            <FileText className="w-4 h-4" />
          </Link>
          <button
            onClick={() => handleCancel(row.id)}
            className="p-1.5 border border-danger/25 hover:bg-danger/10 text-danger rounded-lg transition-colors cursor-pointer"
            title="Cancel Appointment"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6 text-left font-sans animate-in fade-in-30">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-display">Clinic Appointments Manager</h1>
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Monitor schedules, check in patients, write prescriptions or handle cancellations.</p>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <Table
            columns={columns}
            data={filteredApts}
            searchKeys={["patientName", "reason", "date"]}
            searchPlaceholder="Search by patient name, reason, or date..."
            pageSize={7}
            actions={actions}
            filterElement={
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 px-3 bg-muted/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            }
          />
        </div>
      )}

      {/* Details Modal */}
      {selectedApt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-20">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl relative z-10 space-y-6">
            
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h3 className="font-extrabold text-base text-foreground font-display">Appointment Details</h3>
              <button 
                onClick={() => setSelectedApt(null)} 
                className="text-xs text-muted-foreground hover:text-foreground font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {selectedApt.patientName ? selectedApt.patientName.charAt(0).toUpperCase() : 'P'}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-foreground font-display">{selectedApt.patientName}</h4>
                  <p className="text-[10px] text-muted-foreground font-medium">Patient ID: {selectedApt.patientId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-1">
                <div className="bg-muted/40 border border-border p-2.5 rounded-xl">
                  <span className="text-[10px] text-muted-foreground uppercase block font-bold">Scheduled time</span>
                  <span className="text-foreground mt-0.5 block font-bold">{selectedApt.date} at {selectedApt.time}</span>
                </div>
                <div className="bg-muted/40 border border-border p-2.5 rounded-xl">
                  <span className="text-[10px] text-muted-foreground uppercase block font-bold">Status</span>
                  <span className="text-foreground mt-0.5 block capitalize font-bold">{selectedApt.status}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-semibold">
                <h5 className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Reason for Visit</h5>
                <p className="text-foreground bg-muted/20 border border-border p-3 rounded-xl leading-relaxed font-medium">
                  {selectedApt.reason || "No summary provided."}
                </p>
              </div>

              {selectedApt.symptoms && (
                <div className="space-y-2 text-xs font-semibold">
                  <h5 className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Reported Symptoms</h5>
                  <p className="text-foreground bg-muted/20 border border-border p-3 rounded-xl leading-relaxed font-medium">
                    {selectedApt.symptoms}
                  </p>
                </div>
              )}

              {selectedApt.status === 'Completed' && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <h5 className="text-xs font-extrabold text-success font-display">Prescribed Diagnosis Findings</h5>
                  <div className="text-xs space-y-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-bold block">DIAGNOSIS</span>
                      <span className="text-foreground font-bold block mt-0.5">{selectedApt.diagnosis || "Unspecified"}</span>
                    </div>
                    {selectedApt.notes && (
                      <div>
                        <span className="text-[10px] text-muted-foreground font-bold block">ADVICE NOTES</span>
                        <span className="text-foreground block font-medium leading-relaxed mt-0.5">{selectedApt.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

