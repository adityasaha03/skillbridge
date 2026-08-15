import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<div style={{ padding: '2rem', textAlign: 'center' }}>Registration Page Placeholder</div>} />
        <Route path="/dashboard" element={<div style={{ padding: '2rem', textAlign: 'center' }}>Home / Dashboard Placeholder</div>} />
      </Routes>
    </Router>
  );
}

export default App;