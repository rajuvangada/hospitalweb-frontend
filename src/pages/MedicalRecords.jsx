import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthAppContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Table } from '../components/ui/Table';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Download, Plus, FileText, Loader2, ShieldAlert } from 'lucide-react';

export default function MedicalRecords() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  
  // Upload modal state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // Form fields
  const [type, setType] = useState('Blood Test');
  const [doctorName, setDoctorName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);

  const fetchRecords = async () => {
    try {
      const res = await api.get(`/patients/${user.id}`);
      setRecords(res.data.medicalReports || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load medical records from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user.id]);

  const handleDownload = (row) => {
    if (!row.fileUrl) return;
    toast.success("Opening report file attachment...");
    window.open(row.fileUrl, '_blank');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!doctorName || !description || !file) {
      toast.error("Please fill in all fields and select a file to upload");
      return;
    }
    
    setUploadLoading(true);
    const toastId = toast.loading("Uploading diagnostic file to S3...");
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('doctorName', doctorName);
    formData.append('description', description);

    try {
      await api.post(`/patients/${user.id}/reports`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success("Medical record uploaded successfully!", { id: toastId });
      setUploadOpen(false);
      setDoctorName('');
      setDescription('');
      setFile(null);
      fetchRecords();
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || "Failed to commit record file";
      toast.error(errMsg, { id: toastId });
    } finally {
      setUploadLoading(false);
    }
  };

  const columns = [
    { 
      header: "Date Uploaded", 
      key: "date", 
      sortable: true,
      render: (row) => new Date(row.date).toLocaleDateString()
    },
    { 
      header: "Record Type", 
      key: "type", 
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-slate-800 dark:text-slate-100">{row.type}</span>
        </div>
      )
    },
    { header: "Practitioner", key: "doctorName", sortable: true },
    { 
      header: "Summary Description", 
      key: "description",
      render: (row) => <span className="line-clamp-1 max-w-xs text-slate-400">{row.description}</span>
    }
  ];

  const actions = (row) => (
    <button
      onClick={() => handleDownload(row)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#3B82F6]/20 bg-[#3B82F6]/5 hover:bg-[#3B82F6]/10 text-[#3B82F6] font-bold text-[10px] rounded-lg transition-colors cursor-pointer uppercase tracking-wider font-display"
    >
      <Download className="w-3.5 h-3.5" />
      View File
    </button>
  );

  return (
    <div className="space-y-6 text-left font-sans animate-in fade-in-30">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-850 dark:text-white font-display">Medical Records</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Access and manage your lipid panels, clinical diagnostics, and diagnostic report documents.</p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="h-11 px-5 bg-[#0F4C81] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#0F4C81]/95 transition-all shadow-md flex items-center gap-1.5 cursor-pointer self-start sm:self-auto font-display"
        >
          <Plus className="w-4.5 h-4.5" />
          Upload Record
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : records.length === 0 ? (
        <div className="p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xs font-bold text-slate-400 flex flex-col items-center justify-center gap-2">
          <ShieldAlert className="w-8 h-8 text-amber-500" />
          <span>No medical records archived yet</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <Table
            columns={columns}
            data={records}
            searchKeys={["type", "doctorName", "description"]}
            searchPlaceholder="Search by test type or doctor..."
            pageSize={6}
            actions={actions}
          />
        </div>
      )}

      {/* Upload Record Modal */}
      {uploadOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-20">
          <div className="max-w-md w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl relative z-10 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-extrabold text-base text-slate-850 dark:text-white font-display">Upload Diagnostics</h3>
              <button 
                onClick={() => setUploadOpen(false)} 
                className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* Type select */}
              <div className="space-y-2 text-[10px] font-extrabold text-slate-450 dark:text-slate-550 uppercase tracking-wider">
                <label>Document Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Blood Test">Blood Test / Lipid Panel</option>
                  <option value="X-Ray">Chest / Bone X-Ray</option>
                  <option value="MRI Scan">Brain / Joint MRI Scan</option>
                  <option value="Urine Analysis">Urine Analysis Report</option>
                  <option value="General Checkup">General Diagnostic Summary</option>
                </select>
              </div>

              {/* Doctor */}
              <div className="space-y-2 text-[10px] font-extrabold text-slate-450 dark:text-slate-550 uppercase tracking-wider">
                <label>Practitioner Doctor Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-xs font-bold text-slate-400">Dr.</span>
                  <input
                    type="text"
                    required
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="Elena Rostova"
                    className="w-full h-11 pl-11 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 text-[10px] font-extrabold text-slate-450 dark:text-slate-550 uppercase tracking-wider">
                <label>Key Test Summary Findings</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Fasting glucose level of 95 mg/dL. Normal ECG."
                  rows="3"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* File input */}
              <div className="space-y-2 text-[10px] font-extrabold text-slate-450 dark:text-slate-550 uppercase tracking-wider">
                <label>Attach PDF or Image file</label>
                <input
                  type="file"
                  required
                  onChange={handleFileChange}
                  accept=".pdf,image/*"
                  className="w-full text-xs font-semibold text-slate-650 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary file:cursor-pointer"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={uploadLoading}
                className="w-full h-11 bg-[#0F4C81] hover:bg-[#0F4C81]/95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-75 cursor-pointer font-display"
              >
                {uploadLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload File"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
