import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('erp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('erp_token');
      localStorage.removeItem('erp_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== AUTH =====
export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  changePassword: (data) => API.put('/auth/change-password', data),
  updateProfile: (data) => API.put('/auth/profile', data),
  register: (data) => API.post('/auth/register', data),
};

// ===== STUDENTS =====
export const studentsAPI = {
  getAll: (params) => API.get('/students', { params }),
  getOne: (id) => API.get(`/students/${id}`),
  create: (data) => API.post('/students', data),
  update: (id, data) => API.put(`/students/${id}`, data),
  delete: (id) => API.delete(`/students/${id}`),
  getStats: () => API.get('/students/stats'),
};

// ===== TEACHERS =====
export const teachersAPI = {
  getAll: (params) => API.get('/teachers', { params }),
  getOne: (id) => API.get(`/teachers/${id}`),
  create: (data) => API.post('/teachers', data),
  update: (id, data) => API.put(`/teachers/${id}`, data),
};

// ===== ATTENDANCE =====
export const attendanceAPI = {
  mark: (data) => API.post('/attendance/mark', data),
  getStudent: (id, params) => API.get(`/attendance/student/${id}`, { params }),
  getClass: (params) => API.get('/attendance/class', { params }),
  getReport: (params) => API.get('/attendance/report', { params }),
};

// ===== MARKS =====
export const marksAPI = {
  enter: (data) => API.post('/marks', data),
  bulk: (data) => API.post('/marks/bulk', data),
  getStudent: (id, params) => API.get(`/marks/student/${id}`, { params }),
};

// ===== FEES =====
export const feesAPI = {
  getStudent: (id, params) => API.get(`/fees/student/${id}`, { params }),
  collect: (data) => API.post('/fees/collect', data),
  generateChallan: (data) => API.post('/fees/generate-challan', data),
  getReport: (params) => API.get('/fees/report', { params }),
  getDefaulters: (params) => API.get('/fees/defaulters', { params }),
};

// ===== DEPARTMENTS =====
export const departmentsAPI = {
  getAll: () => API.get('/departments'),
  create: (data) => API.post('/departments', data),
  getSubjects: (params) => API.get('/departments/subjects', { params }),
  createSubject: (data) => API.post('/departments/subjects', data),
};

// ===== TIMETABLE =====
export const timetableAPI = {
  get: (params) => API.get('/timetable', { params }),
  create: (data) => API.post('/timetable', data),
  update: (id, data) => API.put(`/timetable/${id}`, data),
};

// ===== NOTICES =====
export const noticesAPI = {
  getAll: () => API.get('/notices'),
  create: (data) => API.post('/notices', data),
  delete: (id) => API.delete(`/notices/${id}`),
};

// ===== ASSIGNMENTS =====
export const assignmentsAPI = {
  getAll: (params) => API.get('/assignments', { params }),
  create: (data) => API.post('/assignments', data),
};

// ===== EXAMS =====
export const examsAPI = {
  getAll: (params) => API.get('/exams', { params }),
  create: (data) => API.post('/exams', data),
};

// ===== REPORTS =====
export const reportsAPI = {
  getDashboard: () => API.get('/reports/dashboard'),
};

// ===== LEAVES =====
export const leavesAPI = {
  getAll: (params) => API.get('/leaves', { params }),
  create: (data) => API.post('/leaves', data),
  approve: (id, data) => API.put(`/leaves/${id}/approve`, data),
};

// ===== PLACEMENTS =====
export const placementsAPI = {
  getAll: (params) => API.get('/placements', { params }),
  create: (data) => API.post('/placements', data),
};

// ===== USERS =====
export const usersAPI = {
  getAll: (params) => API.get('/users', { params }),
  toggleStatus: (id) => API.put(`/users/${id}/toggle-status`),
  resetPassword: (id, data) => API.put(`/users/${id}/reset-password`, data),
};

export default API;