import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-2xl font-bold tracking-tight text-slate-950">
            Skill<span className="text-indigo-600">Bridge</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition duration-150"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition duration-150"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="flex flex-col items-center text-center rounded-2xl border border-slate-200/80 bg-white p-8 md:p-14 shadow-sm">
          <span className="mb-4 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700 border border-indigo-100">
            Peer-to-Peer Knowledge Sharing
          </span>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
            Bridge Your Knowledge Gap
          </h1>
          <p className="max-w-2xl text-base md:text-lg leading-7 text-slate-600 mb-8">
            Connect with university peers for reciprocal academic growth. Trade your strengths, master new subjects, and build your skill inventory.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            <Link
              to="/login"
              className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 active:scale-95 transition duration-150 text-center"
            >
              Get Started
            </Link>
            <Link
              to="/register"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-400 active:scale-95 transition duration-150 text-center"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold">
              ⇄
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Reciprocal Matching
            </h3>
            <p className="text-sm leading-6 text-slate-600">
              Equal mutual knowledge exchange guaranteed by our smart pairing system.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold">
              #
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Taxonomy Tags
            </h3>
            <p className="text-sm leading-6 text-slate-600">
              Standardized course & topic tags to easily target exact academic needs.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold">
              ✓
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Bridge Workflow
            </h3>
            <p className="text-sm leading-6 text-slate-600">
              Streamlined session scheduling and peer acceptance workflows.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;