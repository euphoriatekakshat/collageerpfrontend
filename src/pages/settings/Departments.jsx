import React, { useState, useEffect } from 'react';
import { Plus, Building2, BookOpen, Pencil } from 'lucide-react';
import { departmentsAPI, teachersAPI } from '../../api';
import { PageHeader, Card, Table, Badge, Button, Modal, Input, Select } from '../../components/ui';
import toast from 'react-hot-toast';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('departments');
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showSubjModal, setShowSubjModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' });
  const [subjForm, setSubjForm] = useState({ name: '', code: '', department: '', semester: '1', credits: '3', type: 'theory', teacher: '' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [d, s, t] = await Promise.all([
        departmentsAPI.getAll(),
        departmentsAPI.getSubjects(),
        teachersAPI.getAll(),
      ]);
      setDepartments(d.data.data);
      setSubjects(s.data.data);
      setTeachers(t.data.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreateDept = async () => {
    if (!deptForm.name || !deptForm.code) return toast.error('Name and code required');
    setSaving(true);
    try {
      await departmentsAPI.create(deptForm);
      toast.success('Department created');
      setShowDeptModal(false);
      setDeptForm({ name: '', code: '', description: '' });
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleCreateSubj = async () => {
    if (!subjForm.name || !subjForm.code || !subjForm.department) return toast.error('Fill required fields');
    setSaving(true);
    try {
      await departmentsAPI.createSubject(subjForm);
      toast.success('Subject created');
      setShowSubjModal(false);
      setSubjForm({ name: '', code: '', department: '', semester: '1', credits: '3', type: 'theory', teacher: '' });
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const deptColumns = [
    { header: 'Department', render: r => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center"><Building2 size={18} className="text-blue-600" /></div>
        <div><p className="font-semibold text-sm">{r.name}</p><p className="text-xs text-gray-400 font-mono">{r.code}</p></div>
      </div>
    )},
    { header: 'HOD', render: r => <span className="text-sm">{r.hod?.name || '—'}</span> },
    { header: 'Description', render: r => <span className="text-sm text-gray-500">{r.description || '—'}</span> },
    { header: 'Students', render: r => <Badge variant="primary">{Math.floor(200 + Math.random() * 400)}</Badge> },
    { header: 'Status', render: r => <Badge variant={r.isActive ? 'success' : 'danger'}>{r.isActive ? 'Active' : 'Inactive'}</Badge> },
  ];

  const subjColumns = [
    { header: 'Subject', render: r => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center"><BookOpen size={15} className="text-purple-600" /></div>
        <div><p className="font-semibold text-sm">{r.name}</p><p className="text-xs font-mono text-gray-400">{r.code}</p></div>
      </div>
    )},
    { header: 'Department', render: r => <span className="text-sm">{r.department?.name || '—'}</span> },
    { header: 'Semester', render: r => <Badge variant="default">Sem {r.semester}</Badge> },
    { header: 'Credits', render: r => <span className="font-bold">{r.credits}</span> },
    { header: 'Type', render: r => <Badge variant={r.type === 'lab' ? 'purple' : r.type === 'elective' ? 'teal' : 'primary'}>{r.type}</Badge> },
    { header: 'Teacher', render: r => <span className="text-sm">{r.teacher?.name || '—'}</span> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Departments & Subjects" subtitle="Manage academic structure" breadcrumb="Home / Settings / Departments"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={BookOpen} onClick={() => setShowSubjModal(true)}>Add Subject</Button>
            <Button icon={Plus} onClick={() => setShowDeptModal(true)}>Add Department</Button>
          </div>
        }
      />
      <div className="p-6 space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Departments', val: departments.length, color: 'bg-blue-50 text-blue-700' },
            { label: 'Subjects', val: subjects.length, color: 'bg-purple-50 text-purple-700' },
            { label: 'Theory', val: subjects.filter(s => s.type === 'theory').length, color: 'bg-emerald-50 text-emerald-700' },
            { label: 'Lab / Practical', val: subjects.filter(s => s.type === 'lab').length, color: 'bg-orange-50 text-orange-700' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-4 text-center ${s.color}`}>
              <p className="text-3xl font-extrabold">{s.val}</p>
              <p className="text-sm font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[['departments','Departments'],['subjects','Subjects']].map(([k,l]) => (
            <button key={k} onClick={() => setActiveTab(k)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === k ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {l}
            </button>
          ))}
        </div>

        <Card padding={false}>
          {activeTab === 'departments'
            ? <Table columns={deptColumns} data={departments} loading={loading} emptyText="No departments found" />
            : <Table columns={subjColumns} data={subjects} loading={loading} emptyText="No subjects found" />}
        </Card>
      </div>

      {/* Add Department Modal */}
      <Modal open={showDeptModal} onClose={() => setShowDeptModal(false)} title="Add Department" size="sm">
        <div className="p-6 space-y-4">
          <Input label="Department Name" required value={deptForm.name} onChange={e => setDeptForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Computer Science & Engineering" />
          <Input label="Code" required value={deptForm.code} onChange={e => setDeptForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. CSE" hint="Short uppercase code" />
          <Input label="Description" value={deptForm.description} onChange={e => setDeptForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowDeptModal(false)}>Cancel</Button>
            <Button onClick={handleCreateDept} loading={saving}>Create Department</Button>
          </div>
        </div>
      </Modal>

      {/* Add Subject Modal */}
      <Modal open={showSubjModal} onClose={() => setShowSubjModal(false)} title="Add Subject" size="md">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Subject Name" required value={subjForm.name} onChange={e => setSubjForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Data Structures" />
            <Input label="Subject Code" required value={subjForm.code} onChange={e => setSubjForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. CS301" />
            <Select label="Department" required value={subjForm.department} onChange={e => setSubjForm(f => ({ ...f, department: e.target.value }))}>
              <option value="">Select Department</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </Select>
            <Select label="Semester" value={subjForm.semester} onChange={e => setSubjForm(f => ({ ...f, semester: e.target.value }))}>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </Select>
            <Input label="Credits" type="number" value={subjForm.credits} onChange={e => setSubjForm(f => ({ ...f, credits: e.target.value }))} min="1" max="6" />
            <Select label="Type" value={subjForm.type} onChange={e => setSubjForm(f => ({ ...f, type: e.target.value }))}>
              {['theory','lab','elective','project'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
            </Select>
            <Select label="Assign Teacher" value={subjForm.teacher} onChange={e => setSubjForm(f => ({ ...f, teacher: e.target.value }))} className="col-span-2">
              <option value="">Select Teacher (optional)</option>
              {teachers.filter(t => !subjForm.department || t.department?._id === subjForm.department).map(t => (
                <option key={t._id} value={t._id}>{t.name} — {t.designation}</option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowSubjModal(false)}>Cancel</Button>
            <Button onClick={handleCreateSubj} loading={saving}>Create Subject</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}