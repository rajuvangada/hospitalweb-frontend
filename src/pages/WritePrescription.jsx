import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthAppContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Save, FileText, User, ShieldAlert, Loader2 } from 'lucide-react';

export default function WritePrescription() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const aptId = searchParams.get('aptId') || '';

  const [loading, setLoading] = useState(false);
  const [loadingApts, setLoadingApts] = useState(true);

  // Data
  const [appointments, setAppointments] = useState([]);
  const [selectedAptId, setSelectedAptId] = useState(aptId);

  // Form Fields
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '1 tablet', frequency: 'Once daily', duration: '7 days', instructions: 'Take after meals' }
  ]);

  useEffect(() => {
    const fetchApts = async () => {
      try {
        const res = await api.get('/appointments');
        const docApts = res.data.filter(apt => apt.doctorId === user.id && apt.status === 'Scheduled');
        setAppointments(docApts);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load patient appointments queue");
      } finally {
        setLoadingApts(false);
      }
    };
    fetchApts();
  }, [user.id]);

  useEffect(() => {
    if (aptId) setSelectedAptId(aptId);
  }, [aptId]);

  const activeApt = appointments.find(a => a.id === selectedAptId);

  // Array builders
  const handleAddMedicine = () => {
    setMedicines(prev => [
      ...prev,
      { name: '', dosage: '1 tablet', frequency: 'Once daily', duration: '7 days', instructions: 'Take after meals' }
    ]);
  };

  const handleRemoveMedicine = (idx) => {
    if (medicines.length === 1) {
      toast.error("A prescription requires at least one medication");
      return;
    }
    setMedicines(prev => prev.filter((_, i) => i !== idx));
  };

  const handleMedChange = (idx, field, value) => {
    setMedicines(prev => {
      const copy = [...prev];
      copy[idx][field] = value;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAptId) {
      toast.error("Please pick a patient appointment card");
      return;
    }
    if (!diagnosis.trim()) {
      toast.error("Please input a diagnosis summary");
      return;
    }
    if (medicines.some(m => !m.name.trim())) {
      toast.error("Please fill in medication names for all rows");
      return;
    }

    setLoading(true);
    const writeToastId = toast.loading("Submitting prescription sheet...");

    const payload = {
      appointmentId: selectedAptId,
      patientId: activeApt.patientId,
      diagnosis,
      notes,
      medicines
    };

    try {
      await api.post('/prescriptions', payload);
      toast.success("Prescription submitted successfully!", { id: writeToastId });
      navigate('/doctor/appointments');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Failed to submit prescription";
      toast.error(errMsg, { id: writeToastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Write Medical Prescription</h1>
        <p className="text-sm text-slate-500">Formulate prescriptions and set checking schedules.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Select Appointment */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Patient Checkup Queue Card</label>
            {loadingApts ? (
              <div className="h-11 bg-slate-100 animate-pulse rounded-xl" />
            ) : appointments.length === 0 && !aptId ? (
              <div className="p-5 border border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-400 text-center">
                No active scheduled appointments in your queue.
              </div>
            ) : (
              <select
                value={selectedAptId}
                onChange={(e) => setSelectedAptId(e.target.value)}
                disabled={!!aptId}
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-805 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-75 disabled:cursor-not-allowed font-semibold"
              >
                {!aptId && <option value="">-- Select Patient Appointment --</option>}
                {aptId && activeApt ? (
                  <option value={activeApt.id}>{activeApt.patientName} (Apt ID: {activeApt.id})</option>
                ) : (
                  appointments.map(apt => (
                    <option key={apt.id} value={apt.id}>
                      {apt.patientName} - {apt.date} at {apt.time} ({apt.reason})
                    </option>
                  ))
                )}
              </select>
            )}
          </div>

          {/* Patient info banner */}
          {activeApt && (
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex flex-col sm:flex-row justify-between text-xs font-semibold text-slate-500 gap-3">
              <div className="flex items-center gap-2">
                <User className="w-4.5 h-4.5 text-primary shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-450 font-bold block">Patient Target:</span>
                  <span className="text-slate-800 font-bold block mt-0.5">{activeApt.patientName}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-primary shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-450 font-bold block">Checkup Reason:</span>
                  <span className="text-slate-800 font-bold block mt-0.5">{activeApt.reason}</span>
                </div>
              </div>
              {activeApt.symptoms && (
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4.5 h-4.5 text-primary shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-450 font-bold block">Symptoms:</span>
                    <span className="text-slate-800 block mt-0.5 italic">{activeApt.symptoms}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Diagnosis & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Clinical Diagnosis</label>
              <input
                type="text"
                required
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Hypertension, Seasonal Flu"
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">General Advice & Guidelines</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Bed rest, avoid fried items"
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
              />
            </div>
          </div>

          {/* Medicines Builder */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Rx Medications</label>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="px-3.5 py-1.5 bg-primary/10 border border-primary/20 text-primary font-bold text-xs rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Row
              </button>
            </div>

            <div className="space-y-3">
              {medicines.map((med, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl items-center relative group">
                  
                  {/* Name */}
                  <div className="md:col-span-3 space-y-1">
                    <span className="text-[10px] text-slate-450 font-bold md:hidden">Medicine Name</span>
                    <input
                      type="text"
                      required
                      value={med.name}
                      onChange={(e) => handleMedChange(idx, 'name', e.target.value)}
                      placeholder="e.g. Paracetamol 650mg"
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-805 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Dosage */}
                  <div className="md:col-span-2 space-y-1">
                    <span className="text-[10px] text-slate-450 font-bold md:hidden">Dosage</span>
                    <input
                      type="text"
                      required
                      value={med.dosage}
                      onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                      placeholder="e.g. 1 tablet"
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Frequency */}
                  <div className="md:col-span-2 space-y-1">
                    <span className="text-[10px] text-slate-450 font-bold md:hidden">Frequency</span>
                    <input
                      type="text"
                      required
                      value={med.frequency}
                      onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                      placeholder="e.g. 1-0-1"
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Duration */}
                  <div className="md:col-span-2 space-y-1">
                    <span className="text-[10px] text-slate-450 font-bold md:hidden">Duration</span>
                    <input
                      type="text"
                      required
                      value={med.duration}
                      onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                      placeholder="e.g. 5 days"
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Instructions */}
                  <div className="md:col-span-2 space-y-1">
                    <span className="text-[10px] text-slate-450 font-bold md:hidden">Instructions</span>
                    <input
                      type="text"
                      required
                      value={med.instructions}
                      onChange={(e) => handleMedChange(idx, 'instructions', e.target.value)}
                      placeholder="e.g. Take after food"
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Delete row */}
                  <div className="md:col-span-1 flex items-center justify-end pt-1 md:pt-0">
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(idx)}
                      className="p-2 text-red-500 border border-red-200 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Remove Row"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading || !selectedAptId}
              className="px-6 h-11 bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-75 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Prescribing Rx...
                </>
              ) : (
                <>
                  <Save className="w-4.5 h-4.5" />
                  Save Prescription
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
