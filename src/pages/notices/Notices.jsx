import React, { useState, useEffect } from 'react';
import { Plus, Bell, Trash2 } from 'lucide-react';
import { noticesAPI } from '../../api';
import { PageHeader, Card, Button, Badge, Modal, Input, Textarea, Select, ConfirmDialog } from '../../components/ui';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const TYPE_COLORS = { general: 'default', exam: 'danger', fee: 'warning', holiday: 'success', event: 'primary', placement: 'teal', urgent: 'danger' };

const ROLE_OPTIONS = [
  { value: 'student', label: 'Students' },
  { value: 'teacher', label: 'Teachers' },
  { value: 'parent', label: 'Parents' },
  { value: 'hod', label: 'HODs' },
  { value: 'accounts_admin', label: 'Accounts' },
];

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'general', targetRoles: [] });
  const { user } = useAuthStore();

  const canPost = ['super_admin','college_admin','hod','teacher'].includes(user?.role);
  const canDelete = ['super_admin','college_admin','hod'].includes(user?.role);

  const fetchNotices = () => {
    setLoading(true);
    noticesAPI.getAll().then(({ data }) => setNotices(data.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotices(); }, []);

  const toggleRole = (role) => {
    setForm(f => ({
      ...f,
      targetRoles: f.targetRoles.includes(role) ? f.targetRoles.filter(r => r !== role) : [...f.targetRoles, role]
    }));
  };

  const handlePost = async () => {
    if (!form.title || !form.content) return toast.error('Title and content required');
    setSaving(true);
    try {
      await noticesAPI.create(form);
      toast.success('Notice posted successfully');
      setShowModal(false);
      setForm({ title: '', content: '', type: 'general', targetRoles: [] });
      fetchNotices();
    } catch { toast.error('Failed to post notice'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await noticesAPI.delete(deleteTarget._id);
      toast.success('Notice removed');
      setDeleteTarget(null);
      fetchNotices();
    } catch { toast.error('Failed'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Notices & Announcements" subtitle="Post and manage college notices" breadcrumb="Home / Notices"
        actions={canPost && <Button icon={Plus} onClick={() => setShowModal(true)}>Post Notice</Button>}
      />
      <div className="p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
        ) : notices.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center py-12 text-gray-400">
              <Bell size={40} strokeWidth={1} className="mb-3 text-gray-300" />
              <p className="font-medium">No notices posted yet</p>
            </div>
          </Card>
        ) : (
          notices.map((n) => (
            <Card key={n._id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === 'urgent' ? 'bg-red-100' : n.type === 'exam' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                  <Bell size={18} className={n.type === 'urgent' ? 'text-red-600' : n.type === 'exam' ? 'text-orange-600' : 'text-blue-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900">{n.title}</h3>
                        <Badge variant={TYPE_COLORS[n.type] || 'default'} size="xs">{n.type.toUpperCase()}</Badge>
                        {n.type === 'urgent' && <span className="text-xs font-bold text-red-600 animate-pulse">🚨 URGENT</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Posted by {n.postedBy?.name || 'Admin'} · {new Date(n.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</p>
                    </div>
                    {canDelete && (
                      <button onClick={() => setDeleteTarget(n)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"><Trash2 size={16} /></button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed">{n.content}</p>
                  {n.targetRoles?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      <span className="text-xs text-gray-400">Visible to:</span>
                      {n.targetRoles.map(r => <Badge key={r} variant="default" size="xs">{r}</Badge>)}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Post New Notice" size="md">
        <div className="p-6 space-y-4">
          <Input label="Notice Title" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Exam Schedule Updated" />
          <Textarea label="Content" required rows={5} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Write notice content here..." />
          <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            {['general','exam','fee','holiday','event','placement','urgent'].map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
            ))}
          </Select>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Visible to (select all that apply)</p>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map(r => (
                <button key={r.value} type="button" onClick={() => toggleRole(r.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${form.targetRoles.includes(r.value) ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}>
                  {r.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">Leave empty to show to all users</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handlePost} loading={saving} icon={Bell}>Post Notice</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting}
        title="Remove Notice" message={`Remove notice "${deleteTarget?.title}"?`} />
    </div>
  );
}