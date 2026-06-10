// ============ Teachers.jsx ============
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Eye, Users, Phone, Mail, BookOpen } from 'lucide-react';
import { teachersAPI, departmentsAPI } from '../../api';
import {
  PageHeader, Card, Table, Badge, Button, SearchBar,
  Select, Avatar, Pagination, StatCard, Modal
} from '../../components/ui';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const DESIGNATION_LABELS = {
  professor: 'Professor',
  associate_professor: 'Associate Professor',
  assistant_professor: 'Assistant Professor',
  lecturer: 'Lecturer',
  senior_lecturer: 'Sr. Lecturer',
  visiting_faculty: 'Visiting Faculty',
  hod: 'HOD',
};
const DESIGNATION_COLORS = {
  professor: 'purple', associate_professor: 'blue', assistant_professor: 'teal',
  lecturer: 'orange', senior_lecturer: 'warning', visiting_faculty: 'default', hod: 'danger',
};

export function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [viewTeacher, setViewTeacher] = useState(null);
  const { isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (deptFilter) params.department = deptFilter;
      const { data } = await teachersAPI.getAll(params);
      setTeachers(data.data);
    } catch { toast.error('Failed to load teachers'); }
    finally { setLoading(false); }
  }, [search, deptFilter]);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);
  useEffect(() => { departmentsAPI.getAll().then(({ data }) => setDepartments(data.data)).catch(() => {}); }, []);

  const columns = [
    {
      header: 'Teacher',
      render: row => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" color="green" />
          <div>
            <p className="font-semibold text-sm text-gray-900">{row.name}</p>
            <p className="text-xs text-gray-400">{row.email}</p>
          </div>
        </div>
      )
    },
    { header: 'Employee ID', render: row => <span className="font-mono text-sm font-semibold text-green-700">{row.employeeId}</span> },
    { header: 'Department', render: row => <span className="text-sm">{row.department?.name || '—'}</span> },
    {
      header: 'Designation',
      render: row => <Badge variant={DESIGNATION_COLORS[row.designation] || 'default'}>{DESIGNATION_LABELS[row.designation] || row.designation}</Badge>
    },
    { header: 'Qualification', render: row => <span className="text-sm text-gray-600">{row.qualification || '—'}</span> },
    { header: 'Exp.', render: row => <span className="text-sm">{row.experience ? `${row.experience} yrs` : '—'}</span> },
    {
      header: 'Actions', cellClass: 'text-right',
      render: row => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => setViewTeacher(row)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"><Eye size={15} /></button>
          {isAdmin() && <button onClick={() => navigate(`/teachers/${row._id}/edit`)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md"><Pencil size={15} /></button>}
        </div>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Teachers & Faculty" subtitle={`${teachers.length} faculty members`} breadcrumb="Home / Teachers"
        actions={isAdmin() && <Button icon={Plus} onClick={() => navigate('/teachers/add')}>Add Teacher</Button>}
      />
      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Faculty" value={teachers.length} icon={Users} color="green" />
          <StatCard title="Professors" value={teachers.filter(t => t.designation === 'professor').length} icon={BookOpen} color="purple" />
          <StatCard title="HODs" value={teachers.filter(t => t.designation === 'hod').length} icon={Users} color="teal" />
          <StatCard title="Visiting" value={teachers.filter(t => t.designation === 'visiting_faculty').length} icon={Users} color="orange" />
        </div>

        <Card padding={false}>
          <div className="p-4 flex flex-wrap gap-3">
            <SearchBar value={search} onChange={v => setSearch(v)} placeholder="Search by name, employee ID..." className="flex-1 min-w-[200px]" />
            <Select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="w-44">
              <option value="">All Departments</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </Select>
          </div>
          <Table columns={columns} data={teachers} loading={loading} emptyText="No teachers found" />
        </Card>
      </div>

      {/* View Modal */}
      <Modal open={!!viewTeacher} onClose={() => setViewTeacher(null)} title="Teacher Details" size="md">
        {viewTeacher && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={viewTeacher.name} size="lg" color="green" />
              <div>
                <h3 className="font-bold text-gray-900">{viewTeacher.name}</h3>
                <p className="text-sm text-gray-500">{DESIGNATION_LABELS[viewTeacher.designation]}</p>
                <Badge variant={DESIGNATION_COLORS[viewTeacher.designation] || 'default'}>{viewTeacher.department?.name}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Employee ID', viewTeacher.employeeId],
                ['Email', viewTeacher.email],
                ['Phone', viewTeacher.phone || '—'],
                ['Qualification', viewTeacher.qualification || '—'],
                ['Specialization', viewTeacher.specialization || '—'],
                ['Experience', viewTeacher.experience ? `${viewTeacher.experience} years` : '—'],
                ['Joining Date', viewTeacher.joiningDate ? new Date(viewTeacher.joiningDate).toLocaleDateString('en-IN') : '—'],
              ].map(([l, v]) => (
                <div key={l} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{l}</p>
                  <p className="font-medium text-gray-800 break-all">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ============ TeacherForm.jsx ============
export function TeacherForm() {
  const { id } = require('react-router-dom').useParams ? require('react-router-dom').useParams() : {};
  const navigate = useNavigate();
  const isEdit = !!id;
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', employeeId: '', email: '', phone: '', gender: '',
    dateOfBirth: '', address: '', aadharNo: '', qualification: '',
    specialization: '', experience: '', joiningDate: '',
    designation: 'assistant_professor', department: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    departmentsAPI.getAll().then(({ data }) => setDepartments(data.data)).catch(() => {});
    if (isEdit) {
      teachersAPI.getOne(id).then(({ data }) => {
        const t = data.data;
        setForm({ ...t, department: t.department?._id || '', joiningDate: t.joiningDate?.split('T')[0] || '', dateOfBirth: t.dateOfBirth?.split('T')[0] || '' });
      }).catch(() => toast.error('Failed to load teacher'));
    }
  }, [id, isEdit]);

  const set = f => e => setForm(prev => ({ ...prev, [f]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name required';
    if (!form.employeeId.trim()) e.employeeId = 'Employee ID required';
    if (!form.email.trim()) e.email = 'Email required';
    if (!form.department) e.department = 'Department required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return toast.error('Please fix errors');
    setLoading(true);
    try {
      if (isEdit) { await teachersAPI.update(id, form); toast.success('Teacher updated'); }
      else { await teachersAPI.create(form); toast.success('Teacher added! Default password = employee ID (lowercase)'); }
      navigate('/teachers');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setLoading(false); }
  };

  const { Input, Select: Sel, PageHeader: PH, Card: C, Button: Btn } = require('../../components/ui');

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={isEdit ? 'Edit Teacher' : 'Add Teacher'} breadcrumb="Home / Teachers / Form"
        actions={<Button variant="secondary" onClick={() => navigate('/teachers')}>Cancel</Button>}
      />
      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <Card>
            <h3 className="text-sm font-bold text-gray-700 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
              <Input label="Full Name" required value={form.name} onChange={set('name')} error={errors.name} placeholder="Prof. Ankit Gupta" />
              <Input label="Employee ID" required value={form.employeeId} onChange={set('employeeId')} error={errors.employeeId} placeholder="FAC-CS-042" />
              <Input label="Email" required type="email" value={form.email} onChange={set('email')} error={errors.email} />
              <Input label="Phone" value={form.phone} onChange={set('phone')} />
              <Select label="Gender" value={form.gender} onChange={set('gender')}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
              <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
            </div>
            <h3 className="text-sm font-bold text-gray-700 mb-4">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <Select label="Department" required value={form.department} onChange={set('department')} error={errors.department}>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </Select>
              <Select label="Designation" value={form.designation} onChange={set('designation')}>
                {Object.entries(DESIGNATION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
              <Input label="Qualification" value={form.qualification} onChange={set('qualification')} placeholder="Ph.D, M.Tech..." />
              <Input label="Specialization" value={form.specialization} onChange={set('specialization')} placeholder="Machine Learning..." />
              <Input label="Experience (years)" type="number" value={form.experience} onChange={set('experience')} />
              <Input label="Joining Date" type="date" value={form.joiningDate} onChange={set('joiningDate')} />
              <Input label="Address" value={form.address} onChange={set('address')} className="lg:col-span-2" />
            </div>
            <div className="flex justify-end mt-6">
              <Button type="submit" loading={loading}>{isEdit ? 'Save Changes' : 'Add Teacher'}</Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}

export default Teachers;