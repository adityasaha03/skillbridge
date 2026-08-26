import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="max-w-300 mx-auto px-4 min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center py-4">
        <div className="text-2xl font-bold text-[#0066cc]">SkillBridge</div>
        <nav className="flex gap-4">
          <Link to="/login" className="text-[#0066cc] hover:underline transition-all">
            Log In
          </Link>
          <Link to="/register" className="text-[#0066cc] hover:underline transition-all">
            Sign Up
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center py-16 px-4 bg-white rounded-lg shadow-md my-8">
        <h1 className="text-4xl font-bold text-[#0066cc] mb-2">
          Bridge Your Knowledge Gap
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Connect with peers for mutual academic growth
        </p>
        <div className="flex gap-4 justify-center mt-4">
          <Link
            to="/login"
            className="px-6 py-3 rounded text-white bg-[#0066cc] hover:bg-[#0055aa] transition-colors cursor-pointer text-base"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 rounded text-gray-800 bg-[#e0e0e0] hover:bg-[#d0d0d0] transition-colors cursor-pointer text-base"
          >
            Sign Up
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 py-8 px-4">
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <h3 className="mt-0 text-xl font-bold text-[#0066cc] mb-2">
            Reciprocal Matching
          </h3>
          <p className="mb-2 text-gray-600">
            Equal mutual knowledge exchange.
          </p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <h3 className="mt-0 text-xl font-bold text-[#0066cc] mb-2">
            Taxonomy Tags
          </h3>
          <p className="mb-2 text-gray-600">
            Standardized academic topics.
          </p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <h3 className="mt-0 text-xl font-bold text-[#0066cc] mb-2">
            Bridge Workflow
          </h3>
          <p className="mb-2 text-gray-600">
            Simple session acceptance.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;