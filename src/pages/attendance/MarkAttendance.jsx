import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Users, Save } from 'lucide-react';
import { attendanceAPI, departmentsAPI, studentsAPI } from '../../api';
import { PageHeader, Card, Select, Button, Badge, Avatar } from '../../components/ui';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  present: { label: 'P', color: 'bg-emerald-500 text-white', hover: 'hover:bg-emerald-600', badge: 'success' },
  absent:  { label: 'A', color: 'bg-red-500 text-white',     hover: 'hover:bg-red-600',     badge: 'danger' },
  late:    { label: 'L', color: 'bg-amber-400 text-white',   hover: 'hover:bg-amber-500',   badge: 'warning' },
};

export default function MarkAttendance() {
  const [departments, setDepartments] = useState([]);
  const [students, setStudents]       = useState([]);
  const [attendance, setAttendance]   = useState({});
  const [filters, setFilters]         = useState({ department: '', semester: '', section: '', subject: '' });
  const [date, setDate]               = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving]           = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => { departmentsAPI.getAll().then(({ data }) => setDepartments(data.data)).catch(() => {}); }, []);

  useEffect(() => {
    if (!filters.department || !filters.semester) return;
    setLoadingStudents(true);
    studentsAPI.getAll({ department: filters.department, semester: filters.semester, section: filters.section, limit: 100 })
      .then(({ data }) => {
        setStudents(data.data);
        const init = {};
        data.data.forEach(s => { init[s._id] = 'present'; });
        setAttendance(init);
        setSubmitted(false);
      })
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoadingStudents(false));
  }, [filters.department, filters.semester, filters.section]);

  const setStatus = (studentId, status) => setAttendance(a => ({ ...a, [studentId]: status }));

  const markAll = (status) => {
    const updated = {};
    students.forEach(s => { updated[s._id] = status; });
    setAttendance(updated);
  };

  const handleSubmit = async () => {
    if (!filters.department || !filters.semester) return toast.error('Select department and semester');
    if (!students.length) return toast.error('No students loaded');
    setSaving(true);
    try {
      const records = students.map(s => ({ student: s._id, status: attendance[s._id] || 'present' }));
      await attendanceAPI.mark({
        subject: filters.subject || undefined,
        date,
        semester: Number(filters.semester),
        section: filters.section,
        department: filters.department,
        academicYear: '2024-25',
        records,
      });
      toast.success(`Attendance marked for ${students.length} students`);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally { setSaving(false); }
  };

  const presentCount = Object.values(attendance).filter(v => v === 'present').length;
  const absentCount  = Object.values(attendance).filter(v => v === 'absent').length;
  const lateCount    = Object.values(attendance).filter(v => v === 'late').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Mark Attendance" subtitle="Record student presence for a class" breadcrumb="Home / Attendance / Mark" />

      <div className="p-6 space-y-5">
        {/* Filters */}
        <Card>
          <h3 className="text-sm font-bold text-gray-700 mb-4">Select Class</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <Select value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}>
              <option value="">Department *</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </Select>
            <Select value={filters.semester} onChange={e => setFilters(f => ({ ...f, semester: e.target.value }))}>
              <option value="">Semester *</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </Select>
            <Select value={filters.section} onChange={e => setFilters(f => ({ ...f, section: e.target.value }))}>
              <option value="">All Sections</option>
              {['A','B','C','D'].map(s => <option key={s} value={s}>Section {s}</option>)}
            </Select>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="text" value={filters.subject} onChange={e => setFilters(f => ({ ...f, subject: e.target.value }))}
              placeholder="Subject (optional)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </Card>

        {students.length > 0 && (
          <>
            {/* Summary + bulk actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  <CheckCircle size={16} className="text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-700">Present: {presentCount}</span>
                </div>
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <XCircle size={16} className="text-red-500" />
                  <span className="text-sm font-bold text-red-600">Absent: {absentCount}</span>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <Clock size={16} className="text-amber-500" />
                  <span className="text-sm font-bold text-amber-600">Late: {lateCount}</span>
                </div>
                <span className="text-sm text-gray-400">Total: {students.length}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Mark all:</span>
                <button onClick={() => markAll('present')} className="px-3 py-1.5 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors">✓ Present</button>
                <button onClick={() => markAll('absent')} className="px-3 py-1.5 text-xs font-bold bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors">✗ Absent</button>
              </div>
            </div>

            {/* Student List */}
            <Card padding={false}>
              {loadingStudents ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {students.map((s, i) => {
                    const status = attendance[s._id] || 'present';
                    return (
                      <div key={s._id} className={`flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors ${status === 'absent' ? 'bg-red-50/30' : ''}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 w-6 text-center font-mono">{i + 1}</span>
                          <Avatar name={s.name} size="sm" color="blue" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                            <p className="text-xs text-gray-400 font-mono">{s.rollNo}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <button
                              key={key}
                              onClick={() => setStatus(s._id, key)}
                              className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${status === key ? cfg.color + ' shadow-sm scale-110' : 'bg-gray-100 text-gray-500 ' + cfg.hover.replace('hover:bg-', 'hover:bg-').replace('-500', '-100').replace('-400', '-100')}`}
                            >
                              {cfg.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Submit */}
            {submitted ? (
              <div className="flex items-center justify-center gap-3 p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle size={24} className="text-emerald-600" />
                <div>
                  <p className="font-bold text-emerald-800">Attendance submitted successfully!</p>
                  <p className="text-sm text-emerald-600">{presentCount} present · {absentCount} absent · {lateCount} late</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <Button icon={Save} onClick={handleSubmit} loading={saving} size="lg">
                  Submit Attendance ({students.length} students)
                </Button>
              </div>
            )}
          </>
        )}

        {!students.length && filters.department && filters.semester && !loadingStudents && (
          <Card>
            <div className="flex flex-col items-center py-12 text-gray-400">
              <Users size={40} className="mb-3 text-gray-300" strokeWidth={1} />
              <p className="font-medium">No students found for selected filters</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}