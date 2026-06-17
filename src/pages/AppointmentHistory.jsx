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
      const filtered = res.data.filter(apt => apt.patientId === user.id);
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
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
            {row.doctorName.replace("Dr. ", "").charAt(0)}
          </div>
          <span>{row.doctorName}</span>
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
        let badgeColor = "bg-primary/10 text-primary";
        if (row.status === 'Cancelled') badgeColor = "bg-red-500/10 text-red-500";
        if (row.status === 'Completed') badgeColor = "bg-emerald-500/10 text-emerald-500";
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
            {row.status}
          </span>
        );
      }
    }
  ];

  const tableActions = (row) => (
    <div className="flex gap-2">
      <button
        onClick={() => setActiveApt(row)}
        className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors cursor-pointer"
        title="View details"
      >
        <Info className="w-4 h-4" />
      </button>
      {row.status === 'Scheduled' && (
        <button
          onClick={() => handleCancel(row.id)}
          className="p-1.5 border border-red-200 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
          title="Cancel appointment"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Appointment Archive</h1>
        <p className="text-sm text-slate-500">Trace your consultations schedule history and cancel active checkups.</p>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : appointments.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center text-xs font-bold text-slate-500 flex flex-col items-center justify-center gap-2">
          <ShieldAlert className="w-8 h-8 text-amber-500" />
          <span>No Data Available</span>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
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
                className="h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/25"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in-20">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl relative z-10 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-base text-slate-900">Consultation Details</h3>
              <button 
                onClick={() => setActiveApt(null)} 
                className="text-xs text-slate-400 hover:text-slate-900 font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {activeApt.doctorName.replace("Dr. ", "").charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{activeApt.doctorName}</h4>
                  <p className="text-[10px] text-slate-400">{activeApt.department} Specialty</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1">
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase block">Scheduled time</span>
                  <span className="text-slate-800 mt-0.5 block">{activeApt.date} at {activeApt.time}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase block">Status</span>
                  <span className="text-slate-800 mt-0.5 block capitalize">{activeApt.status}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Reason for Visit</h5>
                <p className="text-slate-800 bg-slate-50 border border-slate-200 p-3 rounded-xl leading-relaxed">
                  {activeApt.reason || "No visit details summary."}
                </p>
              </div>

              {activeApt.symptoms && (
                <div className="space-y-2">
                  <h5 className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Symptoms Reported</h5>
                  <p className="text-slate-800 bg-slate-50 border border-slate-200 p-3 rounded-xl leading-relaxed">
                    {activeApt.symptoms}
                  </p>
                </div>
              )}

              {activeApt.status === 'Completed' && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h5 className="text-xs font-bold text-primary flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> Clinical Diagnostics
                  </h5>
                  <div className="text-xs space-y-2 text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">DIAGNOSIS</span>
                      <span className="text-slate-800 font-bold block mt-0.5">{activeApt.diagnosis || "Unspecified"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">CLINICAL ADVICE NOTES</span>
                      <span className="text-slate-800 block leading-relaxed mt-0.5">{activeApt.notes || "None."}</span>
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
