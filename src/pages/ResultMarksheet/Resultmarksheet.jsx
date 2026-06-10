import React, { useState, useEffect } from 'react';
import { Download, Trophy, TrendingUp, BookOpen } from 'lucide-react';
import { studentsAPI, marksAPI, departmentsAPI } from '../../api';
import { PageHeader, Card, SearchBar, Select, Button, Badge, Modal, ProgressBar, Avatar, PageLoader } from '../../components/ui';

const GRADE_POINT = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C': 6, 'D': 5, 'F': 0 };

function calcGrade(marks, max) {
  const p = (marks / max) * 100;
  if (p >= 90) return 'A+';
  if (p >= 80) return 'A';
  if (p >= 70) return 'B+';
  if (p >= 60) return 'B';
  if (p >= 50) return 'C';
  if (p >= 40) return 'D';
  return 'F';
}

function calcSGPA(marks) {
  if (!marks.length) return 0;
  const totalCredits = marks.length * 3;
  const earned = marks.reduce((a, m) => {
    const g = calcGrade(m.marksObtained, m.maxMarks);
    return a + (GRADE_POINT[g] || 0) * 3;
  }, 0);
  return (earned / totalCredits).toFixed(2);
}

const GRADE_COLORS = { 'A+': 'success', 'A': 'primary', 'B+': 'purple', 'B': 'teal', 'C': 'warning', 'D': 'orange', 'F': 'danger' };

