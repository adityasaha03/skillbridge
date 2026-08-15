import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const availableMatches = [
  {
    id: 1,
    name: 'Rafi Ahmed',
    avatar: 'R',
    trade: 'Trading C++ Graph Algorithms for React UI',
  },
  {
    id: 2,
    name: 'Mehjabin Tasnim',
    avatar: 'M',
    trade: 'Offering Data Structures help',
  },
  {
    id: 3,
    name: 'Siam Uddin',
    avatar: 'S',
    trade: 'Want Python for ML, can teach CAE',
  },
];

const Dashboard = () => {
  const [wantToLearn, setWantToLearn] = useState('');
  const [canTeach, setCanTeach] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="dashboard">
      {/* Header Navigation */}
      <header className="dashboard-header">
        <div className="logo">SkillBridge</div>
        <nav className="nav">
          <Link to="/dashboard" className="nav-link">Explore Skills</Link>
          <Link to="/dashboard" className="nav-link">My Requests</Link>
          <Link to="/dashboard" className="nav-link">Profile</Link>
        </nav>
        <Link to="/" className="logout-btn">Log Out</Link>
      </header>

      {/* Welcome Banner */}
      <section className="welcome">
        <h1>Welcome back, Student!</h1>
        <p>
          SkillBridge connects you with peers for mutual academic growth.
          List a skill you want to learn and one you can teach in return.
          Our matching engine finds reciprocal exchanges so knowledge flows both ways.
        </p>
      </section>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Column 1: Available Skill Matches */}
        <section className="column">
          <h2>Available Skill Matches</h2>
          <div className="match-list">
            {availableMatches.map((peer) => (
              <div className="match-card" key={peer.id}>
                <div className="avatar">{peer.avatar}</div>
                <div className="match-info">
                  <h3>{peer.name}</h3>
                  <p>{peer.trade}</p>
                </div>
                <button type="button" className="connect-btn">Connect</button>
              </div>
            ))}
          </div>
        </section>

        {/* Column 2: Post a Request / Trade */}
        <section className="column">
          <h2>Post a Request / Trade</h2>
          <form className="trade-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="want-to-learn">I want to learn</label>
              <input
                id="want-to-learn"
                type="text"
                placeholder="e.g. React UI, C++ Graphs"
                value={wantToLearn}
                onChange={(e) => setWantToLearn(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="can-teach">I can teach</label>
              <input
                id="can-teach"
                type="text"
                placeholder="e.g. Data Structures, Python"
                value={canTeach}
                onChange={(e) => setCanTeach(e.target.value)}
              />
            </div>

            <button type="submit" className="post-btn">Post Request</button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
