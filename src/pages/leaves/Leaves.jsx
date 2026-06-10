import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { leavesAPI } from '../../api';
import { PageHeader, Card, Table, Badge, Button, Select, Modal, Input, Textarea, StatCard, ConfirmDialog } from '../../components/ui';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const STATUS_COLORS = { pending: 'warning', approved: 'success', rejected: 'danger' };
const LEAVE_TYPES = ['medical','personal','emergency','festival','other'];

export default function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [actionModal, setActionModal] = useState(null); // { leave, action }
  const [saving, setSaving] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({ leaveType: 'personal', fromDate: '', toDate: '', reason: '' });
  const { user, isAdmin, isHOD } = useAuthStore();

  const canApprove = isAdmin() || isHOD() || user?.role === 'teacher';

  const fetchLeaves = () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    leavesAPI.getAll(params).then(({ data }) => setLeaves(data.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(); }, [statusFilter]);

  const handleApply = async () => {
    if (!form.fromDate || !form.toDate || !form.reason) return toast.error('Fill all required fields');
    setSaving(true);
    try {
      await leavesAPI.create(form);
      toast.success('Leave application submitted');
      setShowApply(false);
      setForm({ leaveType: 'personal', fromDate: '', toDate: '', reason: '' });
      fetchLeaves();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleAction = async () => {
    setSaving(true);
    try {
      await leavesAPI.approve(actionModal.leave._id, { status: actionModal.action, remarks });
      toast.success(`Leave ${actionModal.action}`);
      setActionModal(null);
      setRemarks('');
      fetchLeaves();
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const days = (from, to) => {
    if (!from || !to) return 0;
    return Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;
  };

  const columns = [
    { header: 'Applicant', render: r => <div><p className="font-semibold text-sm">{r.applicant?.name}</p><p className="text-xs text-gray-400 capitalize">{r.applicant?.role?.replace('_',' ')}</p></div> },
    { header: 'Type', render: r => <Badge variant="default" className="capitalize">{r.leaveType}</Badge> },
    { header: 'From', render: r => <span className="text-sm">{r.fromDate ? new Date(r.fromDate).toLocaleDateString('en-IN') : '—'}</span> },
    { header: 'To', render: r => <span className="text-sm">{r.toDate ? new Date(r.toDate).toLocaleDateString('en-IN') : '—'}</span> },
    { header: 'Days', render: r => <span className="font-bold">{days(r.fromDate, r.toDate)}</span> },
    { header: 'Reason', render: r => <span className="text-sm text-gray-600 truncate max-w-[180px] block" title={r.reason}>{r.reason}</span> },
    { header: 'Status', render: r => <Badge variant={STATUS_COLORS[r.status] || 'default'}>{r.status}</Badge> },
    {
      header: 'Actions', cellClass: 'text-right',
      render: r => r.status === 'pending' && canApprove ? (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => { setActionModal({ leave: r, action: 'approved' }); setRemarks(''); }}
            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Approve">
            <CheckCircle size={16} />
          </button>
          <button onClick={() => { setActionModal({ leave: r, action: 'rejected' }); setRemarks(''); }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Reject">
            <XCircle size={16} />
          </button>
        </div>
      ) : r.status === 'pending' ? (
        <Badge variant="warning">Awaiting</Badge>
      ) : (
        <span className="text-xs text-gray-400">{r.approvedBy?.name || '—'}</span>
      )
    },
  ];

  const pending = leaves.filter(l => l.status === 'pending').length;
  const approved = leaves.filter(l => l.status === 'approved').length;
  const rejected = leaves.filter(l => l.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Leave Management" subtitle="Apply and manage leave requests" breadcrumb="Home / Leaves"
        actions={
          <div className="flex gap-2">
            {statusFilter && <Button variant="ghost" size="sm" onClick={() => setStatusFilter('')}>Clear filter</Button>}
            <Button icon={Plus} onClick={() => setShowApply(true)}>Apply Leave</Button>
          </div>
        }
      />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <StatCard title="Pending" value={pending} icon={Clock} color="orange" />
          <StatCard title="Approved" value={approved} icon={CheckCircle} color="green" />
          <StatCard title="Rejected" value={rejected} icon={XCircle} color="red" />
        </div>

        <Card padding={false}>
          <div className="p-4 flex gap-3 border-b border-gray-100">
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-36">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>
          <Table columns={columns} data={leaves} loading={loading} emptyText="No leave applications found" />
        </Card>
      </div>

      {/* Apply Modal */}
      <Modal open={showApply} onClose={() => setShowApply(false)} title="Apply for Leave">
        <div className="p-6 space-y-4">
          <Select label="Leave Type" value={form.leaveType} onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))}>
            {LEAVE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input label="From Date" required type="date" value={form.fromDate} onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))} />
            <Input label="To Date" required type="date" value={form.toDate} min={form.fromDate} onChange={e => setForm(f => ({ ...f, toDate: e.target.value }))} />
          </div>
          {form.fromDate && form.toDate && (
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700 font-medium">
              📅 Duration: {days(form.fromDate, form.toDate)} day{days(form.fromDate, form.toDate) > 1 ? 's' : ''}
            </div>
          )}
          <Textarea label="Reason" required rows={3} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Explain the reason for leave..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowApply(false)}>Cancel</Button>
            <Button onClick={handleApply} loading={saving} icon={FileText}>Submit Application</Button>
          </div>
        </div>
      </Modal>

      {/* Approve/Reject Modal */}
      <Modal open={!!actionModal} onClose={() => setActionModal(null)} title={actionModal?.action === 'approved' ? '✅ Approve Leave' : '❌ Reject Leave'} size="sm">
        {actionModal && (
          <div className="p-6 space-y-4">
            <div className={`p-3 rounded-lg text-sm ${actionModal.action === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              <p className="font-semibold">{actionModal.leave.applicant?.name}</p>
              <p>{actionModal.leave.leaveType} · {days(actionModal.leave.fromDate, actionModal.leave.toDate)} days</p>
              <p className="mt-1 text-xs opacity-75">{actionModal.leave.reason}</p>
            </div>
            <Textarea label="Remarks (optional)" rows={2} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add any remarks..." />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setActionModal(null)}>Cancel</Button>
              <Button
                variant={actionModal.action === 'approved' ? 'success' : 'danger'}
                onClick={handleAction} loading={saving}>
                {actionModal.action === 'approved' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}