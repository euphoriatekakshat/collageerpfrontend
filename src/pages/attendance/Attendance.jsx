import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, UserCheck, AlertTriangle, TrendingDown } from 'lucide-react';
import { attendanceAPI, departmentsAPI, studentsAPI } from '../../api';
import {
  PageHeader, Card, Button, Select, StatCard,
  Badge, SearchBar, ProgressBar, PageLoader, Table
} from '../../components/ui';

export default function Attendance() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ department: '', semester: '', section: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    departmentsAPI.getAll().then(({ data }) => setDepartments(data.data)).catch(() => {});
  }, []);

  const fetchReport = useCallback(async () => {
    if (!filters.department) return;
    setLoading(true);
    try {
      const { data } = await attendanceAPI.getReport(filters);
      setReport(data.data);
    } catch { setReport([]); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const filtered = report.filter(r =>
    !search || r.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.student?.rollNo?.toLowerCase().includes(search.toLowerCase())
  );

  const belowThreshold = report.filter(r => r.percentage < 75).length;
  const safe = report.filter(r => r.percentage >= 85).length;
  const avg = report.length ? Math.round(report.reduce((a, r) => a + r.percentage, 0) / report.length) : 0;

  const columns = [
    {
      header: 'Student',
      render: r => (
        <div>
          <p className="font-semibold text-sm text-gray-900">{r.student?.name}</p>
          <p className="text-xs text-gray-400 font-mono">{r.student?.rollNo}</p>
        </div>
      )
    },
    { header: 'Total Classes', render: r => <span className="font-semibold">{r.totalClasses}</span> },
    { header: 'Present', render: r => <span className="text-emerald-600 font-semibold">{r.present}</span> },
    { header: 'Absent', render: r => <span className="text-red-500 font-semibold">{r.absent}</span> },
    {
      header: 'Attendance %',
      render: r => (
        <div className="w-32">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-bold ${r.percentage >= 85 ? 'text-emerald-600' : r.percentage >= 75 ? 'text-amber-500' : 'text-red-500'}`}>
              {r.percentage}%
            </span>
          </div>
          <ProgressBar value={r.percentage} color="auto" showLabel={false} />
        </div>
      )
    },
    {
      header: 'Status',
      render: r => (
        <Badge variant={r.percentage >= 85 ? 'success' : r.percentage >= 75 ? 'warning' : 'danger'}>
          {r.percentage >= 85 ? '✓ Safe' : r.percentage >= 75 ? '⚠ Watch' : '✗ Critical'}
        </Badge>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Attendance Overview" subtitle="Monitor and track student attendance"
        breadcrumb="Home / Attendance"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/attendance/report')}>Full Report</Button>
            <Button icon={UserCheck} onClick={() => navigate('/attendance/mark')}>Mark Attendance</Button>
          </div>
        }
      />

      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Average Attendance" value={`${avg}%`} icon={Calendar} color="blue" />
          <StatCard title="Safe (≥85%)" value={safe} icon={UserCheck} color="green" />
          <StatCard title="Warning (75-84%)" value={report.filter(r => r.percentage >= 75 && r.percentage < 85).length} icon={AlertTriangle} color="orange" />
          <StatCard title="Critical (<75%)" value={belowThreshold} icon={TrendingDown} color="red" />
        </div>

        {/* Filters */}
        <Card padding={false}>
          <div className="p-4 flex flex-wrap gap-3 items-end border-b border-gray-100">
            <Select value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))} className="w-48">
              <option value="">Select Department</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </Select>
            <Select value={filters.semester} onChange={e => setFilters(f => ({ ...f, semester: e.target.value }))} className="w-32">
              <option value="">All Sems</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </Select>
            <Select value={filters.section} onChange={e => setFilters(f => ({ ...f, section: e.target.value }))} className="w-28">
              <option value="">All Sec</option>
              {['A','B','C','D'].map(s => <option key={s} value={s}>Section {s}</option>)}
            </Select>
            <SearchBar value={search} onChange={setSearch} placeholder="Search student..." className="flex-1 min-w-[180px]" />
          </div>

          {!filters.department ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Calendar size={40} className="mb-3 text-gray-300" strokeWidth={1} />
              <p className="font-medium">Select a department to view attendance</p>
            </div>
          ) : loading ? <PageLoader /> : (
            <>
              {belowThreshold > 0 && (
                <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500" />
                  <p className="text-sm text-red-700 font-medium">
                    {belowThreshold} student{belowThreshold > 1 ? 's' : ''} below 75% attendance — may be detained
                  </p>
                </div>
              )}
              <Table columns={columns} data={filtered} emptyText="No attendance data found" />
            </>
          )}
        </Card>
      </div>
    </div>
  );
}