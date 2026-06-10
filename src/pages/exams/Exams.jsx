// Exams.jsx
import React, { useState, useEffect } from 'react';
import { Plus, BookMarked, Calendar } from 'lucide-react';
import { examsAPI, departmentsAPI } from '../../api';
import { PageHeader, Card, Table, Badge, Button, Select, Modal, Input, Textarea } from '../../components/ui';
import toast from 'react-hot-toast';

export function Exams() {
  const [exams, setExams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'internal', semester: '', department: '', startDate: '', endDate: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    departmentsAPI.getAll().then(({ data }) => setDepartments(data.data)).catch(() => {});
    examsAPI.getAll().then(({ data }) => setExams(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await examsAPI.create(form);
      toast.success('Exam scheduled');
      setShowModal(false);
      examsAPI.getAll().then(({ data }) => setExams(data.data));
    } catch { toast.error('Failed to create exam'); }
    finally { setSaving(false); }
  };

  const TYPE_COLORS = { internal: 'primary', external: 'danger', practical: 'purple', project: 'teal', quiz: 'orange' };

  const columns = [
    { header: 'Exam Name', render: r => <div><p className="font-semibold">{r.name}</p><p className="text-xs text-gray-400">{r.academicYear}</p></div> },
    { header: 'Type', render: r => <Badge variant={TYPE_COLORS[r.type] || 'default'}>{r.type}</Badge> },
    { header: 'Department', render: r => <span className="text-sm">{r.department?.name || 'All'}</span> },
    { header: 'Semester', render: r => <span>{r.semester ? `Sem ${r.semester}` : 'All'}</span> },
    { header: 'Start Date', render: r => <span className="text-sm">{r.startDate ? new Date(r.startDate).toLocaleDateString('en-IN') : '—'}</span> },
    { header: 'End Date', render: r => <span className="text-sm">{r.endDate ? new Date(r.endDate).toLocaleDateString('en-IN') : '—'}</span> },
    { header: 'Status', render: r => {
      const now = new Date();
      const start = new Date(r.startDate); const end = new Date(r.endDate);
      if (now < start) return <Badge variant="warning">Upcoming</Badge>;
      if (now > end) return <Badge variant="default">Completed</Badge>;
      return <Badge variant="success">Ongoing</Badge>;
    }},
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Exams" subtitle="Schedule and manage examinations" breadcrumb="Home / Exams"
        actions={<Button icon={Plus} onClick={() => setShowModal(true)}>Schedule Exam</Button>}
      />
      <div className="p-6">
        <Card padding={false}>
          <Table columns={columns} data={exams} loading={loading} emptyText="No exams scheduled" />
        </Card>
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Schedule New Exam">
        <div className="p-6 space-y-4">
          <Input label="Exam Name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Unit Test 1 - 2024" />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {['internal','external','practical','project','quiz'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
            </Select>
            <Select label="Semester" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>
              <option value="">All Semesters</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </Select>
            <Select label="Department" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </Select>
            <Input label="Academic Year" value={form.academicYear || '2024-25'} onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))} />
            <Input label="Start Date" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            <Input label="End Date" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving}>Schedule Exam</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Exams;