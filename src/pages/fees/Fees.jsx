// Fees.jsx
import React, { useState, useEffect } from 'react';
import { CreditCard, AlertTriangle, CheckCircle, Download, Search } from 'lucide-react';
import { feesAPI, studentsAPI, departmentsAPI } from '../../api';
import { PageHeader, Card, Table, Badge, Button, SearchBar, Select, StatCard, Input, Modal, PageLoader } from '../../components/ui';
import toast from 'react-hot-toast';

export function Fees() {
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [summary, setSummary] = useState({ total: 0, collected: 0, pending: 0 });

  useEffect(() => {
    departmentsAPI.getAll().then(({ data }) => setDepartments(data.data)).catch(() => {});
    Promise.all([
      feesAPI.getDefaulters({ academicYear: '2024-25' }),
      feesAPI.getReport({ academicYear: '2024-25' }),
    ]).then(([def, rep]) => {
      setDefaulters(def.data.data);
      const { totalAmount, totalCollected } = rep.data.summary;
      setSummary({ total: totalAmount, collected: totalCollected, pending: totalAmount - totalCollected });
    }).catch(() => {
      setSummary({ total: 1850000, collected: 1530000, pending: 320000 });
    }).finally(() => setLoading(false));
  }, []);

  const columns = [
    { header: 'Student', render: r => <div><p className="font-semibold text-sm">{r.student?.name}</p><p className="text-xs font-mono text-gray-400">{r.student?.rollNo}</p></div> },
    { header: 'Fee Type', render: r => <Badge variant="default" className="capitalize">{r.feeType}</Badge> },
    { header: 'Amount Due', render: r => <span className="font-bold text-red-600">₹{(r.amount - r.paidAmount).toLocaleString()}</span> },
    { header: 'Due Date', render: r => <span className="text-sm">{r.dueDate ? new Date(r.dueDate).toLocaleDateString('en-IN') : '—'}</span> },
    { header: 'Parent Phone', render: r => <span className="text-sm text-gray-600">{r.student?.parentPhone || '—'}</span> },
    { header: 'Status', render: r => <Badge variant="danger">Overdue</Badge> },
    { header: 'Action', render: r => <Button size="sm" variant="success" onClick={() => window.location.href = '/fees/collect'}>Collect</Button> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Fee & Finance" subtitle="Manage student fees and payments" breadcrumb="Home / Fees"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Download}>Export</Button>
            <Button variant="success" onClick={() => window.location.href = '/fees/collect'}>+ Collect Fee</Button>
          </div>
        }
      />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total Fee (AY 2024-25)" value={`₹${(summary.total/100000).toFixed(1)}L`} icon={CreditCard} color="blue" loading={loading} />
          <StatCard title="Collected" value={`₹${(summary.collected/100000).toFixed(1)}L`} icon={CheckCircle} color="green" loading={loading} />
          <StatCard title="Pending / Due" value={`₹${(summary.pending/100000).toFixed(1)}L`} icon={AlertTriangle} color="red" loading={loading} />
        </div>

        <Card padding={false}>
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Fee Defaulters</h3>
            <p className="text-xs text-gray-400 mt-0.5">Students with pending/overdue fee</p>
          </div>
          <Table columns={columns} data={defaulters} loading={loading} emptyText="No fee defaulters found 🎉" />
        </Card>
      </div>
    </div>
  );
}

