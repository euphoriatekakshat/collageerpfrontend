import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { studentsAPI, departmentsAPI } from '../../api';
import { PageHeader, Card, Input, Select, Button, Alert } from '../../components/ui';
import toast from 'react-hot-toast';

const INITIAL = {
  name: '', rollNo: '', email: '', phone: '', gender: '',
  dateOfBirth: '', bloodGroup: '', address: '', aadharNo: '', category: 'general',
  department: '', semester: '1', section: '', course: 'B.Tech',
  academicYear: '2024-25', admissionYear: '2024', batch: '2024-2028',
  parentName: '', parentPhone: '', parentEmail: '', parentOccupation: '',
  hostelResident: false, transportRoute: '',
};

export default function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState(INITIAL);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    departmentsAPI.getAll().then(({ data }) => setDepartments(data.data)).catch(() => {});
    if (isEdit) {
      studentsAPI.getOne(id).then(({ data }) => {
        const s = data.data;
        setForm({
          ...INITIAL, ...s,
          department: s.department?._id || '',
          dateOfBirth: s.dateOfBirth ? s.dateOfBirth.split('T')[0] : '',
        });
      }).catch(() => toast.error('Failed to load student')).finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.rollNo.trim()) e.rollNo = 'Roll number is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.department) e.department = 'Department is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors'); return; }
    setLoading(true);
    try {
      if (isEdit) {
        await studentsAPI.update(id, form);
        toast.success('Student updated successfully');
      } else {
        const { data } = await studentsAPI.create(form);
        toast.success(data.message || 'Student created successfully');
      }
      navigate('/students');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { key: 'personal', label: 'Personal Info' },
    { key: 'academic', label: 'Academic Info' },
    { key: 'parent', label: 'Parent / Guardian' },
    { key: 'other', label: 'Hostel & Transport' },
  ];

  if (fetching) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={isEdit ? 'Edit Student' : 'Add New Student'}
        subtitle={isEdit ? `Editing: ${form.name}` : 'Fill in the details to register a new student'}
        breadcrumb={`Home / Students / ${isEdit ? 'Edit' : 'Add'}`}
        actions={
          <Button variant="secondary" onClick={() => navigate('/students')}>Cancel</Button>
        }
      />

      <div className="p-6">
        {!isEdit && (
          <Alert type="info" title="Auto-created Login"
            message="A login account will be automatically created. Default password = roll number (lowercase)."
            className="mb-5"
          />
        )}

        <form onSubmit={handleSubmit}>
          <Card padding={false}>
            {/* Tabs */}
            <div className="border-b border-gray-200 px-6">
              <div className="flex gap-0">
                {TABS.map(t => (
                  <button
                    key={t.key} type="button"
                    onClick={() => setActiveTab(t.key)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === t.key ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {/* Personal Info */}
              {activeTab === 'personal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <Input label="Full Name" required value={form.name} onChange={set('name')} error={errors.name} placeholder="e.g. Rahul Sharma" />
                  <Input label="Roll Number" required value={form.rollNo} onChange={set('rollNo')} error={errors.rollNo} placeholder="e.g. CS21B042" />
                  <Input label="Enrollment Number" value={form.enrollmentNo || ''} onChange={set('enrollmentNo')} placeholder="e.g. 0901CS211042" />
                  <Input label="Email Address" required type="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="student@college.edu" />
                  <Input label="Phone Number" type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
                  <Select label="Gender" value={form.gender} onChange={set('gender')}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                  <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
                  <Select label="Blood Group" value={form.bloodGroup} onChange={set('bloodGroup')}>
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
                  </Select>
                  <Select label="Category" value={form.category} onChange={set('category')}>
                    <option value="general">General</option>
                    <option value="obc">OBC</option>
                    <option value="sc">SC</option>
                    <option value="st">ST</option>
                    <option value="ews">EWS</option>
                  </Select>
                  <Input label="Aadhar Number" value={form.aadharNo} onChange={set('aadharNo')} placeholder="xxxx xxxx xxxx" />
                  <Input label="Address" value={form.address} onChange={set('address')} placeholder="City, State" className="md:col-span-2" />
                </div>
              )}

              {/* Academic */}
              {activeTab === 'academic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <Select label="Department" required value={form.department} onChange={set('department')} error={errors.department}>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name} ({d.code})</option>)}
                  </Select>
                  <Select label="Course" value={form.course} onChange={set('course')}>
                    {['B.Tech','B.E.','BCA','MCA','MBA','M.Tech','B.Sc','M.Sc','BBA','B.Com'].map(c => <option key={c}>{c}</option>)}
                  </Select>
                  <Select label="Semester" required value={form.semester} onChange={set('semester')}>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </Select>
                  <Input label="Section" value={form.section} onChange={set('section')} placeholder="e.g. A, B, C" />
                  <Input label="Academic Year" value={form.academicYear} onChange={set('academicYear')} placeholder="2024-25" />
                  <Input label="Admission Year" type="number" value={form.admissionYear} onChange={set('admissionYear')} placeholder="2024" />
                  <Input label="Batch" value={form.batch} onChange={set('batch')} placeholder="e.g. 2024-2028" />
                </div>
              )}

              {/* Parent */}
              {activeTab === 'parent' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <Input label="Parent / Guardian Name" value={form.parentName} onChange={set('parentName')} placeholder="Father/Mother name" />
                  <Input label="Parent Phone" type="tel" value={form.parentPhone} onChange={set('parentPhone')} placeholder="+91 98765 43210" />
                  <Input label="Parent Email" type="email" value={form.parentEmail} onChange={set('parentEmail')} placeholder="parent@email.com" />
                  <Input label="Parent Occupation" value={form.parentOccupation} onChange={set('parentOccupation')} placeholder="e.g. Business" />
                  <Input label="Guardian Name (if different)" value={form.guardianName || ''} onChange={set('guardianName')} placeholder="Guardian name" />
                  <Input label="Guardian Phone" type="tel" value={form.guardianPhone || ''} onChange={set('guardianPhone')} />
                </div>
              )}

              {/* Other */}
              {activeTab === 'other' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                    <input type="checkbox" id="hostel" checked={form.hostelResident} onChange={set('hostelResident')} className="w-4 h-4 text-blue-600 rounded" />
                    <label htmlFor="hostel" className="text-sm font-medium text-gray-700">Hostel Resident</label>
                  </div>
                  {form.hostelResident && (
                    <Input label="Hostel Room Number" value={form.hostelRoom || ''} onChange={set('hostelRoom')} placeholder="e.g. A-204" />
                  )}
                  <Input label="Transport Route" value={form.transportRoute} onChange={set('transportRoute')} placeholder="e.g. Route 5 - Vijay Nagar" />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="flex gap-2">
                {TABS.findIndex(t => t.key === activeTab) > 0 && (
                  <Button variant="secondary" type="button"
                    onClick={() => setActiveTab(TABS[TABS.findIndex(t => t.key === activeTab) - 1].key)}>
                    ← Previous
                  </Button>
                )}
                {TABS.findIndex(t => t.key === activeTab) < TABS.length - 1 && (
                  <Button type="button"
                    onClick={() => setActiveTab(TABS[TABS.findIndex(t => t.key === activeTab) + 1].key)}>
                    Next →
                  </Button>
                )}
              </div>
              {activeTab === 'other' && (
                <Button type="submit" loading={loading}>
                  {isEdit ? 'Save Changes' : 'Register Student'}
                </Button>
              )}
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}