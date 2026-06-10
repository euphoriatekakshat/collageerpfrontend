import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare, CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import { PageHeader, Card, Table, Badge, Button, Select, Modal, Input, Textarea, StatCard, SearchBar } from '../../components/ui';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const SAMPLE_GRIEVANCES = [
  { _id: 'g1', subject: 'Wi-Fi not working in hostel block C', category: 'infrastructure', submittedBy: 'Rahul Sharma', rollNo: 'CS21B042', date: '2025-06-01', status: 'pending', priority: 'high', description: 'Internet connectivity has been down for 3 days in Block C rooms 201-220.', response: '' },
  { _id: 'g2', subject: 'Canteen food quality issue', category: 'facilities', submittedBy: 'Priya Patel', rollNo: 'CS21B012', date: '2025-05-28', status: 'in_progress', priority: 'medium', description: 'Food quality in college canteen has degraded. Hygiene standards not being maintained.', response: 'Complaint registered. Canteen management has been notified.' },
  { _id: 'g3', subject: 'Fee receipt not received', category: 'finance', submittedBy: 'Arjun Singh', rollNo: 'ME21B034', date: '2025-05-25', status: 'resolved', priority: 'low', description: 'Paid fee online 10 days ago but receipt not received via email.', response: 'Receipt has been sent to your registered email. Please check spam folder.' },
  { _id: 'g4', subject: 'Library books not available', category: 'academic', submittedBy: 'Kavya Nair', rollNo: 'IT21B056', date: '2025-06-03', status: 'pending', priority: 'medium', description: 'Required books for semester 4 are not available in library. Only 1 copy for 60 students.', response: '' },
  { _id: 'g5', subject: 'Harassment by senior students', category: 'conduct', submittedBy: 'Anonymous', rollNo: '—', date: '2025-06-04', status: 'in_progress', priority: 'high', description: 'Ragging incident reported in hostel corridor.', response: 'Disciplinary committee has been informed. Investigation underway.' },
];

const CATEGORIES = ['academic', 'infrastructure', 'facilities', 'finance', 'conduct', 'hostel', 'transport', 'other'];
const STATUS_COLORS = { pending: 'warning', in_progress: 'primary', resolved: 'success', rejected: 'danger' };
const PRIORITY_COLORS = { high: 'danger', medium: 'warning', low: 'default' };

