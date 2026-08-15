import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import './App.css';

function PlaceholderRoute() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>{window.location.pathname}</h2>
      <p>Placeholder page</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PlaceholderRoute />} />
        <Route path="/register" element={<PlaceholderRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;