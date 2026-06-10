import React, { useState, useEffect } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { marksAPI, studentsAPI, departmentsAPI } from '../../api';
import { PageHeader, Card, Select, Button, Input, Badge, Avatar } from '../../components/ui';
import toast from 'react-hot-toast';

const EXAM_TYPES = [
  { value: 'internal1', label: 'Internal Test 1', max: 25 },
  { value: 'internal2', label: 'Internal Test 2', max: 25 },
  { value: 'practical', label: 'Practical / Lab', max: 30 },
  { value: 'assignment', label: 'Assignment', max: 10 },
  { value: 'external', label: 'External / Final', max: 70 },
  { value: 'project', label: 'Project', max: 50 },
];

const getGrade = (marks, max) => {
  const p = (marks / max) * 100;
  if (p >= 90) return { g: 'A+', color: 'text-emerald-600 bg-emerald-50' };
  if (p >= 80) return { g: 'A',  color: 'text-blue-700 bg-blue-50' };
  if (p >= 70) return { g: 'B+', color: 'text-purple-600 bg-purple-50' };
  if (p >= 60) return { g: 'B',  color: 'text-indigo-600 bg-indigo-50' };
  if (p >= 50) return { g: 'C',  color: 'text-amber-600 bg-amber-50' };
  return { g: 'F', color: 'text-red-600 bg-red-50' };
};

export default function EnterMarks() {
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [filters, setFilters] = useState({ department: '', semester: '', section: '', examType: 'internal1', subjectName: '', academicYear: '2024-25' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const examConfig = EXAM_TYPES.find(e => e.value === filters.examType) || EXAM_TYPES[0];

  useEffect(() => { departmentsAPI.getAll().then(({ data }) => setDepartments(data.data)).catch(() => {}); }, []);

  useEffect(() => {
    if (!filters.department || !filters.semester) return;
    setLoading(true);
    studentsAPI.getAll({ department: filters.department, semester: filters.semester, section: filters.section, limit: 100 })
      .then(({ data }) => {
        setStudents(data.data);
        const init = {};
        data.data.forEach(s => { init[s._id] = ''; });
        setMarksData(init);
        setSaved(false);
      })
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false));
  }, [filters.department, filters.semester, filters.section]);

  const setMark = (sid, val) => {
    const num = val === '' ? '' : Math.min(Number(val), examConfig.max);
    setMarksData(m => ({ ...m, [sid]: num === 0 ? 0 : num }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!filters.department || !filters.semester) return toast.error('Select department and semester');
    const records = students
      .filter(s => marksData[s._id] !== '' && marksData[s._id] !== undefined)
      .map(s => ({ student: s._id, marks: Number(marksData[s._id]) }));
    if (!records.length) return toast.error('Enter marks for at least one student');
    setSaving(true);
    try {
      await marksAPI.bulk({
        subject: filters.subjectName,
        semester: Number(filters.semester),
        academicYear: filters.academicYear,
        examType: filters.examType,
        maxMarks: examConfig.max,
        records,
      });
      toast.success(`Marks saved for ${records.length} students`);
      setSaved(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save marks');
    } finally { setSaving(false); }
  };

  const filled = Object.values(marksData).filter(v => v !== '').length;
  const avg = filled > 0
    ? Math.round(Object.values(marksData).filter(v => v !== '').reduce((a, v) => a + Number(v), 0) / filled)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Enter Marks" subtitle="Record and save student marks" breadcrumb="Home / Marks / Enter" />

      <div className="p-6 space-y-5">
        {/* Filters */}
        <Card>
          <h3 className="text-sm font-bold text-gray-700 mb-4">Select Class & Exam</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
              {['A','B','C','D'].map(s => <option key={s} value={s}>Sec {s}</option>)}
            </Select>
            <Select value={filters.examType} onChange={e => setFilters(f => ({ ...f, examType: e.target.value }))}>
              {EXAM_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </Select>
            <input placeholder="Subject name" value={filters.subjectName} onChange={e => setFilters(f => ({ ...f, subjectName: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Academic Year" value={filters.academicYear} onChange={e => setFilters(f => ({ ...f, academicYear: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </Card>

        {students.length > 0 && (
          <>
            {/* Info bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm">
              <div className="flex gap-4">
                <span>📋 <strong>{examConfig.label}</strong></span>
                <span>Max Marks: <strong>{examConfig.max}</strong></span>
                <span>Students: <strong>{students.length}</strong></span>
                <span>Filled: <strong className="text-blue-700">{filled}</strong></span>
                {filled > 0 && <span>Avg: <strong className="text-purple-700">{avg}/{examConfig.max}</strong></span>}
              </div>
            </div>

            {/* Marks table */}
            <Card padding={false}>
              <div className="grid grid-cols-12 gap-0 bg-gray-50 border-b border-gray-200 px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Student</div>
                <div className="col-span-3">Roll No</div>
                <div className="col-span-2 text-center">Marks /{examConfig.max}</div>
                <div className="col-span-2 text-center">Grade</div>
              </div>
              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  </div>
                ) : students.map((s, i) => {
                  const val = marksData[s._id];
                  const hasVal = val !== '' && val !== undefined;
                  const grade = hasVal ? getGrade(Number(val), examConfig.max) : null;
                  return (
                    <div key={s._id} className="grid grid-cols-12 gap-0 items-center px-5 py-2.5 hover:bg-gray-50 transition-colors">
                      <div className="col-span-1 text-xs text-gray-400">{i + 1}</div>
                      <div className="col-span-4 flex items-center gap-2">
                        <Avatar name={s.name} size="xs" color="blue" />
                        <span className="text-sm font-semibold text-gray-900 truncate">{s.name}</span>
                      </div>
                      <div className="col-span-3 font-mono text-xs text-gray-500">{s.rollNo}</div>
                      <div className="col-span-2 flex justify-center">
                        <input
                          type="number" min="0" max={examConfig.max}
                          value={val === undefined ? '' : val}
                          onChange={e => setMark(s._id, e.target.value)}
                          placeholder="—"
                          className={`w-20 text-center border rounded-lg py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                            ${hasVal ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-gray-200 bg-white text-gray-700'}`}
                        />
                      </div>
                      <div className="col-span-2 flex justify-center">
                        {grade ? (
                          <span className={`text-xs font-extrabold px-2 py-1 rounded-lg ${grade.color}`}>{grade.g}</span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {saved ? (
              <div className="flex items-center justify-center gap-3 p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle size={22} className="text-emerald-600" />
                <p className="font-bold text-emerald-800">Marks saved successfully for {filled} students!</p>
              </div>
            ) : (
              <div className="flex justify-end">
                <Button icon={Save} onClick={handleSave} loading={saving} size="lg">Save Marks ({filled} entries)</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}