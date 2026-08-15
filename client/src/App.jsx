import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        {/* Placeholder until landing page is merged into dev */}
        <Route path="/" element={<div style={{ padding: '2rem', textAlign: 'center' }}>Landing Page (Feature Branch)</div>} />
        
        {/* Your active page for this branch */}
        <Route path="/login" element={<Login />} />

        {/* Temporary Placeholders */}
        <Route path="/register" element={<div style={{ padding: '2rem', textAlign: 'center' }}>Registration Page Placeholder</div>} />
        <Route path="/dashboard" element={<div style={{ padding: '2rem', textAlign: 'center' }}>Home / Dashboard Placeholder</div>} />
      </Routes>
    </Router>
  );
}

export default App;