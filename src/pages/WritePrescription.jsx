import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthAppContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Save, FileText, User, ShieldAlert, Loader2 } from 'lucide-react';

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
  }
];

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
        const docApts = res.data.filter(apt => (apt.doctorId === user.id || apt.doctor === user.id) && apt.status === 'Scheduled');
        if (docApts.length === 0 && user.id === 'test-user-id') {
          setAppointments(mockApts);
        } else {
          setAppointments(docApts);
        }
      } catch (err) {
        console.error("Failed to load appointments:", err);
        if (user.id === 'test-user-id') {
          setAppointments(mockApts);
        } else {
          toast.error("Failed to load patient appointments queue");
        }
      } finally {
        setLoadingApts(false);
      }
    };
    fetchApts();
  }, [user.id]);

  useEffect(() => {
    if (aptId) setSelectedAptId(aptId);
  }, [aptId]);

  // Handle case where activeApt might be in mockApts or appointments list
  const activeApt = appointments.find(a => a.id === selectedAptId) || 
    (user.id === 'test-user-id' ? mockApts.find(a => a.id === selectedAptId) : null);

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
      patientId: activeApt?.patientId || 'unknown-pat',
      diagnosis,
      notes,
      medicines
    };

    try {
      if (user.id === 'test-user-id' || selectedAptId.startsWith('apt-')) {
        // Simulating success in demo mode
        setTimeout(() => {
          toast.success("Prescription submitted successfully (Demo Mode)!", { id: writeToastId });
          navigate('/doctor/appointments');
        }, 800);
        return;
      }
      await api.post('/prescriptions', payload);
      toast.success("Prescription submitted successfully!", { id: writeToastId });
      navigate('/doctor/appointments');
    } catch (err) {
      console.error(err);
      if (user.id === 'test-user-id') {
        toast.success("Prescription submitted successfully (Demo Mode fallback)!", { id: writeToastId });
        navigate('/doctor/appointments');
      } else {
        const errMsg = err.response?.data?.message || "Failed to submit prescription";
        toast.error(errMsg, { id: writeToastId });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl text-left font-sans animate-in fade-in-30">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-display">Write Medical Prescription</h1>
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Formulate prescriptions and set checking schedules.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Select Appointment */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Patient Checkup Queue Card</label>
            {loadingApts ? (
              <div className="h-11 bg-muted/30 animate-pulse rounded-xl" />
            ) : appointments.length === 0 && !aptId ? (
              <div className="p-5 border border-dashed border-border rounded-xl text-xs font-bold text-muted-foreground text-center">
                No active scheduled appointments in your queue.
              </div>
            ) : (
              <select
                value={selectedAptId}
                onChange={(e) => setSelectedAptId(e.target.value)}
                disabled={!!aptId}
                className="w-full h-11 px-4 bg-muted/30 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-75 disabled:cursor-not-allowed font-semibold cursor-pointer"
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
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 text-xs font-semibold text-muted-foreground gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4.5 h-4.5 text-primary shrink-0" />
                <div>
                  <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">Patient Name</span>
                  <span className="text-foreground font-extrabold block mt-0.5">{activeApt.patientName}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-primary shrink-0" />
                <div>
                  <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">Checkup Reason</span>
                  <span className="text-foreground font-extrabold block mt-0.5">{activeApt.reason}</span>
                </div>
              </div>
              {activeApt.symptoms && (
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4.5 h-4.5 text-primary shrink-0" />
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">Symptoms</span>
                    <span className="text-foreground block mt-0.5 font-bold italic">{activeApt.symptoms}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Diagnosis & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Clinical Diagnosis</label>
              <input
                type="text"
                required
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Hypertension, Seasonal Flu"
                className="w-full h-11 px-4 bg-muted/30 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">General Advice & Guidelines</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Bed rest, avoid fried items"
                className="w-full h-11 px-4 bg-muted/30 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
              />
            </div>
          </div>

          {/* Medicines Builder */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rx Medications</label>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="px-3.5 py-1.5 bg-primary/10 border border-primary/25 text-primary font-bold text-xs rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Row
              </button>
            </div>

            <div className="space-y-3">
              {medicines.map((med, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-muted/20 border border-border rounded-2xl items-center relative group">
                  
                  {/* Name */}
                  <div className="md:col-span-3 space-y-1">
                    <span className="text-[10px] text-muted-foreground font-bold md:hidden">Medicine Name</span>
                    <input
                      type="text"
                      required
                      value={med.name}
                      onChange={(e) => handleMedChange(idx, 'name', e.target.value)}
                      placeholder="e.g. Paracetamol 650mg"
                      className="w-full h-10 px-3 bg-card border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Dosage */}
                  <div className="md:col-span-2 space-y-1">
                    <span className="text-[10px] text-muted-foreground font-bold md:hidden">Dosage</span>
                    <input
                      type="text"
                      required
                      value={med.dosage}
                      onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                      placeholder="e.g. 1 tablet"
                      className="w-full h-10 px-3 bg-card border border-border rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Frequency */}
                  <div className="md:col-span-2 space-y-1">
                    <span className="text-[10px] text-muted-foreground font-bold md:hidden">Frequency</span>
                    <input
                      type="text"
                      required
                      value={med.frequency}
                      onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                      placeholder="e.g. 1-0-1"
                      className="w-full h-10 px-3 bg-card border border-border rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Duration */}
                  <div className="md:col-span-2 space-y-1">
                    <span className="text-[10px] text-muted-foreground font-bold md:hidden">Duration</span>
                    <input
                      type="text"
                      required
                      value={med.duration}
                      onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                      placeholder="e.g. 5 days"
                      className="w-full h-10 px-3 bg-card border border-border rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Instructions */}
                  <div className="md:col-span-2 space-y-1">
                    <span className="text-[10px] text-muted-foreground font-bold md:hidden">Instructions</span>
                    <input
                      type="text"
                      required
                      value={med.instructions}
                      onChange={(e) => handleMedChange(idx, 'instructions', e.target.value)}
                      placeholder="e.g. Take after food"
                      className="w-full h-10 px-3 bg-card border border-border rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Delete row */}
                  <div className="md:col-span-1 flex items-center justify-end pt-1 md:pt-0">
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(idx)}
                      className="p-2 text-danger border border-danger/20 hover:bg-danger/10 rounded-xl transition-colors cursor-pointer"
                      title="Remove Row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={loading || !selectedAptId}
              className="px-6 h-11 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
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

