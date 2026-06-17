import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthAppContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { FileText, Printer, Eye, Calendar, User, Search, ShieldAlert } from 'lucide-react';
import { TableSkeleton } from '../components/ui/Skeleton';

export default function Prescriptions() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Print Modal
  const [activePresc, setActivePresc] = useState(null);

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get('/prescriptions');
      const filtered = res.data.filter(p => p.patientId === user.id);
      setPrescriptions(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load prescriptions list from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [user.id]);

  const handlePrint = () => {
    window.print();
  };

  // Search
  const filteredPrescriptions = prescriptions.filter(p => {
    const term = searchQuery.toLowerCase();
    return (
      p.doctorName.toLowerCase().includes(term) ||
      p.diagnosis.toLowerCase().includes(term) ||
      p.medicines.some(m => m.name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">My Prescriptions</h1>
          <p className="text-sm text-slate-500">Access active medicine dosages, schedules and advice written by doctors.</p>
        </div>
        
        {/* Search */}
        <div className="relative max-w-xs w-full self-start sm:self-auto">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search diagnosis or pill..."
            className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-805 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TableSkeleton rows={3} cols={2} />
          <TableSkeleton rows={3} cols={2} />
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center text-xs font-bold text-slate-500 flex flex-col items-center justify-center gap-2">
          <ShieldAlert className="w-8 h-8 text-amber-500" />
          <span>No Data Available</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPrescriptions.map(presc => (
            <div 
              key={presc.id} 
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4.5 h-4.5 text-primary" />
                    <span className="text-xs font-bold text-slate-500">{presc.date}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[9px] font-bold text-emerald-500 uppercase tracking-wider">
                    Active
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Diagnosis</span>
                  <h3 className="font-extrabold text-sm text-slate-900 capitalize">{presc.diagnosis}</h3>
                  <span className="text-xs text-slate-550 font-bold flex items-center gap-1 mt-1">
                    <User className="w-3.5 h-3.5" /> Prescribed by {presc.doctorName}
                  </span>
                </div>

                {/* Medicines preview */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Medications ({presc.medicines.length})</span>
                  <div className="divide-y divide-slate-100">
                    {presc.medicines.map((med, idx) => (
                      <div key={idx} className="py-2 flex justify-between text-xs font-semibold">
                        <div>
                          <span className="text-slate-800 block font-bold">{med.name}</span>
                          <span className="text-[10px] text-slate-450 block font-medium">{med.instructions}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-primary block font-bold">{med.dosage}</span>
                          <span className="text-[10px] text-slate-450 block font-medium">{med.frequency} ({med.duration})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {presc.notes && (
                  <p className="text-xs text-slate-500 leading-relaxed italic border-t border-slate-100 pt-3">
                    "Doctor's Advice: {presc.notes}"
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 mt-2 flex gap-3">
                <button
                  onClick={() => setActivePresc(presc)}
                  className="flex-1 h-10 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  View PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Print PDF Modal */}
      {activePresc && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in-20">
          <div className="max-w-2xl w-full bg-white text-slate-800 border border-slate-350 rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
            
            {/* Modal Controls */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl flex justify-between items-center print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prescription PDF Document</span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-1.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save
                </button>
                <button
                  onClick={() => setActivePresc(null)}
                  className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Print Container */}
            <div className="p-8 flex-1 overflow-y-auto space-y-8 print:p-0 print:overflow-visible" id="printable-prescription">
              {/* Header Letterhead */}
              <div className="flex justify-between items-start border-b-2 border-primary pb-5">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-primary">ApolloHMS CLINIC</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">742 Medical Center Blvd, Health City</p>
                  <p className="text-xs text-slate-500 font-semibold">Phone: +1 (555) 012-HMS1 | Email: records@apollohms.com</p>
                </div>
                <div className="text-right text-xs font-semibold text-slate-500">
                  <div className="font-extrabold text-slate-700 text-sm">PRESCRIPTION ROUTINE</div>
                  <div className="mt-1">Rx ID: PRX-{activePresc.id.toUpperCase()}</div>
                  <div>Date: {activePresc.date}</div>
                </div>
              </div>

              {/* Patient and Doctor metadata */}
              <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Patient Name</span>
                  <div className="font-black text-slate-700 text-sm">{activePresc.patientName}</div>
                  <div className="text-slate-500 font-medium">Patient ID: {activePresc.patientId}</div>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Prescribing Doctor</span>
                  <div className="font-black text-slate-700 text-sm">{activePresc.doctorName}</div>
                  <div className="text-slate-500 font-medium">Practitioner</div>
                </div>
              </div>

              {/* Diagnostic block */}
              <div className="space-y-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Clinical Diagnosis</span>
                <p className="text-sm font-extrabold text-slate-700 capitalize">{activePresc.diagnosis}</p>
              </div>

              {/* Rx prescription table */}
              <div className="space-y-3">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Rx Medications</span>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-500 font-bold">
                      <th className="py-2">Medicine details</th>
                      <th className="py-2 text-center">Dosage</th>
                      <th className="py-2 text-center">Frequency</th>
                      <th className="py-2 text-center">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {activePresc.medicines.map((med, idx) => (
                      <tr key={idx}>
                        <td className="py-3">
                          <div className="font-bold text-slate-800">{med.name}</div>
                          <div className="text-[10px] text-slate-400 italic font-medium">{med.instructions}</div>
                        </td>
                        <td className="py-3 text-center">{med.dosage}</td>
                        <td className="py-3 text-center">{med.frequency}</td>
                        <td className="py-3 text-center">{med.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Doctor's signature section */}
              {activePresc.notes && (
                <div className="space-y-2 border-t border-slate-200 pt-4">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Special Instructions</span>
                  <p className="text-xs italic text-slate-600 leading-relaxed">"{activePresc.notes}"</p>
                </div>
              )}

              {/* Footer signature lines */}
              <div className="flex justify-between items-end pt-12 border-t border-slate-100">
                <div className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  <div>* Auto-authorized electronically by doctor credentials.</div>
                  <div>* Please present this sheet at the pharmacist register.</div>
                </div>
                <div className="text-center w-40 border-t border-slate-400 pt-1.5 text-xs font-bold text-slate-600">
                  Practitioner Signature
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
