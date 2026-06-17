import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Table } from '../components/ui/Table';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Trash2, User, Phone, ShieldAlert, Heart } from 'lucide-react';

export default function AdminPatients() {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data);
    } catch (err) {
      toast.error("Failed to load patient records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate and remove this patient's records? This will purge all associated appointments, prescriptions and invoices from the system database.")) return;

    try {
      await api.delete(`/patients/${id}`);
      toast.success("Patient account deactivated and database purged.");
      fetchPatients();
    } catch (err) {
      toast.error("Failed to delete patient records.");
    }
  };

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
    { header: "Date of Birth", key: "dob", sortable: true },
    { header: "Gender", key: "gender", sortable: true },
    { header: "Blood Type", key: "bloodGroup", sortable: true },
    { header: "Phone Number", key: "phone" },
    { 
      header: "Known Allergies", 
      key: "allergies",
      render: (row) => (
        <span className={row.allergies && row.allergies.toLowerCase() !== 'none' ? 'text-red-500 font-bold' : ''}>
          {row.allergies || 'None'}
        </span>
      )
    }
  ];

  const actions = (row) => (
    <div className="flex gap-2">
      <button
        onClick={() => handleDelete(row.id)}
        className="p-1.5 border border-destructive/20 hover:bg-destructive/10 text-destructive rounded-lg transition-colors cursor-pointer"
        title="Delete Patient Record"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Patient Accounts Registry</h1>
        <p className="text-sm text-muted-foreground">Monitor patient demographics, review medical stats registries or manage account records deletion.</p>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : (
        <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
          <Table
            columns={columns}
            data={patients}
            searchKeys={["name", "email", "phone", "bloodGroup", "allergies"]}
            searchPlaceholder="Search patients by name, blood type or allergy profiles..."
            pageSize={7}
            actions={actions}
          />
        </div>
      )}
    </div>
  );
}
