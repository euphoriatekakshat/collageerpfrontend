import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Users, CreditCard, AlertTriangle,
  TrendingUp, Calendar, Bell, BookOpen, BarChart3, UserCheck,
  CheckCircle, Clock, XCircle
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { reportsAPI, studentsAPI, noticesAPI } from '../../api';
import { StatCard, Card, Badge, PageHeader, Avatar, PageLoader } from '../../components/ui';
import useAuthStore from '../../store/authStore';

const MONTHLY_DATA = [
  { month: 'Jan', students: 2100, fee: 180000 },
  { month: 'Feb', students: 2150, fee: 210000 },
  { month: 'Mar', students: 2200, fee: 195000 },
  { month: 'Apr', students: 2300, fee: 240000 },
  { month: 'May', students: 2350, fee: 220000 },
  { month: 'Jun', students: 2400, fee: 260000 },
];

const DEPT_DATA = [
  { name: 'CS', students: 620, color: '#3B82F6' },
  { name: 'ME', students: 480, color: '#10B981' },
  { name: 'EE', students: 520, color: '#8B5CF6' },
  { name: 'CE', students: 400, color: '#F59E0B' },
  { name: 'IT', students: 380, color: '#EF4444' },
];

const RECENT_ACTIVITIES = [
  { icon: GraduationCap, text: 'New student Aarav Sharma admitted — CS Sem 1', time: '5 min ago', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: CreditCard, text: 'Fee collected ₹45,000 from 12 students', time: '22 min ago', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: UserCheck, text: 'Attendance marked — CS Sem 4 Data Structures', time: '1h ago', color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: Bell, text: 'New notice posted: Exam schedule updated', time: '2h ago', color: 'text-orange-600', bg: 'bg-orange-50' },
  { icon: AlertTriangle, text: '8 students below 75% attendance — CS Sem 4', time: '3h ago', color: 'text-red-600', bg: 'bg-red-50' },
];

const QUICK_ACTIONS = [
  { label: 'Add Student', icon: GraduationCap, to: '/students/add', color: 'bg-blue-600' },
  { label: 'Add Teacher', icon: Users, to: '/teachers/add', color: 'bg-emerald-600' },
  { label: 'Mark Attendance', icon: UserCheck, to: '/attendance/mark', color: 'bg-purple-600' },
  { label: 'Collect Fee', icon: CreditCard, to: '/fees/collect', color: 'bg-orange-600' },
  { label: 'Enter Marks', icon: BookOpen, to: '/marks/enter', color: 'bg-teal-600' },
  { label: 'Post Notice', icon: Bell, to: '/notices', color: 'bg-pink-600' },
];

const PENDING_TASKS = [
  { title: 'Fee defaulters this month', count: 42, type: 'warning', icon: CreditCard },
  { title: 'Attendance < 75%', count: 18, type: 'danger', icon: AlertTriangle },
  { title: 'Pending leave requests', count: 7, type: 'info', icon: Clock },
  { title: 'Assignments not graded', count: 23, type: 'warning', icon: BookOpen },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await reportsAPI.getDashboard();
      setStats(data.data);
    } catch {
      // use fallback data if backend not connected
      setStats({
        totalStudents: 2400,
        totalTeachers: 124,
        feeCollected: 1850000,
        feePending: 320000,
      });
    } finally {
      setLoading(false);
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Here's what's happening at your college today"
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        }
      />

      <div className="p-6 space-y-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={loading ? '...' : stats?.totalStudents?.toLocaleString()} icon={GraduationCap} color="blue" subtitle="Active enrolled" trend={{ up: true, value: '4.2% this month' }} loading={loading} />
          <StatCard title="Total Teachers" value={loading ? '...' : stats?.totalTeachers?.toLocaleString()} icon={Users} color="green" subtitle="Active faculty" loading={loading} />
          <StatCard title="Fee Collected" value={loading ? '...' : `₹${((stats?.feeCollected || 0) / 100000).toFixed(1)}L`} icon={CreditCard} color="purple" subtitle="This academic year" trend={{ up: true, value: '12% vs last year' }} loading={loading} />
          <StatCard title="Fee Pending" value={loading ? '...' : `₹${((stats?.feePending || 0) / 100000).toFixed(1)}L`} icon={AlertTriangle} color="red" subtitle="From defaulters" loading={loading} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Enrollment trend */}
          <Card className="xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Enrollment & Fee Trend</h3>
                <p className="text-xs text-gray-400">Last 6 months overview</p>
              </div>
              <Badge variant="primary">2024–25</Badge>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MONTHLY_DATA}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFee" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="students" stroke="#3B82F6" fill="url(#colorStudents)" strokeWidth={2} name="Students" />
                <Area type="monotone" dataKey="fee" stroke="#10B981" fill="url(#colorFee)" strokeWidth={2} name="Fee (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Department distribution */}
          <Card>
            <h3 className="text-sm font-bold text-gray-900 mb-1">Students by Department</h3>
            <p className="text-xs text-gray-400 mb-4">Current academic year</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={DEPT_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="students">
                  {DEPT_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {DEPT_DATA.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-gray-600">{d.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-800">{d.students}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions + Pending Tasks + Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Quick Actions */}
          <Card>
            <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.label}
                  onClick={() => navigate(a.to)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <div className={`w-9 h-9 ${a.color} rounded-lg flex items-center justify-center`}>
                    <a.icon size={18} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{a.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Pending Tasks */}
          <Card>
            <h3 className="text-sm font-bold text-gray-900 mb-4">Pending Attention</h3>
            <div className="space-y-3">
              {PENDING_TASKS.map((t, i) => {
                const colors = {
                  warning: 'bg-amber-50 text-amber-700 border-amber-200',
                  danger: 'bg-red-50 text-red-700 border-red-200',
                  info: 'bg-blue-50 text-blue-700 border-blue-200',
                };
                return (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${colors[t.type]}`}>
                    <div className="flex items-center gap-2">
                      <t.icon size={15} />
                      <span className="text-xs font-medium">{t.title}</span>
                    </div>
                    <span className="text-sm font-extrabold">{t.count}</span>
                  </div>
                );
              })}
            </div>

            {/* Attendance summary bar */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600">Today's Attendance</span>
                <span className="text-xs font-bold text-emerald-600">82%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">1,968 / 2,400 students present</p>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
              <button className="text-xs text-blue-600 hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {RECENT_ACTIVITIES.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 ${a.bg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <a.icon size={15} className={a.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-snug">{a.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Attendance bar chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Department-wise Attendance This Week</h3>
              <p className="text-xs text-gray-400">Average attendance percentage</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { dept: 'CS', pct: 85 }, { dept: 'ME', pct: 78 }, { dept: 'EE', pct: 82 },
              { dept: 'CE', pct: 74 }, { dept: 'IT', pct: 88 }, { dept: 'MBA', pct: 91 },
            ]} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="dept" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v}%`, 'Attendance']} />
              <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                {[85, 78, 82, 74, 88, 91].map((v, i) => (
                  <Cell key={i} fill={v >= 85 ? '#10B981' : v >= 75 ? '#3B82F6' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

      </div>
    </div>
  );
}