import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthAppContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  Calendar, Clock, User, FileText, ChevronRight, ChevronLeft, 
  Loader2, BadgeDollarSign, HeartPulse, ShieldAlert 
} from 'lucide-react';

export default function BookAppointment() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Data
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Selections
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [symptoms, setSymptoms] = useState('');

  const departments = ["Cardiology", "Pediatrics", "Neurology", "Dermatology"];

  useEffect(() => {
    const loadBookingRequirements = async () => {
      try {
        const [docsRes, aptsRes] = await Promise.all([
          api.get('/doctors'),
          api.get('/appointments')
        ]);
        setDoctors(docsRes.data);
        setAppointments(aptsRes.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load clinical directory.");
      } finally {
        setLoadingDocs(false);
      }
    };
    loadBookingRequirements();
  }, []);

  const filteredDoctors = doctors.filter(doc => !selectedDept || doc.specialty === selectedDept);
  const selectedDoctor = doctors.find(d => d.id === selectedDocId);

  // Generate Available Time Slots based on selected doctor parameters
  const getAvailableSlots = () => {
    if (!selectedDoctor || !selectedDate) return [];

    const slots = [];
    const [startHour, startMin] = selectedDoctor.shiftStart.split(':').map(Number);
    const [endHour, endMin] = selectedDoctor.shiftEnd.split(':').map(Number);
    const duration = selectedDoctor.slotDuration || 30;

    let current = new Date();
    current.setHours(startHour, startMin, 0, 0);

    const end = new Date();
    end.setHours(endHour, endMin, 0, 0);

    // Fetch dates already occupied in the database
    const dayBookedTimes = appointments
      .filter(apt => apt.doctorId === selectedDocId && apt.date === selectedDate && apt.status !== 'Cancelled')
      .map(apt => apt.time);

    while (current < end) {
      const timeStr = current.toTimeString().split(' ')[0].substring(0, 5);
      
      if (!dayBookedTimes.includes(timeStr)) {
        slots.push(timeStr);
      }
      current.setMinutes(current.getMinutes() + duration);
    }
    return slots;
  };

  const timeSlots = getAvailableSlots();

  const handleBook = async () => {
    setLoading(true);
    const toastId = toast.loading("Reserving appointment timeslot...");
    const payload = {
      doctorId: selectedDocId,
      date: selectedDate,
      time: selectedTime,
      reason,
      symptoms
    };

    try {
      await api.post('/appointments', payload);
      toast.success("Appointment booked successfully!", { id: toastId });
      navigate('/patient/appointments');
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || "Booking request failed";
      toast.error(errMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!selectedDept || !selectedDocId)) {
      toast.error("Please choose a department and specialist");
      return;
    }
    if (step === 2 && (!selectedDate || !selectedTime)) {
      toast.error("Please specify a date and available timeslot");
      return;
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  if (loadingDocs) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <span className="text-sm font-bold text-slate-500">Retrieving clinic availability stats...</span>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center text-xs font-bold text-slate-500 flex flex-col items-center justify-center gap-2">
        <ShieldAlert className="w-8 h-8 text-amber-500" />
        <span>No Data Available</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Book Medical Consultation</h1>
        <p className="text-sm text-slate-500">Complete scheduling checkups in three quick stepper points.</p>
      </div>

      {/* Stepper points */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-xs font-bold text-slate-500">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : ''}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${step >= 1 ? 'border-primary bg-primary/10' : 'border-slate-300'}`}>1</span>
          <span>Practitioner Selection</span>
        </div>
        <div className="h-px bg-slate-200 flex-1 mx-4" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : ''}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${step >= 2 ? 'border-primary bg-primary/10' : 'border-slate-300'}`}>2</span>
          <span>Date & Time</span>
        </div>
        <div className="h-px bg-slate-200 flex-1 mx-4" />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : ''}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${step >= 3 ? 'border-primary bg-primary/10' : 'border-slate-300'}`}>3</span>
          <span>Reason & Review</span>
        </div>
      </div>

      {/* Steps panel */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        
        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Department</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {departments.map(dept => (
                  <button
                    type="button"
                    key={dept}
                    onClick={() => { setSelectedDept(dept); setSelectedDocId(''); }}
                    className={`p-3 text-xs font-bold border rounded-xl text-center transition-all cursor-pointer ${
                      selectedDept === dept 
                        ? 'bg-primary border-primary text-white shadow-sm' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Choose Specialist Doctor</label>
              {filteredDoctors.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-xs font-bold text-slate-400">
                  No Data Available in the selected specialty.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDoctors.map(doc => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-start gap-4 ${
                        selectedDocId === doc.id 
                          ? 'bg-primary/5 border-primary ring-2 ring-primary/10' 
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {doc.name.replace("Dr. ", "").charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-sm text-slate-900">{doc.name}</h4>
                        <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {doc.specialty}
                        </span>
                        <p className="text-[11px] text-slate-500 leading-relaxed pt-1">{doc.bio || 'Consulting practitioner'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Date</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                    className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
                  />
                </div>
              </div>

              {selectedDoctor && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-semibold text-slate-500 space-y-2">
                  <h4 className="text-slate-800 font-bold text-sm flex items-center gap-1">
                    <HeartPulse className="w-4 h-4 text-primary" /> Clinic Working Hours
                  </h4>
                  <div>Active Shifts: {selectedDoctor.shiftStart} - {selectedDoctor.shiftEnd}</div>
                  <div>Consultation Size: {selectedDoctor.slotDuration} minutes</div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Time Slots</label>
              {!selectedDate ? (
                <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-xs font-bold text-slate-400">
                  Select a scheduling date to search practitioner slots.
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-xs font-bold text-slate-400">
                  No Data Available: Doctor has no open slots on this date.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {timeSlots.map(time => (
                    <button
                      type="button"
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2.5 text-xs font-bold border rounded-xl text-center transition-all cursor-pointer ${
                        selectedTime === time 
                          ? 'bg-primary border-primary text-white shadow-sm' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Reason for Visit</label>
                  <input
                    type="text"
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Health Vitals Diagnostic Review"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Symptoms</label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Describe any warning indicators or complaints..."
                    rows="3"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
                  />
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 pb-2 border-b border-slate-200">Consultation Summary</h3>
                <div className="space-y-2.5 text-xs font-semibold text-slate-500">
                  <div className="flex justify-between">
                    <span>Doctor:</span>
                    <span className="text-slate-800 font-bold">{selectedDoctor?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Specialty:</span>
                    <span className="text-slate-800 font-bold">{selectedDoctor?.specialty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Schedule Date:</span>
                    <span className="text-slate-800 font-bold">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timeslot:</span>
                    <span className="text-slate-800 font-bold">{selectedTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Stepper buttons */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex justify-between items-center">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-5 h-11 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-5 h-11 bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleBook}
              disabled={loading || !reason}
              className="px-6 h-11 bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Booking Checkup...
                </>
              ) : (
                "Confirm Schedule"
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
