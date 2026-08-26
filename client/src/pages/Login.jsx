import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f0f4f8] p-4">
      <div className="bg-white p-8 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)] w-full max-w-100">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">
          Log In to SkillBridge
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Welcome back! Please enter your credentials.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex flex-col">
            <label htmlFor="email" className="text-sm mb-1 text-gray-800 font-medium">
              AUST Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-2 border border-gray-300 rounded text-base focus:outline-none focus:border-[#0066cc]"
            />
          </div>

          <div className="mb-4 flex flex-col">
            <label htmlFor="password" className="text-sm mb-1 text-gray-800 font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-2 border border-gray-300 rounded text-base focus:outline-none focus:border-[#0066cc]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-6 border-none rounded cursor-pointer text-base bg-[#0066cc] text-white mt-4 hover:bg-[#0055aa] transition-colors"
          >
            Log In
          </button>
        </form>

        <p className="mt-6 text-center">
          <Link to="/register" className="text-[#0066cc] no-underline mt-2 inline-block hover:underline">
            Don't have an account? Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;