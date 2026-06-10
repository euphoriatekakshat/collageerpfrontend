import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardList,
  Calendar, CreditCard, FileText, Bell, Settings, LogOut,
  ChevronLeft, Menu, Award, Briefcase, UserCheck, BarChart3,
  BookMarked, Building2, ChevronDown
} from 'lucide-react';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: '/',
    roles: null, // all
  },
  {
    label: 'Students',
    icon: GraduationCap,
    to: '/students',
    roles: ['super_admin', 'college_admin', 'hod', 'teacher', 'exam_controller', 'accounts_admin'],
  },
  {
    label: 'Teachers',
    icon: Users,
    to: '/teachers',
    roles: ['super_admin', 'college_admin', 'hod'],
  },
  {
    label: 'Attendance',
    icon: UserCheck,
    to: '/attendance',
    roles: null,
    children: [
      { label: 'View Attendance', to: '/attendance' },
      { label: 'Mark Attendance', to: '/attendance/mark' },
      { label: 'Reports', to: '/attendance/report' },
    ],
  },
  {
    label: 'Marks & Results',
    icon: ClipboardList,
    to: '/marks',
    roles: ['super_admin', 'college_admin', 'hod', 'teacher', 'exam_controller'],
    children: [
      { label: 'View Marks', to: '/marks' },
      { label: 'Enter Marks', to: '/marks/enter' },
    ],
  },
  {
    label: 'Timetable',
    icon: Calendar,
    to: '/timetable',
    roles: null,
  },
  {
    label: 'Exams',
    icon: BookMarked,
    to: '/exams',
    roles: ['super_admin', 'college_admin', 'hod', 'exam_controller'],
  },
  {
    label: 'Fee & Finance',
    icon: CreditCard,
    to: '/fees',
    roles: ['super_admin', 'college_admin', 'accounts_admin'],
    children: [
      { label: 'Fee Overview', to: '/fees' },
      { label: 'Collect Fee', to: '/fees/collect' },
      { label: 'Fee Report', to: '/fees/report' },
    ],
  },
  {
    label: 'Notices',
    icon: Bell,
    to: '/notices',
    roles: null,
  },
  {
    label: 'Leaves',
    icon: FileText,
    to: '/leaves',
    roles: null,
  },
  {
    label: 'Placements',
    icon: Briefcase,
    to: '/placements',
    roles: ['super_admin', 'college_admin', 'placement_officer', 'student'],
  },
  {
    label: 'Reports',
    icon: BarChart3,
    to: '/reports',
    roles: ['super_admin', 'college_admin', 'hod', 'exam_controller', 'accounts_admin'],
  },
  {
    label: 'Hall Ticket',
    icon: Bell,
    to: '/hallticket',
    roles: null,
  },
  {
    label: 'ResultMarksheet',
    icon: Bell,
    to: '/ResultMarksheet',
    roles: null,
  },
  {
    label: 'Library',
    icon: Bell,
    to: '/Library',
    roles: null,
  },
   {
    label: 'DigitalIDCard',
    icon: Bell,
    to: '/DigitalIDCard',
    roles: null,
  },
  {
    label: 'Grievances',
    icon: Bell,
    to: '/Grievances',
    roles: null,
  },
  {
    label: 'Settings',
    icon: Settings,
    to: '/settings',
    roles: null,
    children: [
      { label: 'User Management', to: '/settings/users' },
      { label: 'Departments', to: '/settings/departments' },
      { label: 'General', to: '/settings' },
    ],
  },
];

const ROLE_COLORS = {
  super_admin: 'bg-purple-100 text-purple-800',
  college_admin: 'bg-blue-100 text-blue-800',
  hod: 'bg-teal-100 text-teal-800',
  teacher: 'bg-orange-100 text-orange-800',
  exam_controller: 'bg-yellow-100 text-yellow-800',
  accounts_admin: 'bg-green-100 text-green-800',
  librarian: 'bg-pink-100 text-pink-800',
  hostel_warden: 'bg-indigo-100 text-indigo-800',
  placement_officer: 'bg-cyan-100 text-cyan-800',
  student: 'bg-gray-100 text-gray-800',
  parent: 'bg-rose-100 text-rose-800',
};

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  college_admin: 'College Admin',
  hod: 'HOD',
  teacher: 'Teacher',
  exam_controller: 'Exam Controller',
  accounts_admin: 'Accounts Admin',
  librarian: 'Librarian',
  hostel_warden: 'Hostel Warden',
  placement_officer: 'Placement Officer',
  student: 'Student',
  parent: 'Parent',
};

function NavItem({ item, collapsed, userRole }) {
  const [open, setOpen] = useState(false);

  if (item.roles && !item.roles.includes(userRole)) return null;

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <item.icon size={20} className="flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
              <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>
        {open && !collapsed && (
          <div className="ml-8 mt-1 space-y-1">
            {item.children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                end={child.to === '/'}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm ${isActive ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
      title={collapsed ? item.label : undefined}
    >
      <item.icon size={20} className="flex-shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-64'} flex flex-col bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-200">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">Skiller ERP</p>
              <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} item={item} collapsed={collapsed} userRole={user?.role} />
          ))}
        </nav>

        {/* User info */}
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLORS[user?.role] || 'bg-gray-100 text-gray-600'}`}>
                  {ROLE_LABELS[user?.role] || user?.role}
                </span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}