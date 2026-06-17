import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Table } from '../components/ui/Table';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Plus, Edit2, Trash2, Mail, Phone, Stethoscope, Briefcase, Loader2 } from 'lucide-react';

export default function AdminDoctors() {
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [selectedDept, setSelectedDept] = useState('All');

  // Modal forms
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [modalLoading, setModalLoading] = useState(false);
  const [activeDocId, setActiveDocId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: 'Cardiology',
    experience: '',
    bio: '',
    shiftStart: '09:00',
    shiftEnd: '17:00'
  });

  const departments = ["Cardiology", "Pediatrics", "Neurology", "Dermatology"];

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data);
    } catch (err) {
      toast.error("Failed to load doctors directories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialty: 'Cardiology',
      experience: '',
      bio: '',
      shiftStart: '09:00',
      shiftEnd: '17:00'
    });
    setModalMode('create');
    setModalOpen(true);
  };

  const handleOpenEdit = (doc) => {
    setFormData({
      name: doc.name,
      email: doc.email,
      phone: doc.phone || '',
      specialty: doc.specialty,
      experience: doc.experience || '',
      bio: doc.bio || '',
      shiftStart: doc.shiftStart || '09:00',
      shiftEnd: doc.shiftEnd || '17:00'
    });
    setActiveDocId(doc.id);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor's account?")) return;

    try {
      await api.delete(`/doctors/${id}`);
      toast.success("Doctor deleted successfully!");
      fetchDoctors();
    } catch (err) {
      toast.error("Failed to delete doctor.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (modalMode === 'create') {
        await api.post('/doctors', formData);
        toast.success("Doctor added successfully!");
      } else {
        await api.put(`/doctors/${activeDocId}`, formData);
        toast.success("Doctor updated successfully!");
      }
      setModalOpen(false);
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Filter
  const filteredDocs = doctors.filter(doc => {
    if (selectedDept === 'All') return true;
    return doc.specialty === selectedDept;
  });

  const columns = [
    { 
      header: "Doctor Name", 
      key: "name", 
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            {row.name.replace("Dr. ", "").charAt(0)}
          </div>
          <span className="font-bold">{row.name}</span>
        </div>
      )
    },
    { header: "Specialty Department", key: "specialty", sortable: true },
    { header: "Experience", key: "experience" },
    { header: "Contact Phone", key: "phone" },
    { header: "Email Address", key: "email" }
  ];

  const actions = (row) => (
    <div className="flex gap-2">
      <button
        onClick={() => handleOpenEdit(row)}
        className="p-1.5 border border-border/60 hover:bg-muted text-foreground rounded-lg transition-colors cursor-pointer"
        title="Edit Doctor"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleDelete(row.id)}
        className="p-1.5 border border-destructive/20 hover:bg-destructive/10 text-destructive rounded-lg transition-colors cursor-pointer"
        title="Delete Doctor"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Doctor Registry Manager</h1>
          <p className="text-sm text-muted-foreground">Add new specialist profiles, manage directories, configure scheduling hours or delete accounts.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="h-11 px-5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 transition-all shadow-md flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Practitioner
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : (
        <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
          <Table
            columns={columns}
            data={filteredDocs}
            searchKeys={["name", "email", "phone", "specialty"]}
            searchPlaceholder="Search doctors by name or department..."
            pageSize={6}
            actions={actions}
            filterElement={
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="h-11 px-3 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25"
              >
                <option value="All">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            }
          />
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in-20">
          <div className="max-w-xl w-full bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-xl relative z-10 my-8 space-y-5">
            <div className="flex justify-between items-center border-b border-border/30 pb-4">
              <h3 className="font-extrabold text-base text-foreground">
                {modalMode === 'create' ? "Add New Practitioner Doctor" : "Edit Doctor Profile Details"}
              </h3>
              <button 
                onClick={() => setModalOpen(false)} 
                className="text-xs text-muted-foreground hover:text-foreground font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Doctor Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Dr. Sarah Jenkins"
                    className="w-full h-10 px-3 bg-muted/40 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="doctor@hms.com"
                      className="w-full h-10 pl-9 pr-3 bg-muted/40 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 012-3456"
                      className="w-full h-10 pl-9 pr-3 bg-muted/40 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Years Experience</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      name="experience"
                      required
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder="e.g. 10 years"
                      className="w-full h-10 pl-9 pr-3 bg-muted/40 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Specialty */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Specialty Department</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary">
                      <Stethoscope className="w-4 h-4" />
                    </span>
                    <select
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      className="w-full h-10 pl-9 pr-3 bg-muted/40 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Shift Hours */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Shift start</label>
                    <input
                      type="time"
                      name="shiftStart"
                      value={formData.shiftStart}
                      onChange={handleInputChange}
                      className="w-full h-10 px-2 bg-muted/40 border border-border rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Shift end</label>
                    <input
                      type="time"
                      name="shiftEnd"
                      value={formData.shiftEnd}
                      onChange={handleInputChange}
                      className="w-full h-10 px-2 bg-muted/40 border border-border rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Doctor Professional Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Summarize the practitioner's credentials, focus area or hospital history..."
                  className="w-full p-3 bg-muted/40 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={modalLoading}
                className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-75 cursor-pointer"
              >
                {modalLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Commit Practitioner"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