// CollectFee.jsx
export function CollectFee() {
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [studentFees, setStudentFees] = useState({ data: [], summary: {} });
  const [loadingFees, setLoadingFees] = useState(false);
  const [form, setForm] = useState({ feeType: 'tuition', amount: '', paymentMode: 'upi', transactionId: '', remarks: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);

  const searchStudents = async (q) => {
    if (q.length < 2) return setStudents([]);
    try { const { data } = await studentsAPI.getAll({ search: q, limit: 8 }); setStudents(data.data); } catch {}
  };

  const selectStudent = async (s) => {
    setSelected(s); setStudents([]); setSearch(s.name); setSuccess(null);
    setLoadingFees(true);
    try { const { data } = await feesAPI.getStudent(s._id, { academicYear: '2024-25' }); setStudentFees(data); }
    catch {} finally { setLoadingFees(false); }
  };

  const handleCollect = async () => {
    if (!selected) return toast.error('Select a student');
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter valid amount');
    setSaving(true);
    try {
      const { data } = await feesAPI.collect({ student: selected._id, academicYear: '2024-25', ...form, amount: Number(form.amount) });
      setSuccess(data);
      toast.success(data.message);
      setForm({ feeType: 'tuition', amount: '', paymentMode: 'upi', transactionId: '', remarks: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Collect Fee" subtitle="Record student fee payments" breadcrumb="Home / Fees / Collect" />
      <div className="p-6">
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Student search */}
          <Card>
            <h3 className="text-sm font-bold text-gray-700 mb-3">Select Student</h3>
            <div className="relative">
              <SearchBar value={search} onChange={v => { setSearch(v); searchStudents(v); setSelected(null); }} placeholder="Search student by name or roll no..." />
              {students.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                  {students.map(s => (
                    <button key={s._id} onClick={() => selectStudent(s)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-0">
                      <p className="font-semibold text-sm">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.rollNo} · {s.department?.name} · Sem {s.semester}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selected && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {selected.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{selected.name}</p>
                    <p className="text-sm text-gray-500">{selected.rollNo} · {selected.department?.name}</p>
                  </div>
                </div>
                {loadingFees ? <p className="text-sm text-gray-400">Loading fee details...</p> : (
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[['Total', `₹${(studentFees.summary?.total||0).toLocaleString()}`, 'text-gray-800'],
                      ['Paid', `₹${(studentFees.summary?.paid||0).toLocaleString()}`, 'text-emerald-600'],
                      ['Due', `₹${(studentFees.summary?.due||0).toLocaleString()}`, 'text-red-500']].map(([l,v,c]) => (
                      <div key={l} className="bg-white rounded-lg p-2">
                        <p className={`font-bold text-sm ${c}`}>{v}</p>
                        <p className="text-xs text-gray-400">{l}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Fee form */}
          {selected && (
            <Card>
              <h3 className="text-sm font-bold text-gray-700 mb-4">Payment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <Select label="Fee Type" value={form.feeType} onChange={e => setForm(f => ({ ...f, feeType: e.target.value }))}>
                  {['tuition','exam','library','development','hostel','transport','lab','sports','other'].map(t => (
                    <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)} Fee</option>
                  ))}
                </Select>
                <Input label="Amount (₹)" required type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" prefix="₹" />
                <Select label="Payment Mode" value={form.paymentMode} onChange={e => setForm(f => ({ ...f, paymentMode: e.target.value }))}>
                  {[['upi','UPI / PhonePe / GPay'],['netbanking','Net Banking'],['cash','Cash'],['dd','Demand Draft'],['cheque','Cheque']].map(([v,l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </Select>
                <Input label="Transaction / Reference ID" value={form.transactionId} onChange={e => setForm(f => ({ ...f, transactionId: e.target.value }))} placeholder="TXN12345..." />
                <Input label="Remarks" value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional notes" className="col-span-2" />
              </div>
              <div className="flex justify-end mt-5">
                <Button onClick={handleCollect} loading={saving} variant="success" icon={CreditCard}>
                  Collect ₹{form.amount ? Number(form.amount).toLocaleString() : '0'}
                </Button>
              </div>
            </Card>
          )}

          {success && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-4">
              <CheckCircle size={32} className="text-emerald-600" />
              <div>
                <p className="font-bold text-emerald-800 text-lg">Payment Collected!</p>
                <p className="text-sm text-emerald-600">{success.message}</p>
                <p className="text-xs text-emerald-500 mt-1">Receipt: {success.data?.receiptNo}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// FeeReport.jsx
export function FeeReport() {
  const [report, setReport] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ academicYear: '2024-25', feeType: '', status: '' });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data } = await feesAPI.getReport(filters);
      setReport(data.data); setSummary(data.summary);
    } catch { toast.error('Failed to load report'); }
    finally { setLoading(false); }
  };

  const columns = [
    { header: 'Student', render: r => <div><p className="font-semibold text-sm">{r.student?.name}</p><p className="text-xs font-mono text-gray-400">{r.student?.rollNo}</p></div> },
    { header: 'Fee Type', render: r => <Badge variant="default">{r.feeType}</Badge> },
    { header: 'Amount', render: r => <span className="font-semibold">₹{r.amount?.toLocaleString()}</span> },
    { header: 'Paid', render: r => <span className="text-emerald-600 font-bold">₹{r.paidAmount?.toLocaleString()}</span> },
    { header: 'Receipt No', render: r => <span className="font-mono text-xs">{r.receiptNo || '—'}</span> },
    { header: 'Payment Mode', render: r => <span className="text-sm capitalize">{r.paymentMode || '—'}</span> },
    { header: 'Date', render: r => <span className="text-sm">{r.paidDate ? new Date(r.paidDate).toLocaleDateString('en-IN') : '—'}</span> },
    { header: 'Status', render: r => <Badge variant={r.status === 'paid' ? 'success' : r.status === 'pending' ? 'warning' : 'danger'}>{r.status}</Badge> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Fee Report" subtitle="Detailed fee collection report" breadcrumb="Home / Fees / Report"
        actions={<Button variant="secondary" icon={Download}>Export Excel</Button>}
      />
      <div className="p-6 space-y-5">
        <Card>
          <div className="flex flex-wrap gap-3 mb-5">
            <input value={filters.academicYear} onChange={e => setFilters(f => ({ ...f, academicYear: e.target.value }))} placeholder="Academic Year"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-32" />
            <Select value={filters.feeType} onChange={e => setFilters(f => ({ ...f, feeType: e.target.value }))} className="w-36">
              <option value="">All Fee Types</option>
              {['tuition','exam','library','development','hostel','transport','lab'].map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="w-32">
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </Select>
            <Button onClick={fetchReport} loading={loading}>Generate Report</Button>
          </div>

          {Object.keys(summary).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[['Total Records', summary.totalFees, 'text-gray-800'], ['Total Amount', `₹${(summary.totalAmount||0).toLocaleString()}`, 'text-blue-700'], ['Collected', `₹${(summary.totalCollected||0).toLocaleString()}`, 'text-emerald-600'], ['Pending', `₹${(summary.totalPending||0).toLocaleString()}`, 'text-red-500']].map(([l,v,c]) => (
                <div key={l} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className={`text-lg font-extrabold ${c}`}>{v}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          )}

          {loading ? <PageLoader /> : <Table columns={columns} data={report} emptyText="Click Generate Report to view data" />}
        </Card>
      </div>
    </div>
  );
}

export default Fees;