import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Layout
import AdminLayout from './components/layout/AdminLayout';

// Auth
import Login from './pages/auth/Login';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Students
import Students from './pages/students/Students';
import StudentForm from './pages/students/StudentForm';
import StudentDetail from './pages/students/StudentDetail';

// Teachers
import Teachers from './pages/teachers/Teachers';
import TeacherForm from './pages/teachers/TeacherForm';

// Attendance
import Attendance from './pages/attendance/Attendance';
import MarkAttendance from './pages/attendance/MarkAttendance';
import AttendanceReport from './pages/attendance/AttendanceReport';

// Marks
import Marks from './pages/marks/Marks';
import EnterMarks from './pages/marks/EnterMarks';

// Fees
import Fees from './pages/fees/Fees';
import CollectFee from './pages/fees/CollectFee';
import FeeReport from './pages/fees/FeeReport';

// Timetable
import Timetable from './pages/timetable/Timetable';

// Exams
import Exams from './pages/exams/Exams';

// Notices
import Notices from './pages/notices/Notices';

// Reports
import Reports from './pages/reports/Reports';

// Settings / Users
import Settings from './pages/settings/Settings';
import UserManagement from './pages/settings/UserManagement';

// Placements
import Placements from './pages/placements/Placements';

// Leaves
import Leaves from './pages/leaves/Leaves';

// Departments
import Departments from './pages/settings/Departments';
import Register from './pages/auth/Register';
import HallTicket from './pages/hallticket/Hallticket';
import ResultMarksheet from './pages/ResultMarksheet/Resultmarksheet';
import Library from './pages/Library/Library';
import DigitalIDCard from './pages/Digitalidcard/Digitalidcard';
import Grievances from './pages/Grievances/Grievances';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, hasRole } = useAuthStore();
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (roles && !hasRole(...roles)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }
  return children;
};

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login" element={isAuthenticated() ? <Navigate to="/" /> : <Login />} />

        <Route path="/register" element={ <Register />} />

        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />

          {/* Students */}
          <Route path="students" element={<Students />} />
          <Route path="students/add" element={
            <ProtectedRoute roles={['super_admin', 'college_admin']}>
              <StudentForm />
            </ProtectedRoute>
          } />
          <Route path="students/:id" element={<StudentDetail />} />
          <Route path="students/:id/edit" element={
            <ProtectedRoute roles={['super_admin', 'college_admin']}>
              <StudentForm />
            </ProtectedRoute>
          } />

          {/* Teachers */}
          <Route path="teachers" element={<Teachers />} />
          <Route path="teachers/add" element={
            <ProtectedRoute roles={['super_admin', 'college_admin']}>
              <TeacherForm />
            </ProtectedRoute>
          } />
          <Route path="teachers/:id/edit" element={<TeacherForm />} />

          {/* Attendance */}
          <Route path="attendance" element={<Attendance />} />
          <Route path="attendance/mark" element={<MarkAttendance />} />
          <Route path="attendance/report" element={<AttendanceReport />} />

          {/* Marks */}
          <Route path="marks" element={<Marks />} />
          <Route path="marks/enter" element={<EnterMarks />} />

          {/* Fees */}
          <Route path="fees" element={<Fees />} />
          <Route path="fees/collect" element={
            <ProtectedRoute roles={['super_admin', 'college_admin', 'accounts_admin']}>
              <CollectFee />
            </ProtectedRoute>
          } />
          <Route path="fees/report" element={<FeeReport />} />

          {/* Other modules */}
          <Route path="timetable" element={<Timetable />} />
          <Route path="exams" element={<Exams />} />
          <Route path="notices" element={<Notices />} />
          <Route path="placements" element={<Placements />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="reports" element={<Reports />} />

          {/* Settings */}
          <Route path="settings" element={<Settings />} />
          <Route path="settings/users" element={
            <ProtectedRoute roles={['super_admin', 'college_admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="settings/departments" element={<Departments />} />


          <Route path="hallticket" element={<HallTicket />} />
          <Route path="ResultMarksheet" element={<ResultMarksheet />} />
          <Route path="Library" element={<Library />} />
           <Route path="DigitalIDCard" element={<DigitalIDCard />} />
            <Route path="Grievances" element={<Grievances />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}