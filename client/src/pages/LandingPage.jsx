import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="logo">SkillBridge</div>
        <nav className="nav">
          <Link to="/login" className="nav-link">Log In</Link>
          <Link to="/register" className="nav-link">Sign Up</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="hero">
        <h1>Bridge Your Knowledge Gap</h1>
        <p>Connect with peers for mutual academic growth</p>
        <div className="cta-buttons">
          <Link to="/login" className="btn btn-primary">Log In</Link>
          <Link to="/register" className="btn btn-secondary">Sign Up</Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-grid">
        <div className="feature-card">
          <h3>Reciprocal Matching</h3>
          <p>Equal mutual knowledge exchange.</p>
        </div>
        <div className="feature-card">
          <h3>Taxonomy Tags</h3>
          <p>Standardized academic topics.</p>
        </div>
        <div className="feature-card">
          <h3>Bridge Workflow</h3>
          <p>Simple session acceptance.</p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;