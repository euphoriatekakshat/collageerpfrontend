// import React, { useState } from 'react';
// import { Navigate, Link } from 'react-router-dom';
// import { GraduationCap, Eye, EyeOff } from 'lucide-react';
// import useAuthStore from '../../store/authStore';

// export default function Login() {
//   const { login, isAuthenticated, loading } = useAuthStore();

//   const [showPassword, setShowPassword] = useState(false);
//   const [form, setForm] = useState({
//     email: '',
//     password: '',
//   });

//   if (isAuthenticated()) {
//     return <Navigate to="/" replace />;
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       await login(form.email, form.password);
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   return (
//     <div className="min-h-screen flex">
      
//       <div className="hidden lg:flex w-1/2 bg-blue-700 text-white items-center justify-center p-12">
//         <div>
//           <GraduationCap size={80} />
//           <h1 className="text-5xl font-bold mt-6">
//             College ERP
//           </h1>
//           <p className="mt-4 text-lg text-blue-100">
//             Manage Students, Teachers, Attendance,
//             Fees, Results and Administration.
//           </p>
//         </div>
//       </div>

      
//       <div className="flex-1 flex items-center justify-center bg-gray-50">
//         <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
//           <h2 className="text-3xl font-bold text-gray-800">
//             Login
//           </h2>

//           <p className="text-gray-500 mt-2">
//             Sign in to continue
//           </p>

//           <form onSubmit={handleSubmit} className="mt-8 space-y-5">
//             <div>
//               <label className="block text-sm font-medium mb-2">
//                 Email
//               </label>

//               <input
//                 type="email"
//                 required
//                 value={form.email}
//                 onChange={(e) =>
//                   setForm({ ...form, email: e.target.value })
//                 }
//                 className="w-full border rounded-lg px-4 py-3"
//                 placeholder="admin@college.com"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-2">
//                 Password
//               </label>

//               <div className="relative">
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   required
//                   value={form.password}
//                   onChange={(e) =>
//                     setForm({
//                       ...form,
//                       password: e.target.value,
//                     })
//                   }
//                   className="w-full border rounded-lg px-4 py-3 pr-12"
//                   placeholder="********"
//                 />

//                 <button
//                   type="button"
//                   className="absolute right-3 top-3"
//                   onClick={() =>
//                     setShowPassword(!showPassword)
//                   }
//                 >
//                   {showPassword ? (
//                     <EyeOff size={18} />
//                   ) : (
//                     <Eye size={18} />
//                   )}
//                 </button>
//               </div>
//             </div>

//             <button
//               disabled={loading}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
//             >
//               {loading ? 'Signing In...' : 'Login'}
//             </button>

//             <div className="text-center">
//               <Link
//                 to="/register"
//                 className="text-blue-600 font-medium"
//               >
//                 Create Account
//               </Link>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }











import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
  { role: 'Super Admin', email: 'admin@erp.com', password: 'Admin@123', color: 'bg-purple-100 text-purple-800' },
  { role: 'College Admin', email: 'college@erp.com', password: 'Admin@123', color: 'bg-blue-100 text-blue-800' },
  { role: 'HOD', email: 'hod@erp.com', password: 'Hod@123', color: 'bg-teal-100 text-teal-800' },
  { role: 'Teacher', email: 'teacher@erp.com', password: 'Teacher@123', color: 'bg-orange-100 text-orange-800' },
  { role: 'Accounts Admin', email: 'accounts@college.edu', password: 'acc123', color: 'bg-green-100 text-green-800' },
  { role: 'Exam Controller', email: 'exam@college.edu', password: 'exam123', color: 'bg-yellow-100 text-yellow-800' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Enter email and password');
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    }
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Building2 size={22} />
            </div>
            <span className="text-xl font-bold">Skiller ERP</span>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight mb-4">
            Complete College<br />Management System
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed">
            Manage students, teachers, attendance, marks, fees, timetable and more — all in one place.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Students', val: '2,400+' },
            { label: 'Teachers', val: '120+' },
            { label: 'Departments', val: '8' },
            { label: 'Modules', val: '15+' },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
              <p className="text-2xl font-extrabold">{s.val}</p>
              <p className="text-sm text-blue-200 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:text-left">
            <div className="flex items-center gap-2 lg:hidden mb-6 justify-center">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <Building2 size={20} className="text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Skiller ERP</span>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to your admin panel</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-5">
            {/* Email */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Demo Accounts (click to fill)</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role} onClick={() => fillDemo(acc)}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] active:scale-95 ${acc.color} border border-transparent hover:border-current`}
                >
                  {acc.role}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">Click any role → then Sign In</p>
          </div>
        </div>
      </div>
    </div>
  );
}




