import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { attendanceAPI, departmentsAPI } from '../../api';
import { PageHeader, Card, Select, Button, Table, Badge, ProgressBar, PageLoader } from '../../components/ui';
import { useEffect } from 'react';

export default function AttendanceReport() {
  const [departments, setDepartments] = useState([]);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ department: '', semester: '', fromDate: '', toDate: '', academicYear: '2024-25' });

  useEffect(() => { departmentsAPI.getAll().then(({ data }) => setDepartments(data.data)).catch(() => {}); }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data } = await attendanceAPI.getReport(filters);
      setReport(data.data);
    } catch { setReport([]); }
    finally { setLoading(false); }
  };

  const columns = [
    { header: '#', render: (_, i) => <span className="text-gray-400 text-xs">{i + 1}</span> },
    { header: 'Student', render: r => <div><p className="font-semibold text-sm">{r.student?.name}</p><p className="text-xs text-gray-400 font-mono">{r.student?.rollNo}</p></div> },
    { header: 'Sem', render: r => <span className="text-sm">{r.student?.semester}</span> },
    { header: 'Total', render: r => <span className="font-semibold">{r.totalClasses}</span> },
    { header: 'Present', render: r => <span className="text-emerald-600 font-bold">{r.present}</span> },
    { header: 'Absent', render: r => <span className="text-red-500 font-bold">{r.absent}</span> },
    { header: 'Attendance', render: r => <div className="w-28"><div className="flex justify-between text-xs mb-1"><span className={`font-bold ${r.percentage >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>{r.percentage}%</span></div><ProgressBar value={r.percentage} color="auto" showLabel={false} /></div> },
    { header: 'Status', render: r => <Badge variant={r.percentage >= 85 ? 'success' : r.percentage >= 75 ? 'warning' : 'danger'}>{r.percentage >= 85 ? 'Safe' : r.percentage >= 75 ? 'Warning' : 'Critical'}</Badge> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Attendance Report" subtitle="Generate detailed attendance reports" breadcrumb="Home / Attendance / Report"
        actions={<Button variant="secondary" icon={Download}>Export Excel</Button>}
      />
      <div className="p-6 space-y-5">
        <Card>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <Select value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </Select>
            <Select value={filters.semester} onChange={e => setFilters(f => ({ ...f, semester: e.target.value }))}>
              <option value="">All Sems</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </Select>
            <input type="date" value={filters.fromDate} onChange={e => setFilters(f => ({ ...f, fromDate: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="From Date" />
            <input type="date" value={filters.toDate} onChange={e => setFilters(f => ({ ...f, toDate: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="To Date" />
            <Button onClick={fetchReport} loading={loading}>Generate Report</Button>
          </div>
          {loading ? <PageLoader /> : report.length > 0 ? (
            <>
              <div className="flex gap-4 mb-3 p-3 bg-gray-50 rounded-lg text-sm">
                <span>Total: <strong>{report.length}</strong></span>
                <span className="text-emerald-600">Safe (≥85%): <strong>{report.filter(r => r.percentage >= 85).length}</strong></span>
                <span className="text-amber-600">Warning: <strong>{report.filter(r => r.percentage >= 75 && r.percentage < 85).length}</strong></span>
                <span className="text-red-500">Critical (&lt;75%): <strong>{report.filter(r => r.percentage < 75).length}</strong></span>
              </div>
              <Table columns={columns} data={report} />
            </>
          ) : (
            <p className="text-center text-gray-400 py-10">Select filters and click Generate Report</p>
          )}
        </Card>
      </div>
    </div>
  );
}