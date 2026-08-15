import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        {/* Both completed pages registered together */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Placeholders for upcoming peer pages */}
        <Route path="/register" element={<div style={{ padding: '2rem', textAlign: 'center' }}>Registration Page Placeholder</div>} />
        <Route path="/dashboard" element={<div style={{ padding: '2rem', textAlign: 'center' }}>Home / Dashboard Placeholder</div>} />
      </Routes>
    </Router>
  );
}

export default App;