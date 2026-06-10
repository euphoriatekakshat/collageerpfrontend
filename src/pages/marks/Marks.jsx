// Marks.jsx — View marks/results
import React, { useState, useEffect } from 'react';
import { marksAPI, studentsAPI, departmentsAPI } from '../../api';
import { PageHeader, Card, Select, Button, Table, Badge, SearchBar, Input, PageLoader } from '../../components/ui';
import toast from 'react-hot-toast';

const GRADE = (marks, max) => {
  const p = (marks / max) * 100;
  if (p >= 90) return { g: 'A+', v: 'success' };
  if (p >= 80) return { g: 'A',  v: 'primary' };
  if (p >= 70) return { g: 'B+', v: 'purple' };
  if (p >= 60) return { g: 'B',  v: 'warning' };
  if (p >= 50) return { g: 'C',  v: 'orange' };
  return { g: 'F', v: 'danger' };
};

export default function Marks() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [marks, setMarks] = useState([]);
  const [selected, setSelected] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    departmentsAPI.getAll().then(({ data }) => setDepartments(data.data)).catch(() => {});
  }, []);

  const searchStudents = async (q) => {
    if (q.length < 2) return;
    try {
      const { data } = await studentsAPI.getAll({ search: q, limit: 10 });
      setStudents(data.data);
    } catch {}
  };

  const fetchMarks = async (sid) => {
    setLoading(true);
    try {
      const { data } = await marksAPI.getStudent(sid);
      setMarks(data.data);
    } catch { toast.error('Failed to load marks'); }
    finally { setLoading(false); }
  };

  const selectedStudent = students.find(s => s._id === selected);

  const columns = [
    { header: 'Subject', render: r => <span className="font-medium">{r.subject?.name} <span className="text-gray-400 text-xs">({r.subject?.code})</span></span> },
    { header: 'Exam Type', render: r => <Badge variant="default">{r.examType}</Badge> },
    { header: 'Marks', render: r => <span className="font-bold text-blue-700">{r.marksObtained}</span> },
    { header: 'Max', render: r => <span className="text-gray-500">{r.maxMarks}</span> },
    { header: '%', render: r => <span className="font-semibold">{Math.round((r.marksObtained / r.maxMarks) * 100)}%</span> },
    { header: 'Grade', render: r => { const g = GRADE(r.marksObtained, r.maxMarks); return <Badge variant={g.v}>{g.g}</Badge>; } },
    { header: 'Semester', render: r => <span className="text-sm">Sem {r.semester}</span> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Marks & Results" subtitle="View student academic performance" breadcrumb="Home / Marks"
        actions={<Button onClick={() => window.location.href = '/marks/enter'}>Enter Marks</Button>}
      />
      <div className="p-6 space-y-5">
        <Card>
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="relative flex-1 min-w-[250px]">
              <SearchBar value={search} onChange={v => { setSearch(v); searchStudents(v); }} placeholder="Search student by name or roll no..." />
              {students.length > 0 && search && !selected && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {students.map(s => (
                    <button key={s._id} onClick={() => { setSelected(s._id); setSearch(s.name); fetchMarks(s._id); setStudents([]); }}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0">
                      <p className="font-semibold text-sm text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.rollNo} · {s.department?.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selected && <Button variant="ghost" size="sm" onClick={() => { setSelected(''); setSearch(''); setMarks([]); }}>Clear</Button>}
          </div>

          {selectedStudent && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {selectedStudent.name.split(' ').map(n => n[0]).join('').slice(0,2)}
              </div>
              <div>
                <p className="font-bold text-gray-900">{selectedStudent.name}</p>
                <p className="text-sm text-gray-500">{selectedStudent.rollNo} · Sem {selectedStudent.semester} · {selectedStudent.department?.name}</p>
              </div>
              {marks.length > 0 && (
                <div className="ml-auto text-right">
                  <p className="text-sm text-gray-500">Avg: <strong className="text-blue-700">{Math.round(marks.reduce((a,m) => a + (m.marksObtained/m.maxMarks)*100, 0) / marks.length)}%</strong></p>
                </div>
              )}
            </div>
          )}

          {loading ? <PageLoader /> : selected ? (
            <Table columns={columns} data={marks} emptyText="No marks found for this student" />
          ) : (
            <p className="text-center text-gray-400 py-10">Search and select a student to view marks</p>
          )}
        </Card>
      </div>
    </div>
  );
}