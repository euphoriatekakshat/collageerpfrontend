// Reports.jsx
import React, { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, Users, CreditCard, UserCheck } from 'lucide-react';
import { reportsAPI, studentsAPI, feesAPI, attendanceAPI, departmentsAPI } from '../../api';
import { PageHeader, Card, StatCard, Select, Button, PageLoader } from '../../components/ui';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';

const COLORS = ['#3B82F6','#10B981','#8B5CF6','#F59E0B','#EF4444','#14B8A6','#F97316','#EC4899'];

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    Promise.all([reportsAPI.getDashboard(), departmentsAPI.getAll()])
      .then(([r, d]) => { setStats(r.data.data); setDepartments(d.data.data); })
      .catch(() => setStats({ totalStudents: 2400, totalTeachers: 124, feeCollected: 1850000, feePending: 320000 }))
      .finally(() => setLoading(false));
  }, []);

  const DEPT_DATA = departments.slice(0,6).map((d, i) => ({
    name: d.code || d.name.slice(0,4).toUpperCase(),
    students: Math.floor(200 + Math.random() * 400),
    color: COLORS[i],
  }));

  const FEE_MONTHS = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar']
    .map((m, i) => ({ month: m, collected: Math.floor(100000 + Math.random() * 200000), pending: Math.floor(10000 + Math.random() * 80000) }));

  const ATT_DEPT = departments.slice(0,6).map(d => ({
    dept: d.code || d.name.slice(0,4).toUpperCase(),
    pct: Math.floor(72 + Math.random() * 20),
  }));

  const SECTIONS = [
    { key: 'overview', label: 'Overview' },
    { key: 'students', label: 'Students' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'fees', label: 'Fee' },
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Reports & Analytics" subtitle="Comprehensive college data insights" breadcrumb="Home / Reports"
        actions={<Button variant="secondary" icon={Download}>Export PDF</Button>}
      />
      <div className="p-6 space-y-5">
        {/* Section tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SECTIONS.map(s => (
            <button key={s.key} onClick={() => setActiveSection(s.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${activeSection === s.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeSection === 'overview' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Students" value={stats?.totalStudents?.toLocaleString()} icon={Users} color="blue" />
              <StatCard title="Total Teachers" value={stats?.totalTeachers?.toLocaleString()} icon={UserCheck} color="green" />
              <StatCard title="Fee Collected" value={`₹${((stats?.feeCollected||0)/100000).toFixed(1)}L`} icon={CreditCard} color="purple" />
              <StatCard title="Fee Pending" value={`₹${((stats?.feePending||0)/100000).toFixed(1)}L`} icon={TrendingUp} color="red" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card>
                <h3 className="text-sm font-bold text-gray-900 mb-4">Students per Department</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={DEPT_DATA} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="students" radius={[6,6,0,0]}>
                      {DEPT_DATA.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <h3 className="text-sm font-bold text-gray-900 mb-4">Department Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={DEPT_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="students">
                      {DEPT_DATA.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </>
        )}

        {/* Attendance */}
        {activeSection === 'attendance' && (
          <div className="space-y-5">
            <Card>
              <h3 className="text-sm font-bold text-gray-900 mb-4">Department-wise Attendance %</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={ATT_DEPT} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="dept" tick={{ fontSize: 12 }} />
                  <YAxis domain={[60,100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={v => [`${v}%`, 'Attendance']} />
                  <Bar dataKey="pct" radius={[6,6,0,0]} label={{ position: 'top', fontSize: 11, formatter: v => `${v}%` }}>
                    {ATT_DEPT.map((d, i) => <Cell key={i} fill={d.pct >= 85 ? '#10B981' : d.pct >= 75 ? '#3B82F6' : '#EF4444'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[{label:'≥85% (Safe)', val: ATT_DEPT.filter(d=>d.pct>=85).length, color:'text-emerald-600 bg-emerald-50'},
                {label:'75-84% (Warning)', val: ATT_DEPT.filter(d=>d.pct>=75&&d.pct<85).length, color:'text-blue-700 bg-blue-50'},
                {label:'<75% (Critical)', val: ATT_DEPT.filter(d=>d.pct<75).length, color:'text-red-600 bg-red-50'}].map((s,i)=>(
                <div key={i} className={`rounded-xl p-5 text-center ${s.color}`}>
                  <p className="text-4xl font-extrabold">{s.val}</p>
                  <p className="text-sm font-medium mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fee */}
        {activeSection === 'fees' && (
          <Card>
            <h3 className="text-sm font-bold text-gray-900 mb-4">Monthly Fee Collection (2024-25)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={FEE_MONTHS}>
                <defs>
                  <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [`₹${v.toLocaleString()}`, '']} />
                <Legend />
                <Area type="monotone" dataKey="collected" stroke="#10B981" fill="url(#gc)" strokeWidth={2} name="Collected" />
                <Area type="monotone" dataKey="pending" stroke="#EF4444" fill="url(#gp)" strokeWidth={2} name="Pending" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Students */}
        {activeSection === 'students' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <h3 className="text-sm font-bold text-gray-900 mb-4">Enrollment by Semester</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={[1,2,3,4,5,6,7,8].map(s=>({ sem:`Sem ${s}`, count: Math.floor(250+Math.random()*150) }))} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="sem" tick={{fontSize:10}} />
                  <YAxis tick={{fontSize:11}} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <h3 className="text-sm font-bold text-gray-900 mb-4">Gender Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={[{name:'Male',value:1440},{name:'Female',value:880},{name:'Other',value:80}]}
                    cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                    <Cell fill="#3B82F6" /><Cell fill="#EC4899" /><Cell fill="#8B5CF6" />
                  </Pie>
                  <Tooltip /><Legend iconType="circle" iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}