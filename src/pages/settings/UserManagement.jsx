import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ToggleLeft, ToggleRight, KeyRound, UserCog } from 'lucide-react';
import { usersAPI, authAPI } from '../../api';
import { PageHeader, Card, Table, Badge, Button, Select, SearchBar, Modal, Input, Avatar, ConfirmDialog } from '../../components/ui';
import toast from 'react-hot-toast';

const ROLE_COLORS = {
  super_admin: 'purple', college_admin: 'primary', hod: 'teal',
  teacher: 'orange', exam_controller: 'warning', accounts_admin: 'success',
  librarian: 'pink', hostel_warden: 'default', transport_admin: 'default',
  placement_officer: 'teal', student: 'default', parent: 'danger',
};

const ROLE_LABELS = {
  super_admin: 'Super Admin', college_admin: 'College Admin', hod: 'HOD',
  teacher: 'Teacher', exam_controller: 'Exam Controller', accounts_admin: 'Accounts Admin',
  librarian: 'Librarian', hostel_warden: 'Hostel Warden', transport_admin: 'Transport Admin',
  placement_officer: 'Placement Officer', student: 'Student', parent: 'Parent',
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'teacher', phone: '' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (activeFilter !== '') params.isActive = activeFilter;
      const { data } = await usersAPI.getAll(params);
      setUsers(data.data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [roleFilter, activeFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter(u => !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = async (user) => {
    try {
      const { data } = await usersAPI.toggleStatus(user._id);
      toast.success(data.message);
      fetchUsers();
    } catch { toast.error('Failed'); }
  };

  const handleResetPassword = async () => {
    if (!newPass || newPass.length < 6) return toast.error('Min 6 characters');
    setSaving(true);
    try {
      await usersAPI.resetPassword(resetTarget._id, { newPassword: newPass });
      toast.success('Password reset successfully');
      setResetTarget(null);
      setNewPass('');
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const handleAddUser = async () => {
    if (!form.name || !form.email || !form.password) return toast.error('Fill required fields');
    setSaving(true);
    try {
      await authAPI.register(form);
      toast.success('User created successfully');
      setShowAdd(false);
      setForm({ name: '', email: '', password: '', role: 'teacher', phone: '' });
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const columns = [
    {
      header: 'User',
      render: r => (
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar name={r.name} size="sm" color={r.isActive ? 'blue' : 'green'} />
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${r.isActive ? 'bg-emerald-400' : 'bg-gray-300'}`} />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">{r.name}</p>
            <p className="text-xs text-gray-400">{r.email}</p>
          </div>
        </div>
      )
    },
    { header: 'Role', render: r => <Badge variant={ROLE_COLORS[r.role] || 'default'}>{ROLE_LABELS[r.role] || r.role}</Badge> },
    { header: 'Department', render: r => <span className="text-sm">{r.department?.name || '—'}</span> },
    { header: 'Last Login', render: r => <span className="text-xs text-gray-500">{r.lastLogin ? new Date(r.lastLogin).toLocaleDateString('en-IN') : 'Never'}</span> },
    { header: 'Status', render: r => <Badge variant={r.isActive ? 'success' : 'danger'}>{r.isActive ? 'Active' : 'Inactive'}</Badge> },
    {
      header: 'Actions', cellClass: 'text-right',
      render: r => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => handleToggle(r)} title={r.isActive ? 'Deactivate' : 'Activate'}
            className={`p-1.5 rounded-md transition-colors ${r.isActive ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`}>
            {r.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          </button>
          <button onClick={() => { setResetTarget(r); setNewPass(''); }} title="Reset Password"
            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors">
            <KeyRound size={16} />
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="User Management" subtitle={`${users.length} users in the system`} breadcrumb="Home / Settings / Users"
        actions={<Button icon={Plus} onClick={() => setShowAdd(true)}>Add User</Button>}
      />
      <div className="p-6 space-y-5">
        {/* Role summary cards */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[['super_admin','SA'],['college_admin','Admin'],['hod','HOD'],['teacher','Teacher'],['accounts_admin','Accounts'],['exam_controller','Exam']].map(([role, label]) => (
            <button key={role} onClick={() => setRoleFilter(r => r === role ? '' : role)}
              className={`p-3 rounded-xl border text-center transition-all ${roleFilter === role ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
              <p className="text-xl font-extrabold text-gray-900">{users.filter(u => u.role === role).length}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </button>
          ))}
        </div>

        <Card padding={false}>
          <div className="p-4 flex flex-wrap gap-3 border-b border-gray-100">
            <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email..." className="flex-1 min-w-[200px]" />
            <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="w-44">
              <option value="">All Roles</option>
              {Object.entries(ROLE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
            <Select value={activeFilter} onChange={e => setActiveFilter(e.target.value)} className="w-32">
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          </div>
          <Table columns={columns} data={filtered} loading={loading} emptyText="No users found" />
        </Card>
      </div>

      {/* Add User Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New User" size="md">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Prof. Ankit Gupta" />
            <Input label="Email" required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@college.edu" />
            <Input label="Password" required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} hint="Min 6 characters" />
            <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <Select label="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="col-span-2">
              {Object.entries(ROLE_LABELS).filter(([k]) => k !== 'student' && k !== 'parent').map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAddUser} loading={saving} icon={UserCog}>Create User</Button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={!!resetTarget} onClose={() => setResetTarget(null)} title="Reset Password" size="sm">
        {resetTarget && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <Avatar name={resetTarget.name} size="sm" color="orange" />
              <div>
                <p className="font-semibold text-sm text-gray-900">{resetTarget.name}</p>
                <p className="text-xs text-gray-500">{resetTarget.email}</p>
              </div>
            </div>
            <Input label="New Password" required type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min 6 characters" hint="User will be required to use this password on next login" />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setResetTarget(null)}>Cancel</Button>
              <Button variant="warning" onClick={handleResetPassword} loading={saving} icon={KeyRound}>Reset Password</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}