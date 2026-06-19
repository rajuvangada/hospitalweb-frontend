import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthAppContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Table } from '../components/ui/Table';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Info, Calendar, XCircle, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AppointmentHistory() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Details Modal
  const [activeApt, setActiveApt] = useState(null);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      const filtered = res.data.filter(apt => apt.patientId === user.id || apt.patient === user.id);
      setAppointments(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load appointment records from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user.id]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    const cancelToastId = toast.loading("Cancelling appointment slot...");
    try {
      await api.put(`/appointments/${id}`, { status: 'Cancelled' });
      toast.success("Appointment cancelled successfully", { id: cancelToastId });
      fetchAppointments();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to cancel appointment";
      toast.error(errMsg, { id: cancelToastId });
    }
  };

  // Filter
  const filteredData = appointments.filter(apt => {
    if (selectedStatus === 'All') return true;
    return apt.status === selectedStatus;
  });

  const columns = [
    { 
      header: "Practitioner", 
      key: "doctorName", 
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
            {row.doctorName ? row.doctorName.replace("Dr. ", "").charAt(0) : 'D'}
          </div>
          <span className="font-extrabold text-slate-800 dark:text-slate-100">{row.doctorName || 'Specialist'}</span>
        </div>
      )
    },
    { header: "Specialty", key: "department", sortable: true },
    { header: "Date", key: "date", sortable: true },
    { header: "Time Slot", key: "time", sortable: true },
    { 
      header: "Status", 
      key: "status", 
      sortable: true,
      render: (row) => {
        let badgeColor = "bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400";
        if (row.status === 'Cancelled') badgeColor = "bg-red-500/10 text-red-500";
        if (row.status === 'Completed') badgeColor = "bg-emerald-500/10 text-emerald-500";
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${badgeColor}`}>
            {row.status || 'Scheduled'}
          </span>
        );
      }
    }
  ];

  const tableActions = (row) => (
    <div className="flex gap-2">
      <button
        onClick={() => setActiveApt(row)}
        className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 rounded-lg transition-colors cursor-pointer"
        title="View details"
      >
        <Info className="w-4 h-4" />
      </button>
      {(row.status === 'Scheduled' || !row.status) && (
        <button
          onClick={() => handleCancel(row.id || row._id)}
          className="p-1.5 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg transition-colors cursor-pointer bg-white dark:bg-slate-900"
          title="Cancel appointment"
        >
          <XCircle className="w-4 h-4 text-danger" />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6 text-left font-sans animate-in fade-in-30">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-850 dark:text-white font-display">My Appointments</h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Trace your consultations schedule history and cancel active checkups.</p>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : appointments.length === 0 ? (
        <div className="p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xs font-bold text-slate-400 flex flex-col items-center justify-center gap-2">
          <ShieldAlert className="w-8 h-8 text-amber-500" />
          <span>No appointments booked yet</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <Table
            columns={columns}
            data={filteredData}
            searchKeys={["doctorName", "department", "reason"]}
            searchPlaceholder="Search by doctor or specialty..."
            pageSize={6}
            actions={tableActions}
            filterElement={
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-11 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/25"
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
      {activeApt && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-20">
          <div className="max-w-lg w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl relative z-10 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-extrabold text-base text-slate-850 dark:text-white font-display">Consultation Details</h3>
              <button 
                onClick={() => setActiveApt(null)} 
                className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  {activeApt.doctorName ? activeApt.doctorName.replace("Dr. ", "").charAt(0) : 'D'}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white font-display">{activeApt.doctorName}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{activeApt.department} Specialty</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1">
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block">Scheduled time</span>
                  <span className="text-slate-800 dark:text-slate-200 mt-1 block">{activeApt.date} at {activeApt.time}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block">Status</span>
                  <span className="text-slate-800 dark:text-slate-200 mt-1 block capitalize">{activeApt.status || 'Scheduled'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Reason for Visit</h5>
                <p className="text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl leading-relaxed">
                  {activeApt.reason || "No visit details summary."}
                </p>
              </div>

              {activeApt.symptoms && (
                <div className="space-y-2">
                  <h5 className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Symptoms Reported</h5>
                  <p className="text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl leading-relaxed">
                    {activeApt.symptoms}
                  </p>
                </div>
              )}

              {activeApt.status === 'Completed' && (
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <h5 className="text-xs font-bold text-primary dark:text-blue-450 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Clinical Diagnostics
                  </h5>
                  <div className="text-xs space-y-2 text-slate-650 dark:text-slate-400">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-550 font-bold block">DIAGNOSIS</span>
                      <span className="text-slate-850 dark:text-slate-200 font-bold block mt-0.5">{activeApt.diagnosis || "Unspecified"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-550 font-bold block">CLINICAL ADVICE NOTES</span>
                      <span className="text-slate-850 dark:text-slate-200 block leading-relaxed mt-0.5">{activeApt.notes || "None."}</span>
                    </div>
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
