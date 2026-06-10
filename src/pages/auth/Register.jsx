import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'college_admin',
  });

  const submit = async (e) => {
    e.preventDefault();

    try {
      await authAPI.register(form);

      alert('Registration Successful');

      navigate('/login');
    } catch (err) {
      alert(
        err.response?.data?.message ||
          'Registration Failed'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6">
          Register
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <input
            type="email"
            className="w-full border rounded-lg p-3"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <input
            type="password"
            className="w-full border rounded-lg p-3"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          <select
            className="w-full border rounded-lg p-3"
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value,
              })
            }
          >
            <option value="college_admin">
              College Admin
            </option>
            <option value="hod">
              HOD
            </option>
            <option value="teacher">
              Teacher
            </option>
            <option value="accounts_admin">
              Accounts Admin
            </option>
            <option value="exam_controller">
              Exam Controller
            </option>
          </select>

          <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
            Register
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-blue-600"
            >
              Already have an account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}