export default function ResultMarksheet() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [marks, setMarks] = useState([]);
  const [loadingMarks, setLoadingMarks] = useState(false);
  const [semester, setSemester] = useState('');
  const [showMarksheet, setShowMarksheet] = useState(false);

  useEffect(() => { departmentsAPI.getAll().then(({ data }) => setDepartments(data.data)).catch(() => {}); }, []);

  const searchStudents = async q => {
    if (q.length < 2) return setStudents([]);
    try { const { data } = await studentsAPI.getAll({ search: q, limit: 10 }); setStudents(data.data); } catch {}
  };

  const selectStudent = async s => {
    setSelected(s); setStudents([]); setSearch(s.name);
    setLoadingMarks(true);
    try {
      const { data } = await marksAPI.getStudent(s._id, { semester });
      setMarks(data.data);
    } catch { setMarks([]); }
    finally { setLoadingMarks(false); }
  };

  useEffect(() => {
    if (selected) selectStudent(selected);
  }, [semester]);

  // Group marks by semester
  const bySem = marks.reduce((acc, m) => {
    const s = m.semester || 0;
    if (!acc[s]) acc[s] = [];
    acc[s].push(m);
    return acc;
  }, {});

  // Group marks by subject within a semester
  const groupBySubject = (semMarks) => {
    const sub = {};
    semMarks.forEach(m => {
      const key = m.subject?._id || m.subject;
      if (!sub[key]) sub[key] = { subject: m.subject, marks: [] };
      sub[key].marks.push(m);
    });
    return Object.values(sub);
  };

  const sgpaList = Object.entries(bySem).map(([sem, m]) => ({
    sem: Number(sem),
    sgpa: calcSGPA(m),
    marks: m
  })).sort((a, b) => a.sem - b.sem);

  const cgpa = sgpaList.length
    ? (sgpaList.reduce((a, s) => a + Number(s.sgpa), 0) / sgpaList.length).toFixed(2)
    : '—';

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Result & Marksheet" subtitle="View and download student results" breadcrumb="Home / Marks / Results" />

      <div className="p-6 space-y-5">
        {/* Search */}
        <Card>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="relative flex-1 min-w-[240px]">
              <SearchBar value={search} onChange={v => { setSearch(v); searchStudents(v); setSelected(null); }}
                placeholder="Search student by name or roll no..." />
              {students.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                  {students.map(s => (
                    <button key={s._id} onClick={() => selectStudent(s)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-0">
                      <p className="font-semibold text-sm">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.rollNo} · {s.department?.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Select value={semester} onChange={e => setSemester(e.target.value)} className="w-32">
              <option value="">All Sems</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </Select>
            {selected && (
              <Button icon={Download} onClick={() => setShowMarksheet(true)}>Download Marksheet</Button>
            )}
          </div>
        </Card>

        {/* Student Summary */}
        {selected && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            {/* Profile card */}
            <Card className="lg:col-span-1">
              <div className="text-center">
                <Avatar name={selected.name} size="lg" color="blue" className="mx-auto mb-3" />
                <h3 className="font-bold text-gray-900">{selected.name}</h3>
                <p className="text-sm text-gray-500 font-mono">{selected.rollNo}</p>
                <p className="text-xs text-gray-400 mt-1">{selected.course || 'B.Tech'} · Sem {selected.semester}</p>
                <p className="text-xs text-gray-400">{selected.department?.name}</p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-4xl font-extrabold text-blue-700">{cgpa}</p>
                  <p className="text-sm text-gray-500 mt-1">Overall CGPA</p>
                  {Number(cgpa) >= 9 && <Badge variant="success" className="mt-2">🏆 Distinction</Badge>}
                  {Number(cgpa) >= 7.5 && Number(cgpa) < 9 && <Badge variant="primary" className="mt-2">First Class</Badge>}
                  {Number(cgpa) >= 6 && Number(cgpa) < 7.5 && <Badge variant="warning" className="mt-2">Second Class</Badge>}
                </div>
                <div className="mt-3 space-y-2">
                  {sgpaList.map(s => (
                    <div key={s.sem} className="flex justify-between text-sm">
                      <span className="text-gray-500">Sem {s.sem} SGPA</span>
                      <span className="font-bold text-gray-800">{s.sgpa}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Marks per semester */}
            <div className="lg:col-span-3 space-y-4">
              {loadingMarks ? <PageLoader /> : sgpaList.length === 0 ? (
                <Card>
                  <p className="text-center text-gray-400 py-10">No marks found for this student</p>
                </Card>
              ) : (
                sgpaList.map(({ sem, sgpa, marks: semMarks }) => (
                  <Card key={sem} padding={false}>
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">S{sem}</div>
                        <span className="font-bold text-gray-900">Semester {sem}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">SGPA:</span>
                        <span className={`text-lg font-extrabold ${Number(sgpa) >= 8 ? 'text-emerald-600' : Number(sgpa) >= 6 ? 'text-blue-700' : 'text-red-500'}`}>{sgpa}</span>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {groupBySubject(semMarks).map((subj, i) => {
                        const internal = subj.marks.filter(m => ['internal1','internal2','assignment'].includes(m.examType));
                        const external = subj.marks.find(m => m.examType === 'external');
                        const practical = subj.marks.find(m => m.examType === 'practical');
                        const totalObtained = subj.marks.reduce((a, m) => a + m.marksObtained, 0);
                        const totalMax = subj.marks.reduce((a, m) => a + m.maxMarks, 0);
                        const grade = calcGrade(totalObtained, totalMax);
                        const pct = Math.round((totalObtained / totalMax) * 100);
                        return (
                          <div key={i} className="px-5 py-3 flex items-center gap-4">
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-gray-900">{subj.subject?.name || 'Subject'}</p>
                              <div className="flex gap-3 mt-1 text-xs text-gray-500">
                                {internal.length > 0 && <span>Internal: {internal.reduce((a, m) => a + m.marksObtained, 0)}</span>}
                                {external && <span>External: {external.marksObtained}/{external.maxMarks}</span>}
                                {practical && <span>Practical: {practical.marksObtained}/{practical.maxMarks}</span>}
                              </div>
                              <ProgressBar value={pct} color="auto" showLabel={false} className="mt-1.5 w-40" />
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-extrabold text-gray-900">{totalObtained}<span className="text-sm text-gray-400 font-normal">/{totalMax}</span></p>
                              <Badge variant={GRADE_COLORS[grade] || 'default'}>{grade}</Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Marksheet Modal */}
      <Modal open={showMarksheet} onClose={() => setShowMarksheet(false)} title="Official Marksheet" size="xl">
        {selected && (
          <div className="p-6">
            <div className="border-2 border-gray-800 rounded-xl overflow-hidden">
              <div className="bg-blue-700 text-white text-center py-4">
                <p className="text-xl font-extrabold">SKILLER COLLEGE OF ENGINEERING & TECHNOLOGY</p>
                <p className="text-sm opacity-75">Affiliated to State Technical University</p>
                <p className="text-base font-bold mt-2 uppercase tracking-widest">Statement of Marks — Academic Year 2024-25</p>
              </div>
              <div className="bg-white p-6">
                <div className="grid grid-cols-3 gap-4 text-sm mb-5">
                  {[['Student Name', selected.name], ['Roll Number', selected.rollNo], ['Enrollment No', selected.enrollmentNo || '—'], ['Course', selected.course || 'B.Tech'], ['Department', selected.department?.name || '—'], ['Academic Year', '2024-25']].map(([l,v]) => (
                    <div key={l}><p className="text-xs text-gray-400">{l}</p><p className="font-semibold">{v}</p></div>
                  ))}
                </div>
                {sgpaList.map(({ sem, sgpa, marks: semMarks }) => (
                  <div key={sem} className="mb-5">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-gray-800">Semester {sem}</p>
                      <p className="text-sm font-bold text-blue-700">SGPA: {sgpa}</p>
                    </div>
                    <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                      <thead><tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Subject</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">Internal</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">External</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">Total</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">Grade</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">Result</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-100">
                        {groupBySubject(semMarks).map((subj, i) => {
                          const total = subj.marks.reduce((a,m)=>a+m.marksObtained,0);
                          const max = subj.marks.reduce((a,m)=>a+m.maxMarks,0);
                          const grade = calcGrade(total, max);
                          const intMarks = subj.marks.filter(m=>['internal1','internal2'].includes(m.examType)).reduce((a,m)=>a+m.marksObtained,0);
                          const extMarks = subj.marks.find(m=>m.examType==='external')?.marksObtained || '—';
                          return (
                            <tr key={i}>
                              <td className="px-3 py-2 font-medium">{subj.subject?.name || '—'}</td>
                              <td className="px-3 py-2 text-center">{intMarks || '—'}</td>
                              <td className="px-3 py-2 text-center">{extMarks}</td>
                              <td className="px-3 py-2 text-center font-bold">{total}/{max}</td>
                              <td className="px-3 py-2 text-center"><Badge variant={GRADE_COLORS[grade] || 'default'} size="xs">{grade}</Badge></td>
                              <td className="px-3 py-2 text-center"><Badge variant={grade === 'F' ? 'danger' : 'success'} size="xs">{grade === 'F' ? 'FAIL' : 'PASS'}</Badge></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-center"><div className="w-32 h-8 border-b border-gray-400 mb-1"/><p className="text-xs text-gray-500">Exam Controller</p></div>
                  <div className="text-center border border-blue-200 rounded-lg px-6 py-3">
                    <p className="text-2xl font-extrabold text-blue-700">{cgpa}</p>
                    <p className="text-xs text-gray-500">Overall CGPA</p>
                  </div>
                  <div className="text-center"><div className="w-32 h-8 border-b border-gray-400 mb-1"/><p className="text-xs text-gray-500">Principal</p></div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="secondary" onClick={() => setShowMarksheet(false)}>Close</Button>
              <Button icon={Download}>Download PDF</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}