import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Log In to SkillBridge</h2>
        <p className="login-subtext">Welcome back! Please enter your credentials.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">AUST Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Log In
          </button>
        </form>

        <p className="login-footer">
          <Link to="/register">
            Don't have an account? Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;