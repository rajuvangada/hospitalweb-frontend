import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthAppContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { FileText, Printer, Eye, Calendar, User, Search, ShieldAlert, Upload, Download, Clipboard } from 'lucide-react';
import { TableSkeleton } from '../components/ui/Skeleton';

export default function Prescriptions() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tab layout: 'clinic' (from doctor api) or 'uploads' (patient uploads)
  const [activeTab, setActiveTab] = useState('clinic');
  const [activePresc, setActivePresc] = useState(null);

  // Patient Upload Form State
  const [uploadFormData, setUploadFormData] = useState({
    doctorId: '',
    description: '',
    fileName: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [uploadedRecords, setUploadedRecords] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);

  const fetchPrescriptions = async () => {
    try {
      const [prescRes, docsRes] = await Promise.all([
        api.get('/prescriptions').catch(() => ({ data: [] })),
        api.get('/doctors').catch(() => ({ data: [] }))
      ]);

      const filtered = (prescRes.data || []).filter(p => p.patientId === user.id || p.patient === user.id);
      setPrescriptions(filtered);
      setDoctorsList(docsRes.data || [
        { id: "doc-1", name: "Dr. Sarah Jenkins" },
        { id: "doc-2", name: "Dr. Gregory House" },
        { id: "doc-3", name: "Dr. Clara Oswald" }
      ]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load prescriptions list");
    } finally {
      setLoading(false);
    }
  };

  const loadUploads = () => {
    try {
      const uploads = JSON.parse(localStorage.getItem('uploaded_prescriptions') || '[]');
      const filtered = uploads.filter(r => r.patientId === user.id);
      setUploadedRecords(filtered);
    } catch (e) {
      setUploadedRecords([]);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    loadUploads();
  }, [user.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadFormData.doctorId || !uploadFormData.description || !uploadFormData.fileName) {
      toast.error("Please fill in all upload parameters");
      return;
    }

    const doctor = doctorsList.find(d => d.id === uploadFormData.doctorId || d._id === uploadFormData.doctorId);

    const newRecord = {
      id: `up-rx-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: user.id,
      patientName: user.name,
      doctorName: doctor?.name || "Clinic Specialist",
      doctorId: uploadFormData.doctorId,
      description: uploadFormData.description,
      fileName: uploadFormData.fileName,
      date: uploadFormData.date,
      status: "Pending",
      notes: "" // doctor notes
    };

    try {
      const allUploads = JSON.parse(localStorage.getItem('uploaded_prescriptions') || '[]');
      allUploads.push(newRecord);
      localStorage.setItem('uploaded_prescriptions', JSON.stringify(allUploads));
      
      toast.success("Prescription document uploaded successfully! Pending doctor review.");
      setUploadFormData({
        doctorId: '',
        description: '',
        fileName: '',
        date: new Date().toISOString().split('T')[0]
      });
      loadUploads();
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  const handleDownloadFile = (record) => {
    toast.success(`Downloading simulated PDF document: ${record.fileName}`);
    // Simulated file download
    const element = document.createElement("a");
    const file = new Blob([
      `CARELINK PRESCRIPTION RECORD\n` +
      `-----------------------------\n` +
      `Record ID: ${record.id}\n` +
      `Uploaded Date: ${record.date}\n` +
      `Patient ID: ${record.patientId}\n` +
      `Target Doctor: ${record.doctorName}\n` +
      `Description: ${record.description}\n` +
      `Status: ${record.status}\n` +
      `Doctor Notes: ${record.notes || 'None'}\n`
    ], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${record.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Search filter
  const filteredClinicPrescriptions = prescriptions.filter(p => {
    const term = searchQuery.toLowerCase();
    return (
      (p.doctorName || '').toLowerCase().includes(term) ||
      (p.diagnosis || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 text-left font-sans animate-in fade-in-30">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#111827] font-display">Prescription Records</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Access active dosage instructions or upload prescriptions for specialist reviews.</p>
        </div>
        
        {/* Search */}
        {activeTab === 'clinic' && (
          <div className="relative max-w-xs w-full self-start sm:self-auto group">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none group-focus-within:text-primary">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search diagnosis or doctor..."
              className="w-full h-10 pl-9 pr-4 bg-white border border-[#E6E1DA] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20"
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E6E1DA] gap-6 text-xs font-extrabold uppercase tracking-widest text-slate-400">
        <button
          onClick={() => setActiveTab('clinic')}
          className={`pb-3 cursor-pointer ${activeTab === 'clinic' ? 'border-b-2 border-[#EA580C] text-[#111827]' : 'hover:text-slate-700'}`}
        >
          Doctor Prescriptions
        </button>
        <button
          onClick={() => setActiveTab('uploads')}
          className={`pb-3 cursor-pointer ${activeTab === 'uploads' ? 'border-b-2 border-[#EA580C] text-[#111827]' : 'hover:text-slate-700'}`}
        >
          My Uploaded Prescriptions
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={3} />
      ) : activeTab === 'clinic' ? (
        /* Doctor Clinical Prescriptions Tab */
        filteredClinicPrescriptions.length === 0 ? (
          <div className="p-12 bg-white border border-[#E6E1DA] rounded-2xl text-center text-xs font-bold text-slate-400 flex flex-col items-center justify-center gap-2">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
            <span>No prescriptions found.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredClinicPrescriptions.map(presc => (
              <div 
                key={presc.id || presc._id} 
                className="bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-sm hover:border-[#EA580C]/40 transition-all flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-[#E6E1DA] pb-3">
                    <span className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1"><Calendar className="w-4 h-4" /> {presc.date}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider block">Diagnosis</span>
                    <h3 className="font-extrabold text-base text-[#111827] mt-1 font-display capitalize">{presc.diagnosis}</h3>
                    <span className="text-xs text-slate-500 font-semibold block mt-1.5">Prescribed by {presc.doctorName}</span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#E6E1DA]">
                    <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider block">Medications ({presc.medicines?.length || 0})</span>
                    <div className="divide-y divide-slate-100">
                      {presc.medicines?.map((med, idx) => (
                        <div key={idx} className="py-2 flex justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800 block">{med.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{med.instructions}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-[#EA580C] block">{med.dosage}</span>
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{med.frequency} ({med.duration})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E6E1DA] mt-2">
                  <button
                    onClick={() => setActivePresc(presc)}
                    className="w-full py-2.5 bg-slate-50 border border-[#E6E1DA] hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-display"
                  >
                    <Eye className="w-4 h-4 text-slate-500" /> View Prescription PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Patient Prescription Uploads Tab */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Upload Form (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#111827] border-b border-[#E6E1DA] pb-2 font-display flex items-center gap-2">
              <Upload className="w-4.5 h-4.5 text-[#EA580C]" /> Upload Prescription
            </h3>
            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-450 tracking-wider">Select Specialist Doctor</label>
                <select
                  required
                  value={uploadFormData.doctorId}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, doctorId: e.target.value }))}
                  className="w-full h-11 px-3 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs"
                >
                  <option value="">Choose physician...</option>
                  {doctorsList.map(doc => (
                    <option key={doc.id || doc._id} value={doc.id || doc._id}>{doc.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-450 tracking-wider">Prescription Description</label>
                <input
                  type="text"
                  required
                  value={uploadFormData.description}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Heart diagnostics checkup history"
                  className="w-full h-11 px-4 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-450 tracking-wider">Document Name / File</label>
                <input
                  type="text"
                  required
                  value={uploadFormData.fileName}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, fileName: e.target.value }))}
                  placeholder="e.g. rx_report_cardio.pdf"
                  className="w-full h-11 px-4 bg-slate-50 border border-[#E6E1DA] rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 uppercase tracking-wider text-[10px] cursor-pointer shadow-md transition-all shadow-[#EA580C]/25"
              >
                <Upload className="w-4 h-4" /> Submit Document
              </button>
            </form>
          </div>

          {/* Upload Logs History (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#111827] border-b border-[#E6E1DA] pb-2 font-display">
              Prescription History Logs
            </h3>

            {uploadedRecords.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">No uploaded prescription files recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E6E1DA] text-slate-400 font-extrabold uppercase tracking-widest text-[9px] pb-2">
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Doctor</th>
                      <th className="py-2.5">File Name</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                    {uploadedRecords.map(rec => (
                      <tr key={rec.id} className="hover:bg-slate-50/50">
                        <td className="py-3">{rec.date}</td>
                        <td className="py-3 font-bold text-slate-800">{rec.doctorName}</td>
                        <td className="py-3 max-w-[120px] truncate text-slate-400" title={rec.fileName}>{rec.fileName}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            rec.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' :
                            rec.status === 'Rejected' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-605'
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => handleDownloadFile(rec)}
                            className="p-1.5 border border-[#E6E1DA] hover:bg-slate-100 rounded-lg text-slate-700 bg-white cursor-pointer inline-flex items-center"
                            title="Download Record Summary"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Print PDF Modal */}
      {activePresc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in-20">
          <div className="max-w-2xl w-full bg-white text-slate-800 border border-[#E6E1DA] rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
            
            {/* Modal Controls */}
            <div className="p-4 border-b border-[#E6E1DA] bg-slate-50 rounded-t-2xl flex justify-between items-center print:hidden">
              <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">Prescription Letterhead</span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-1.5 bg-[#EA580C] hover:bg-[#EA580C]/95 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-display"
                >
                  <Printer className="w-4 h-4" /> Print / Save
                </button>
                <button
                  onClick={() => setActivePresc(null)}
                  className="px-3 py-1.5 border border-[#E6E1DA] hover:bg-slate-100 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Print Container */}
            <div className="p-8 flex-1 overflow-y-auto space-y-8 print:p-0 print:overflow-visible text-left text-xs font-semibold text-slate-600" id="printable-prescription">
              <div className="flex justify-between items-start border-b-2 border-[#EA580C] pb-5">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-[#EA580C] font-display">CareLink Clinics</h2>
                  <p className="text-slate-500 font-bold mt-1">123 Health Ave, Health City</p>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-slate-700 text-sm font-display uppercase tracking-wider">Rx Routine Sheet</div>
                  <div>Rx ID: PRX-{(activePresc.id || activePresc._id).toUpperCase().substring(0, 8)}</div>
                  <div>Date: {activePresc.date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 bg-slate-50 border border-[#E6E1DA] p-4 rounded-xl">
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Patient Name</span>
                  <div className="font-extrabold text-slate-700 text-sm font-display">{activePresc.patientName || user.name}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Prescribing Doctor</span>
                  <div className="font-extrabold text-slate-700 text-sm font-display">{activePresc.doctorName}</div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Clinical Diagnosis</span>
                <p className="text-sm font-extrabold text-slate-700 capitalize font-display">{activePresc.diagnosis}</p>
              </div>

              <div className="space-y-3">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Rx Medications</span>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-500 font-bold">
                      <th className="py-2">Medicine details</th>
                      <th className="py-2 text-center">Dosage</th>
                      <th className="py-2 text-center">Frequency</th>
                      <th className="py-2 text-center">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {activePresc.medicines?.map((med, idx) => (
                      <tr key={idx}>
                        <td className="py-3">
                          <div className="font-bold text-slate-800">{med.name}</div>
                          <div className="text-[10px] text-slate-400 italic font-medium">{med.instructions}</div>
                        </td>
                        <td className="py-3 text-center text-[#EA580C]">{med.dosage}</td>
                        <td className="py-3 text-center">{med.frequency}</td>
                        <td className="py-3 text-center">{med.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {activePresc.notes && (
                <div className="space-y-2 border-t border-[#E6E1DA] pt-4">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Special Instructions</span>
                  <p className="italic text-slate-500">"{activePresc.notes}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
