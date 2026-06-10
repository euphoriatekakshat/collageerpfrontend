import { create } from 'zustand';
import { authAPI } from '../api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('erp_user') || 'null'),
  token: localStorage.getItem('erp_token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('erp_token', data.token);
      localStorage.setItem('erp_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    set({ user: null, token: null });
  },

  isAuthenticated: () => !!get().token && !!get().user,

  hasRole: (...roles) => roles.includes(get().user?.role),

  // Role helpers
  isSuperAdmin: () => get().user?.role === 'super_admin',
  isAdmin: () => ['super_admin', 'college_admin'].includes(get().user?.role),
  isHOD: () => ['super_admin', 'college_admin', 'hod'].includes(get().user?.role),
  isTeacher: () => get().user?.role === 'teacher',
  isAccountsAdmin: () => ['super_admin', 'college_admin', 'accounts_admin'].includes(get().user?.role),
  isExamController: () => ['super_admin', 'college_admin', 'exam_controller'].includes(get().user?.role),
}));

export default useAuthStore;