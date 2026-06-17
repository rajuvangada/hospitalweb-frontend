import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Table } from '../components/ui/Table';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Wallet, DollarSign, Clock, CheckSquare, ShieldAlert } from 'lucide-react';

export default function AdminRevenue() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchRevenueLedger = async () => {
    try {
      const res = await api.get('/revenue');
      setTransactions(res.data || []);
    } catch (err) {
      console.warn("Revenue backend endpoint not active:", err.message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchRevenueLedger();
  }, []);

  const handleMarkPaid = async (txId) => {
    const markToastId = toast.loading("Updating invoice status...");
    try {
      await api.put(`/revenue/${txId}`, { status: 'Paid' });
      toast.success("Invoice finalized and marked Paid!", { id: markToastId });
      fetchRevenueLedger();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update payment status.", { id: markToastId });
    }
  };

  // Calculations
  const grossCollected = transactions
    .filter(t => t.status === 'Paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingReceivable = transactions
    .filter(t => t.status === 'Pending')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const paidCount = transactions.filter(t => t.status === 'Paid').length;
  const pendingCount = transactions.filter(t => t.status === 'Pending').length;

  // Filter
  const filteredTx = transactions.filter(tx => {
    if (statusFilter === 'All') return true;
    return tx.status === statusFilter;
  });

  const columns = [
    { header: "Invoice ID", key: "id", sortable: true },
    { 
      header: "Patient", 
      key: "patientName", 
      sortable: true,
      render: (row) => (
        <span className="font-bold">{row.patientName}</span>
      )
    },
    { header: "Due Date", key: "date", sortable: true },
    { header: "Medical Specialty", key: "department", sortable: true },
    { 
      header: "Billing Amount", 
      key: "amount", 
      sortable: true,
      render: (row) => <span className="font-extrabold text-foreground">${row.amount}</span>
    },
    { 
      header: "Payment Status", 
      key: "status", 
      sortable: true,
      render: (row) => {
        const isPaid = row.status === 'Paid';
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
            isPaid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
          }`}>
            {row.status}
          </span>
        );
      }
    }
  ];

  const actions = (row) => {
    return row.status === 'Pending' ? (
      <button
        onClick={() => handleMarkPaid(row.id)}
        className="p-1 px-3 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
      >
        <CheckSquare className="w-3.5 h-3.5" /> Mark Paid
      </button>
    ) : null;
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Revenue & Financial Auditing</h1>
        <p className="text-sm text-muted-foreground">Monitor collections, trace outstanding receivables, and issue invoice status updates.</p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <DollarSign className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Gross Collected</span>
            <span className="text-base font-black text-foreground">${grossCollected}</span>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Clock className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Outstanding Due</span>
            <span className="text-base font-black text-foreground">${pendingReceivable}</span>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckSquare className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Settled Invoices</span>
            <span className="text-base font-black text-foreground">{paidCount} transactions</span>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Pending Invoices</span>
            <span className="text-base font-black text-foreground">{pendingCount} cards</span>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : (
        <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
          <Table
            columns={columns}
            data={filteredTx}
            searchKeys={["id", "patientName", "department"]}
            searchPlaceholder="Search invoices by ID, patient name, or department..."
            pageSize={7}
            actions={actions}
            filterElement={
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 px-3 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25"
              >
                <option value="All">All Invoices</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            }
          />
        </div>
      )}
    </div>
  );
}
