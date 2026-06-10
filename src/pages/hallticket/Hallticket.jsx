import React, { useState, useEffect } from 'react';
import { Download, Search, Printer, QrCode } from 'lucide-react';
import { studentsAPI, examsAPI, departmentsAPI } from '../../api';
import { PageHeader, Card, Select, Button, SearchBar, Table, Badge, Modal, Avatar } from '../../components/ui';
import toast from 'react-hot-toast';

export default function HallTicket() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [exams, setExams] = useState([]);
  const [filters, setFilters] = useState({ department: '', semester: '', exam: '' });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewStudent, setPreviewStudent] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);

  useEffect(() => {
    departmentsAPI.getAll().then(({ data }) => setDepartments(data.data)).catch(() => {});
    examsAPI.getAll().then(({ data }) => setExams(data.data)).catch(() => {});
  }, []);

  const fetchStudents = async () => {
    if (!filters.department || !filters.semester) return toast.error('Select department and semester');
    setLoading(true);
    try {
      const { data } = await studentsAPI.getAll({ department: filters.department, semester: filters.semester, limit: 100 });
      setStudents(data.data);
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  };

  const filtered = students.filter(s =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.rollNo?.toLowerCase().includes(search.toLowerCase())
  );

  const examObj = exams.find(e => e._id === filters.exam);

  const columns = [
    { header: 'Student', render: r => <div className="flex items-center gap-3"><Avatar name={r.name} size="sm" color="blue" /><div><p className="font-semibold text-sm">{r.name}</p><p className="font-mono text-xs text-gray-400">{r.rollNo}</p></div></div> },
    { header: 'Course', render: r => <span className="text-sm">{r.course || 'B.Tech'} · Sem {r.semester}</span> },
    { header: 'Section', render: r => <Badge variant="default">{r.section || '—'}</Badge> },
    { header: 'Status', render: r => <Badge variant="success">Eligible</Badge> },
    { header: 'Action', render: r => (
      <Button size="sm" variant="secondary" onClick={() => setPreviewStudent(r)} icon={QrCode}>
        Preview
      </Button>
    )},
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Hall Ticket Generator" subtitle="Generate exam admit cards for students" breadcrumb="Home / Exams / Hall Ticket"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Printer}>Print All</Button>
            <Button icon={Download}>Download All PDF</Button>
          </div>
        }
      />
      <div className="p-6 space-y-5">
        <Card>
          <h3 className="text-sm font-bold text-gray-700 mb-4">Select Exam & Class</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <Select value={filters.exam} onChange={e => setFilters(f => ({ ...f, exam: e.target.value }))}>
              <option value="">Select Exam</option>
              {exams.map(ex => <option key={ex._id} value={ex._id}>{ex.name}</option>)}
            </Select>
            <Select value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}>
              <option value="">Department *</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </Select>
            <Select value={filters.semester} onChange={e => setFilters(f => ({ ...f, semester: e.target.value }))}>
              <option value="">Semester *</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </Select>
            <Button onClick={fetchStudents} loading={loading}>Load Students</Button>
          </div>
          {students.length > 0 && (
            <SearchBar value={search} onChange={setSearch} placeholder="Search student..." className="mb-3" />
          )}
          <Table columns={columns} data={filtered} loading={loading} emptyText="Select filters and click Load Students" />
        </Card>
      </div>

      {/* Hall Ticket Preview Modal */}
      <Modal open={!!previewStudent} onClose={() => setPreviewStudent(null)} title="Hall Ticket Preview" size="lg">
        {previewStudent && (
          <div className="p-6">
            {/* Printable Hall Ticket */}
            <div className="border-2 border-gray-800 rounded-xl overflow-hidden" id="hall-ticket">
              {/* Header */}
              <div className="bg-blue-700 text-white text-center py-4 px-6">
                <p className="text-lg font-extrabold tracking-wide">SKILLER COLLEGE OF ENGINEERING & TECHNOLOGY</p>
                <p className="text-sm opacity-80 mt-0.5">Affiliated to State Technical University · NAAC Accredited</p>
                <div className="mt-2 bg-white/20 rounded-lg py-1.5 px-4 inline-block">
                  <p className="text-sm font-bold uppercase tracking-widest">
                    {examObj?.name || 'Examination Hall Ticket'} — {examObj?.academicYear || '2024-25'}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="bg-white p-6">
                <div className="flex gap-6">
                  {/* Left — student info */}
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      {[
                        ['Student Name', previewStudent.name],
                        ['Roll Number', previewStudent.rollNo],
                        ['Enrollment No', previewStudent.enrollmentNo || '—'],
                        ['Department', departments.find(d => d._id === previewStudent.department?._id || previewStudent.department)?.name || '—'],
                        ['Course', previewStudent.course || 'B.Tech'],
                        ['Semester', `${previewStudent.semester}th`],
                        ['Section', previewStudent.section || '—'],
                        ['Academic Year', '2024-25'],
                        ['Category', previewStudent.category?.toUpperCase() || 'GENERAL'],
                        ['Gender', previewStudent.gender?.toUpperCase() || '—'],
                      ].map(([l, v]) => (
                        <div key={l}>
                          <p className="text-xs text-gray-400 font-medium">{l}</p>
                          <p className="font-semibold text-gray-900 text-sm">{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right — photo + QR */}
                  <div className="flex flex-col items-center gap-3">
                    {/* Photo placeholder */}
                    <div className="w-24 h-28 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      <div className="w-20 h-24 bg-blue-600 rounded-md flex items-center justify-center text-white text-2xl font-extrabold">
                        {previewStudent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    {/* QR Code (simulated) */}
                    <div className="w-24 h-24 border border-gray-300 rounded-lg p-1 bg-white">
                      <div className="w-full h-full grid grid-cols-7 gap-px">
                        {Array.from({ length: 49 }, (_, i) => (
                          <div key={i} className={`rounded-sm ${Math.random() > 0.45 ? 'bg-gray-900' : 'bg-white'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 text-center">Scan to verify</p>
                  </div>
                </div>

                {/* Exam Schedule Table */}
                <div className="mt-5 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Examination Schedule</p>
                  </div>
                  <table className="w-full text-sm">
                    <thead><tr className="bg-blue-50">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Subject</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Time</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Room</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Max Marks</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        ['Data Structures', 'Jun 10, 2025', '10:00 AM', 'EH-1', 70],
                        ['DBMS', 'Jun 12, 2025', '10:00 AM', 'EH-2', 70],
                        ['Computer Networks', 'Jun 14, 2025', '02:00 PM', 'EH-1', 70],
                        ['OS Concepts', 'Jun 16, 2025', '10:00 AM', 'EH-3', 70],
                        ['Java Programming', 'Jun 18, 2025', '02:00 PM', 'EH-2', 70],
                      ].map(([sub, date, time, room, max]) => (
                        <tr key={sub}><td className="px-3 py-2">{sub}</td><td className="px-3 py-2">{date}</td><td className="px-3 py-2">{time}</td><td className="px-3 py-2">{room}</td><td className="px-3 py-2 font-semibold">{max}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Instructions */}
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  <p className="font-bold mb-1">Instructions:</p>
                  <p>1. Bring this hall ticket to the examination hall. 2. Reach 30 mins before exam. 3. Bring valid college ID. 4. No mobile phones or electronic devices allowed. 5. This hall ticket is subject to verification.</p>
                </div>

                {/* Signatures */}
                <div className="flex justify-between mt-5 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  <div className="text-center"><div className="w-32 h-8 border-b border-gray-400 mb-1" /><p>Student Signature</p></div>
                  <div className="text-center"><div className="w-32 h-8 border-b border-gray-400 mb-1" /><p>Exam Controller</p></div>
                  <div className="text-center"><div className="w-32 h-8 border-b border-gray-400 mb-1" /><p>Principal</p></div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="secondary" onClick={() => setPreviewStudent(null)}>Close</Button>
              <Button icon={Printer} onClick={() => window.print()}>Print</Button>
              <Button icon={Download}>Download PDF</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}