export default function Grievances() {
  const [grievances, setGrievances] = useState(SAMPLE_GRIEVANCES);
  const [showNew, setShowNew] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ subject: '', category: 'academic', priority: 'medium', description: '', anonymous: false });
  const [response, setResponse] = useState('');
  const { user, isAdmin, isHOD } = useAuthStore();
  const canResolve = isAdmin() || isHOD();

  const filtered = grievances.filter(g =>
    (!statusFilter || g.status === statusFilter) &&
    (!catFilter || g.category === catFilter) &&
    (!search || g.subject.toLowerCase().includes(search.toLowerCase()) || g.submittedBy.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = () => {
    if (!form.subject || !form.description) return toast.error('Subject and description required');
    const newG = {
      _id: Date.now().toString(),
      ...form,
      submittedBy: form.anonymous ? 'Anonymous' : user?.name || 'User',
      rollNo: form.anonymous ? '—' : '—',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      response: '',
    };
    setGrievances(prev => [newG, ...prev]);
    toast.success('Grievance submitted successfully');
    setShowNew(false);
    setForm({ subject: '', category: 'academic', priority: 'medium', description: '', anonymous: false });
  };

  const handleRespond = (status) => {
    setGrievances(prev => prev.map(g => g._id === viewItem._id ? { ...g, status, response } : g));
    setViewItem(v => ({ ...v, status, response }));
    toast.success(`Grievance marked as ${status}`);
  };

  const stats = {
    pending: grievances.filter(g => g.status === 'pending').length,
    inProgress: grievances.filter(g => g.status === 'in_progress').length,
    resolved: grievances.filter(g => g.status === 'resolved').length,
    high: grievances.filter(g => g.priority === 'high' && g.status !== 'resolved').length,
  };

  const columns = [
    { header: 'Subject', render: r => <div><p className="font-semibold text-sm text-gray-900 max-w-xs truncate">{r.subject}</p><div className="flex gap-2 mt-1"><Badge variant={PRIORITY_COLORS[r.priority]} size="xs">{r.priority}</Badge><Badge variant="default" size="xs">{r.category}</Badge></div></div> },
    { header: 'Submitted By', render: r => <div><p className="font-medium text-sm">{r.submittedBy}</p><p className="text-xs text-gray-400 font-mono">{r.rollNo}</p></div> },
    { header: 'Date', render: r => <span className="text-sm">{r.date}</span> },
    { header: 'Status', render: r => <Badge variant={STATUS_COLORS[r.status] || 'default'}>{r.status.replace('_', ' ')}</Badge> },
    { header: 'Action', render: r => <Button size="sm" variant="secondary" icon={Eye} onClick={() => { setViewItem(r); setResponse(r.response); }}>View</Button> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Grievance & Complaint System" subtitle="Submit and track complaints transparently" breadcrumb="Home / Grievances"
        actions={<Button icon={Plus} onClick={() => setShowNew(true)}>Submit Grievance</Button>}
      />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Pending" value={stats.pending} icon={Clock} color="orange" />
          <StatCard title="In Progress" value={stats.inProgress} icon={MessageSquare} color="blue" />
          <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} color="green" />
          <StatCard title="High Priority" value={stats.high} icon={AlertCircle} color="red" />
        </div>

        <Card padding={false}>
          <div className="p-4 flex flex-wrap gap-3 border-b border-gray-100">
            <SearchBar value={search} onChange={setSearch} placeholder="Search grievances..." className="flex-1 min-w-[180px]" />
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-36">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </Select>
            <Select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="w-36">
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
            </Select>
          </div>
          <Table columns={columns} data={filtered} emptyText="No grievances found" />
        </Card>
      </div>

      {/* Submit Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Submit Grievance" size="md">
        <div className="p-6 space-y-4">
          <Input label="Subject" required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Brief title of your complaint" />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </Select>
            <Select label="Priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </div>
          <Textarea label="Description" required rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe your complaint in detail..." />
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input type="checkbox" id="anon" checked={form.anonymous} onChange={e => setForm(f => ({ ...f, anonymous: e.target.checked }))} className="w-4 h-4 rounded text-blue-600" />
            <label htmlFor="anon" className="text-sm text-gray-700">Submit anonymously (your identity will be hidden)</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={handleSubmit} icon={MessageSquare}>Submit Grievance</Button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Grievance Details" size="lg">
        {viewItem && (
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-bold text-gray-900 text-base">{viewItem.subject}</h3>
              <div className="flex gap-2 flex-shrink-0">
                <Badge variant={PRIORITY_COLORS[viewItem.priority]}>{viewItem.priority} priority</Badge>
                <Badge variant={STATUS_COLORS[viewItem.status]}>{viewItem.status.replace('_',' ')}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {[['Submitted By', viewItem.submittedBy], ['Roll No', viewItem.rollNo], ['Date', viewItem.date], ['Category', viewItem.category]].map(([l,v]) => (
                <div key={l} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">{l}</p>
                  <p className="font-semibold capitalize">{v}</p>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Complaint Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{viewItem.description}</p>
            </div>
            {canResolve && (
              <div>
                <Textarea label="Official Response" rows={3} value={response} onChange={e => setResponse(e.target.value)} placeholder="Enter official response or action taken..." />
                <div className="flex gap-2 mt-3">
                  <Button variant="primary" onClick={() => handleRespond('in_progress')} size="sm">Mark In Progress</Button>
                  <Button variant="success" onClick={() => handleRespond('resolved')} size="sm">Mark Resolved</Button>
                  <Button variant="danger" onClick={() => handleRespond('rejected')} size="sm">Reject</Button>
                </div>
              </div>
            )}
            {viewItem.response && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-xs font-semibold text-emerald-700 mb-1 uppercase">Official Response</p>
                <p className="text-sm text-emerald-800">{viewItem.response}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}