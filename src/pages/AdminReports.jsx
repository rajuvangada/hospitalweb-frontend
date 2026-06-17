import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Table } from '../components/ui/Table';
import { TableSkeleton } from '../components/ui/Skeleton';
import { FileSpreadsheet, Download, RefreshCw, BarChart, FileText } from 'lucide-react';

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  const fetchReportsData = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch (err) {
      toast.error("Failed to load reports registries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const handleDownload = (reportName) => {
    toast.info(`Simulating file download: ${reportName}.csv`);
  };

  // Compute disease stats from completed appointment diagnostics
  const getDiseaseCounts = () => {
    const counts = {};
    appointments
      .filter(apt => apt.status === 'Completed' && apt.diagnosis)
      .forEach(apt => {
        const diag = apt.diagnosis.trim().toLowerCase();
        counts[diag] = (counts[diag] || 0) + 1;
      });

    return Object.keys(counts).map(key => ({
      disease: key.charAt(0).toUpperCase() + key.slice(1),
      count: counts[key]
    }));
  };

  const diseaseStats = getDiseaseCounts();

  const columns = [
    { header: "Diagnosed Clinical Condition", key: "disease", sortable: true },
    { 
      header: "Active Cases", 
      key: "count", 
      sortable: true,
      render: (row) => (
        <span className="font-bold text-primary">{row.count} patients</span>
      )
    }
  ];

  const actions = (row) => (
    <button
      onClick={() => handleDownload(`disease_stats_${row.disease.replace(' ', '_')}`)}
      className="p-1 px-3 border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
    >
      <Download className="w-3.5 h-3.5" /> CSV
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Clinic Reports Center</h1>
        <p className="text-sm text-muted-foreground">Download clinical export lists, daily audit files, or analyze disease diagnostics distributions.</p>
      </div>

      {/* Reports Directory grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary shrink-0" />
              Daily Patient Visit Audit
            </h3>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Export comprehensive listings of all clinic arrivals, scheduling details, and departments logs.
            </p>
          </div>
          <button
            onClick={() => handleDownload('daily_visits_audit_report')}
            className="w-full py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Sheet
          </button>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              Practitioner Revenue Breakdown
            </h3>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Analyze consultations fee invoices, billing statuses splits, and payments totals for accounting audits.
            </p>
          </div>
          <button
            onClick={() => handleDownload('doctor_revenue_ledger_report')}
            className="w-full py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Ledger
          </button>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
              <BarChart className="w-5 h-5 text-primary shrink-0" />
              Department Scheduling Stats
            </h3>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              View average checkup times, scheduling volumes, and cancellation rates across departments.
            </p>
          </div>
          <button
            onClick={() => handleDownload('department_scheduler_stats_report')}
            className="w-full py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Disease Distribution table */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Clinical Disease Diagnostics Summary</h3>
        {loading ? (
          <TableSkeleton rows={3} cols={2} />
        ) : diseaseStats.length === 0 ? (
          <div className="p-8 bg-card border border-border/50 rounded-2xl text-center text-xs text-muted-foreground">
            No diagnostic records found. Complete checkups to register case files.
          </div>
        ) : (
          <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
            <Table
              columns={columns}
              data={diseaseStats}
              searchKeys={["disease"]}
              searchPlaceholder="Filter conditions..."
              pageSize={5}
              actions={actions}
            />
          </div>
        )}
      </div>

    </div>
  );
}
