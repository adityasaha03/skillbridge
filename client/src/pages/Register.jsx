import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const departments = [
  'Department of Architecture (ARCH)',
  'Department of Civil Engineering (CE)',
  'Department of Computer Science & Engineering (CSE)',
  'Department of Electrical & Electronic Engineering (EEE)',
  'Department of Mechanical and Production Engineering (MPE)',
  'Department of Textile Engineering (TE)',
  'School of Business (SoB)',
  'Department of Arts and Sciences (A&S)',
];

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 text-slate-900">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        {/* Header */}
        <div className="text-center">
          <Link to="/" className="text-3xl font-extrabold tracking-tight text-slate-950 inline-block mb-3">
            Skill<span className="text-indigo-600">Bridge</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Join SkillBridge
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Create your account to start exchanging knowledge.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="fullName" className="mb-2 block text-sm font-semibold text-slate-800">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-800">
              AUST Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="name.dept.id@aust.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label htmlFor="studentId" className="mb-2 block text-sm font-semibold text-slate-800">
              Student ID
            </label>
            <input
              id="studentId"
              type="text"
              placeholder="Your AUST ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label htmlFor="department" className="mb-2 block text-sm font-semibold text-slate-800">
              Department
            </label>
            <select
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
              className={`w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${
                department ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              <option value="" disabled hidden>
                Select your department
              </option>
              {departments.map((dept) => (
                <option key={dept} value={dept} className="text-slate-900">
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-800">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.99] shadow-sm"
          >
            Create Account
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
