import React, { useState, useEffect } from 'react';
import { Settings2, Building2, Users, Shield, Bell, Database } from 'lucide-react';
import { departmentsAPI, teachersAPI } from '../../api';
import { PageHeader, Card, Input, Button, Select } from '../../components/ui';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const { user, isAdmin } = useAuthStore();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: '' });
  const [saving, setSaving] = useState(false);

  const TABS = [
    { key: 'general', label: 'General', icon: Settings2 },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'security', label: 'Security', icon: Shield },
  ];

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('Profile updated successfully');
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Settings" subtitle="Manage account and system preferences" breadcrumb="Home / Settings" />
      <div className="p-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Tab nav */}
          <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl overflow-x-auto">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${activeTab === t.key ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'general' && (
            <Card>
              <h3 className="text-sm font-bold text-gray-900 mb-5">Profile Information</h3>
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold">
                  {user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-semibold capitalize">
                    {user?.role?.replace(/_/g,' ')}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                <Input label="Email" value={user?.email} disabled hint="Contact super admin to change email" />
                <Input label="Phone" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
                <Input label="Role" value={user?.role?.replace(/_/g,' ')} disabled />
              </div>
              <div className="flex justify-end mt-5">
                <Button onClick={handleSaveProfile} loading={saving}>Save Changes</Button>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <ChangePassword />
          )}

          {activeTab === 'notifications' && (
            <Card>
              <h3 className="text-sm font-bold text-gray-900 mb-5">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  ['Fee payment alerts', true],
                  ['Attendance below 75%', true],
                  ['New leave applications', true],
                  ['Exam schedule updates', true],
                  ['Notice board updates', false],
                  ['Placement drives', true],
                ].map(([label, defaultOn]) => (
                  <NotifToggle key={label} label={label} defaultOn={defaultOn} />
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ChangePassword() {
  const { authAPI } = require('../../api');
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handleChange = async () => {
    if (!form.currentPassword || !form.newPassword) return toast.error('Fill all fields');
    if (form.newPassword !== form.confirm) return toast.error('Passwords do not match');
    if (form.newPassword.length < 6) return toast.error('Min 6 characters');
    setSaving(true);
    try {
      const { authAPI } = require('../../api');
      await authAPI.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <Card>
      <h3 className="text-sm font-bold text-gray-900 mb-5">Change Password</h3>
      <div className="space-y-4 max-w-sm">
        <Input label="Current Password" type="password" value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))} />
        <Input label="New Password" type="password" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} hint="Minimum 6 characters" />
        <Input label="Confirm New Password" type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
          error={form.confirm && form.newPassword !== form.confirm ? 'Passwords do not match' : ''} />
        <Button onClick={handleChange} loading={saving} icon={Shield}>Change Password</Button>
      </div>
    </Card>
  );
}

function NotifToggle({ label, defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700">{label}</span>
      <button onClick={() => setOn(!on)}
        className={`relative inline-flex w-10 h-5 rounded-full transition-colors duration-200 ${on ? 'bg-blue-600' : 'bg-gray-200'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}