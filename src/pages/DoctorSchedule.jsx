import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthAppContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Save, Loader2, Clock, ShieldAlert } from 'lucide-react';

export default function DoctorSchedule() {
  const { user, updateProfileState } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  const [shiftStart, setShiftStart] = useState('09:00');
  const [shiftEnd, setShiftEnd] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [daysOff, setDaysOff] = useState([0, 6]);

  const daysOfWeek = [
    { name: "Sunday", val: 0 },
    { name: "Monday", val: 1 },
    { name: "Tuesday", val: 2 },
    { name: "Wednesday", val: 3 },
    { name: "Thursday", val: 4 },
    { name: "Friday", val: 5 },
    { name: "Saturday", val: 6 }
  ];

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await api.get(`/doctors/${user.id}`);
        const data = res.data;
        setShiftStart(data.shiftStart || '09:00');
        setShiftEnd(data.shiftEnd || '17:00');
        setSlotDuration(data.slotDuration || 30);
        setDaysOff(data.daysOff || [0, 6]);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load doctor schedule settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [user.id]);

  const handleDayOffToggle = (dayVal) => {
    setDaysOff(prev => {
      if (prev.includes(dayVal)) {
        return prev.filter(d => d !== dayVal);
      } else {
        return [...prev, dayVal].sort();
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    const saveToastId = toast.loading("Saving scheduling slots configuration...");

    const payload = {
      shiftStart,
      shiftEnd,
      slotDuration: Number(slotDuration),
      daysOff
    };

    try {
      const res = await api.put(`/doctors/${user.id}`, payload);
      updateProfileState(res.data);
      toast.success("Active schedule constraints saved successfully!", { id: saveToastId });
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Failed to save schedule settings";
      toast.error(errMsg, { id: saveToastId });
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <span className="text-sm font-bold text-slate-500">Retrieving scheduler parameters...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Schedule Configuration</h1>
        <p className="text-sm text-slate-500">Configure shift ranges, checkup slot intervals, and select weekly days off.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Shift Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Shift Starts At</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Clock className="w-4.5 h-4.5" />
                </span>
                <input
                  type="time"
                  required
                  value={shiftStart}
                  onChange={(e) => setShiftStart(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-805 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Shift Ends At</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Clock className="w-4.5 h-4.5" />
                </span>
                <input
                  type="time"
                  required
                  value={shiftEnd}
                  onChange={(e) => setShiftEnd(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-805 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Slot Duration */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Appointment slot duration</label>
            <div className="grid grid-cols-4 gap-3">
              {[15, 20, 30, 45].map(dur => (
                <button
                  type="button"
                  key={dur}
                  onClick={() => setSlotDuration(dur)}
                  className={`p-3 text-xs font-bold border rounded-xl text-center transition-all cursor-pointer ${
                    slotDuration === dur 
                      ? 'bg-primary border-primary text-white shadow-sm' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {dur} Min
                </button>
              ))}
            </div>
          </div>

          {/* Weekly Days Off */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Weekly Days Off (Check to disable bookings)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {daysOfWeek.map(day => {
                const isSelected = daysOff.includes(day.val);
                return (
                  <button
                    type="button"
                    key={day.val}
                    onClick={() => handleDayOffToggle(day.val)}
                    className={`p-3 text-xs font-bold border rounded-xl text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isSelected 
                        ? 'bg-red-500/10 border-red-300 text-red-650' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-750'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center ${
                      isSelected ? 'border-red-500 bg-red-500 text-white text-[9px] font-black' : 'border-slate-300'
                    }`}>
                      {isSelected && "✓"}
                    </span>
                    <span>{day.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saveLoading}
              className="px-6 h-11 bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
            >
              {saveLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4.5 h-4.5" />
                  Save Settings
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
