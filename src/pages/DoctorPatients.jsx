import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthAppContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Table } from '../components/ui/Table';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Eye, Phone, ShieldAlert, Heart, Calendar, ShieldX } from 'lucide-react';

export default function DoctorPatients() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  
  // Data
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  // Inspect Modal
  const [inspectPat, setInspectPat] = useState(null);

  const loadPatientsData = async () => {
    try {
      const [patsRes, aptsRes, prscRes] = await Promise.all([
        api.get('/patients'),
        api.get('/appointments'),
        api.get('/prescriptions')
      ]);

      // Filter patients that have booked at least one appointment with this doctor
      const docAptPatIds = new Set(
        aptsRes.data
          .filter(apt => apt.doctorId === user.id)
          .map(apt => apt.patientId)
      );

      const associatedPatients = patsRes.data.filter(pat => docAptPatIds.has(pat.id));
      setPatients(associatedPatients);
      setAppointments(aptsRes.data);
      setPrescriptions(prscRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load clinical patient data from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatientsData();
  }, [user.id]);

  // Calculations for modal
  const selectedPatApts = appointments.filter(apt => apt.patientId === inspectPat?.id && apt.doctorId === user.id);
  const selectedPatPrsc = prescriptions.filter(p => p.patientId === inspectPat?.id && p.doctorId === user.id);

  const columns = [
    { 
      header: "Patient Name", 
      key: "name", 
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-bold">{row.name}</span>
        </div>
      )
    },
    { header: "Gender", key: "gender", sortable: true },
    { header: "Blood Type", key: "bloodGroup", sortable: true },
    { header: "Phone Number", key: "phone" },
    { header: "Emergency Contact", key: "emergencyContact" }
  ];

  const actions = (row) => (
    <button
      onClick={() => setInspectPat(row)}
      className="inline-flex items-center gap-1 px-3 py-1.5 border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs rounded-lg transition-colors cursor-pointer"
    >
      <Eye className="w-3.5 h-3.5" />
      Inspect History
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Patient Directory</h1>
        <p className="text-sm text-slate-500">Search and review patient health files associated with your clinic visits.</p>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : patients.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center text-xs font-bold text-slate-500 flex flex-col items-center justify-center gap-2">
          <ShieldX className="w-8 h-8 text-amber-500" />
          <span>No Data Available</span>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <Table
            columns={columns}
            data={patients}
            searchKeys={["name", "phone", "bloodGroup"]}
            searchPlaceholder="Search patients by name or blood type..."
            pageSize={6}
            actions={actions}
          />
        </div>
      )}

      {/* Inspect Patient Modal */}
      {inspectPat && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in-20">
          <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl relative z-10 my-8 flex flex-col gap-6 max-h-[85vh]">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-base text-slate-900">Clinical History</h3>
              <button 
                onClick={() => setInspectPat(null)} 
                className="text-xs text-slate-400 hover:text-slate-950 font-bold"
              >
                Close
              </button>
            </div>

            {/* Content box */}
            <div className="overflow-y-auto space-y-6 flex-1 pr-2">
              
              {/* Demographics Card */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {inspectPat.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{inspectPat.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">DOB: {inspectPat.dob} ({inspectPat.gender})</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {inspectPat.phone}</p>
                  </div>
                </div>
                <div className="text-sm text-right space-y-1 font-semibold text-slate-500">
                  <div>Blood Group: <span className="text-primary font-bold">{inspectPat.bloodGroup}</span></div>
                  {inspectPat.allergies && (
                    <div className="text-[10px] text-red-500 flex items-center justify-end gap-1 font-bold">
                      <ShieldAlert className="w-3.5 h-3.5" /> Allergies: {inspectPat.allergies}
                    </div>
                  )}
                </div>
              </div>

              {/* Consultation History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-primary" /> Past Visit Consultations ({selectedPatApts.length})
                </h4>
                {selectedPatApts.length === 0 ? (
                  <p className="text-xs text-slate-400 font-bold italic pl-1">No visit records found.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedPatApts.map(apt => (
                      <div key={apt.id} className="border border-slate-200 rounded-xl p-3 text-xs space-y-2">
                        <div className="flex justify-between font-bold text-[10px] text-slate-400 uppercase">
                          <span>{apt.date} at {apt.time}</span>
                          <span className="text-primary">{apt.status}</span>
                        </div>
                        <p className="text-slate-800 font-bold">Reason: {apt.reason}</p>
                        {apt.symptoms && <p className="text-slate-500 leading-relaxed"><span className="font-bold text-[10px] text-slate-400">SYMPTOMS:</span> {apt.symptoms}</p>}
                        {apt.diagnosis && (
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1">
                            <div><span className="font-bold text-[10px] text-emerald-600">DIAGNOSIS:</span> {apt.diagnosis}</div>
                            {apt.notes && <div className="mt-1 text-slate-500"><span className="font-bold text-[10px] text-slate-400">DOCTOR NOTES:</span> {apt.notes}</div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Past Prescriptions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
                  <Heart className="w-4 h-4 text-primary" /> Prescriptions History ({selectedPatPrsc.length})
                </h4>
                {selectedPatPrsc.length === 0 ? (
                  <p className="text-xs text-slate-400 font-bold italic pl-1">No prescription logs found.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedPatPrsc.map(prsc => (
                      <div key={prsc.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                          <span>PRESCRIPTION DATE: {prsc.date}</span>
                          <span>Rx ID: {prsc.id.toUpperCase()}</span>
                        </div>
                        <div className="divide-y divide-slate-200">
                          {prsc.medicines.map((med, idx) => (
                            <div key={idx} className="py-1.5 flex justify-between font-semibold">
                              <div>
                                <span className="text-slate-800 font-bold">{med.name}</span>
                                <span className="text-[10px] text-slate-500 block font-medium mt-0.5">{med.instructions}</span>
                              </div>
                              <div className="text-right text-[11px]">
                                <span className="text-primary font-bold">{med.dosage}</span>
                                <span className="text-[10px] text-slate-500 block font-medium mt-0.5">{med.frequency} ({med.duration})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
