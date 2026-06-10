import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil, ArrowLeft, Phone, Mail, MapPin, Calendar, BookOpen, CreditCard } from 'lucide-react';
import { studentsAPI, attendanceAPI, marksAPI, feesAPI } from '../../api';
import { PageHeader, Card, Badge, Button, Avatar, ProgressBar, PageLoader } from '../../components/ui';
import toast from 'react-hot-toast';

const TAB_LIST = ['Overview', 'Attendance', 'Marks', 'Fee', 'Profile'];

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [marks, setMarks] = useState([]);
  const [fees, setFees] = useState({ data: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    Promise.all([
      studentsAPI.getOne(id),
      attendanceAPI.getStudent(id),
      marksAPI.getStudent(id),
      feesAPI.getStudent(id),
    ]).then(([s, a, m, f]) => {
      setStudent(s.data.data);
      setAttendance(a.data.data);
      setMarks(m.data.data);
      setFees(f.data);
    }).catch(() => toast.error('Failed to load student data'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (!student) return <div className="p-6 text-gray-500">Student not found</div>;

  const overallAtt = attendance?.overall ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={student.name}
        subtitle={`${student.rollNo} · ${student.department?.name}`}
        breadcrumb="Home / Students / Detail"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/students')}>Back</Button>
            <Button icon={Pencil} onClick={() => navigate(`/students/${id}/edit`)}>Edit</Button>
          </div>
        }
      />

      <div className="p-6 space-y-5">
        {/* Profile Hero */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <Avatar name={student.name} size="lg" color="blue" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
                <Badge variant={overallAtt >= 85 ? 'success' : overallAtt >= 75 ? 'warning' : 'danger'}>
                  {overallAtt}% Attendance
                </Badge>
                <Badge variant="primary">{student.course || 'B.Tech'} · Sem {student.semester}</Badge>
                <Badge variant={student.status === 'active' ? 'success' : 'danger'}>{student.status}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {[
                  { icon: Mail, val: student.email },
                  { icon: Phone, val: student.phone || '—' },
                  { icon: MapPin, val: student.address || '—' },
                  { icon: Calendar, val: student.batch || '—' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <item.icon size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3 flex-shrink-0">
              {[
                { label: 'Semester', val: student.semester },
                { label: 'Section', val: student.section || '—' },
                { label: 'Category', val: student.category?.toUpperCase() || '—' },
                { label: 'Blood', val: student.bloodGroup || '—' },
              ].map((s, i) => (
                <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                  <p className="text-sm font-bold text-gray-900">{s.val}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white rounded-t-xl">
          <div className="flex px-4">
            {TAB_LIST.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Attendance summary */}
            <Card>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Attendance Overview</h3>
              <div className="text-center mb-4">
                <p className={`text-5xl font-extrabold ${overallAtt >= 85 ? 'text-emerald-600' : overallAtt >= 75 ? 'text-amber-500' : 'text-red-500'}`}>{overallAtt}%</p>
                <p className="text-sm text-gray-400 mt-1">Overall</p>
              </div>
              <div className="space-y-3">
                {attendance?.subjects?.slice(0, 4).map((s, i) => {
                  const pct = s.percentage;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 truncate">{s.subject?.name}</span>
                        <span className={`font-bold ${pct >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>{pct}%</span>
                      </div>
                      <ProgressBar value={pct} color="auto" showLabel={false} />
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Marks summary */}
            <Card>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Latest Marks</h3>
              {marks.length === 0
                ? <p className="text-sm text-gray-400 text-center py-6">No marks recorded</p>
                : <div className="space-y-2">
                  {marks.slice(0, 5).map((m, i) => {
                    const pct = Math.round((m.marksObtained / m.maxMarks) * 100);
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${pct >= 80 ? 'bg-emerald-100 text-emerald-700' : pct >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                          {pct}%
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">{m.subject?.name}</p>
                          <p className="text-xs text-gray-400">{m.examType} · {m.marksObtained}/{m.maxMarks}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              }
            </Card>

            {/* Fee summary */}
            <Card>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Fee Status</h3>
              <div className="space-y-3">
                {[
                  { label: 'Total Fee', val: `₹${(fees.summary?.total || 0).toLocaleString()}`, color: 'text-gray-900' },
                  { label: 'Paid', val: `₹${(fees.summary?.paid || 0).toLocaleString()}`, color: 'text-emerald-600' },
                  { label: 'Due', val: `₹${(fees.summary?.due || 0).toLocaleString()}`, color: 'text-red-500' },
                ].map((f, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-600">{f.label}</span>
                    <span className={`text-sm font-bold ${f.color}`}>{f.val}</span>
                  </div>
                ))}
              </div>
              {(fees.summary?.due || 0) > 0 && (
                <div className="mt-3 p-2 bg-red-50 rounded-lg text-xs text-red-700 font-medium text-center">
                  ⚠ Fee due — please contact accounts office
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'Attendance' && (
          <Card>
            <h3 className="text-sm font-bold text-gray-900 mb-4">Subject-wise Attendance</h3>
            <div className="space-y-4">
              {attendance?.subjects?.map((s, i) => {
                const pct = s.percentage;
                return (
                  <div key={i} className={`p-4 rounded-xl border ${pct < 75 ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900">{s.subject?.name} <span className="text-gray-400 font-normal text-xs">({s.subject?.code})</span></span>
                      <Badge variant={pct >= 85 ? 'success' : pct >= 75 ? 'warning' : 'danger'}>{pct}%</Badge>
                    </div>
                    <ProgressBar value={pct} color="auto" showLabel={false} />
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>✓ Present: <strong className="text-emerald-600">{s.present}</strong></span>
                      <span>✗ Absent: <strong className="text-red-500">{s.absent}</strong></span>
                      <span>⏱ Late: <strong className="text-amber-500">{s.late}</strong></span>
                      <span>Total: <strong>{s.total}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {activeTab === 'Marks' && (
          <Card>
            <h3 className="text-sm font-bold text-gray-900 mb-4">All Marks</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-gray-50">
                  {['Subject', 'Exam Type', 'Marks', 'Max', 'Percentage', 'Grade'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {marks.map((m, i) => {
                    const pct = Math.round((m.marksObtained / m.maxMarks) * 100);
                    const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'F';
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{m.subject?.name}</td>
                        <td className="px-4 py-3 capitalize">{m.examType}</td>
                        <td className="px-4 py-3 font-bold text-blue-700">{m.marksObtained}</td>
                        <td className="px-4 py-3 text-gray-500">{m.maxMarks}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-16">
                              <div className={`h-full rounded-full ${pct >= 75 ? 'bg-emerald-500' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs font-medium">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={grade === 'F' ? 'danger' : grade.includes('+') ? 'success' : 'primary'}>{grade}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'Fee' && (
          <Card>
            <h3 className="text-sm font-bold text-gray-900 mb-4">Fee Details</h3>
            <div className="space-y-3">
              {fees.data?.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold capitalize">{f.feeType} Fee</p>
                    <p className="text-xs text-gray-400">Due: {f.dueDate ? new Date(f.dueDate).toLocaleDateString('en-IN') : '—'} {f.receiptNo ? `· Receipt: ${f.receiptNo}` : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">₹{f.amount?.toLocaleString()}</p>
                    <Badge variant={f.status === 'paid' ? 'success' : f.status === 'pending' ? 'warning' : 'danger'}>
                      {f.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'Profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card>
              <h3 className="text-sm font-bold text-gray-900 mb-4">Personal Details</h3>
              <div className="space-y-3">
                {[
                  ['Full Name', student.name],
                  ['Roll Number', student.rollNo],
                  ['Email', student.email],
                  ['Phone', student.phone || '—'],
                  ['Gender', student.gender || '—'],
                  ['Date of Birth', student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-IN') : '—'],
                  ['Blood Group', student.bloodGroup || '—'],
                  ['Category', student.category?.toUpperCase() || '—'],
                  ['Aadhar No', student.aadharNo || '—'],
                  ['Address', student.address || '—'],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-medium text-gray-900">{val}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <h3 className="text-sm font-bold text-gray-900 mb-4">Parent / Guardian</h3>
              <div className="space-y-3">
                {[
                  ['Parent Name', student.parentName || '—'],
                  ['Parent Phone', student.parentPhone || '—'],
                  ['Parent Email', student.parentEmail || '—'],
                  ['Occupation', student.parentOccupation || '—'],
                  ['Guardian Name', student.guardianName || '—'],
                  ['Guardian Phone', student.guardianPhone || '—'],
                  ['Hostel', student.hostelResident ? `Yes · ${student.hostelRoom || ''}` : 'No'],
                  ['Transport Route', student.transportRoute || '—'],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-medium text-gray-900">{val}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}