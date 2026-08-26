import React, { useState } from "react";
import { Link } from "react-router-dom";

const availableMatches = [
  {
    id: 1,
    name: "Rafi Ahmed",
    avatar: "R",
    trade: "Trading C++ Graph Algorithms for React UI",
  },
  {
    id: 2,
    name: "Mehjabin Tasnim",
    avatar: "M",
    trade: "Offering Data Structures help",
  },
  {
    id: 3,
    name: "Siam Uddin",
    avatar: "S",
    trade: "Want Python for ML, can teach CAE",
  },
];

const Dashboard = () => {
  const [wantToLearn, setWantToLearn] = useState("");
  const [canTeach, setCanTeach] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      wantToLearn,
      canTeach,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="text-2xl font-bold tracking-tight text-slate-950"
          >
            Skill<span className="text-indigo-600">Bridge</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/dashboard"
              className="text-sm font-semibold text-indigo-600 transition duration-150"
            >
              Topics
            </Link>

            <Link
              to="/history"
              className="text-sm font-semibold text-slate-600 transition duration-150 hover:text-indigo-600"
            >
              History
            </Link>

            <Link
              to="/dashboard"
              className="text-sm font-semibold text-slate-600 transition duration-150 hover:text-indigo-600"
            >
              Profile
            </Link>
          </nav>

          {/* Logout */}
          <Link
            to="/"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition duration-150 hover:border-slate-400 hover:bg-slate-50 active:scale-95"
          >
            Log Out
          </Link>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="mx-auto max-w-7xl px-6 pt-10">
        <div className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm md:p-12">
          <span className="mb-4 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700">
            Peer-to-Peer Academic Learning
          </span>

          <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
            Welcome back, Student!
          </h1>

          <p className="max-w-2xl text-base leading-7 text-slate-600">
            SkillBridge connects you with peers for mutual academic growth.
            List a skill you want to learn and one you can teach in return.
            Our matching engine finds reciprocal exchanges so knowledge flows
            both ways.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-2">
        {/* Available Matches */}
        <section>
          <div className="mb-5">
            <span className="text-sm font-semibold text-indigo-600">
              Discover Peers
            </span>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Available Skill Matches
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Connect with students whose skills match what you want to learn.
            </p>
          </div>

          <div className="space-y-4">
            {availableMatches.map((peer) => (
              <div
                key={peer.id}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
              >
                {/* Avatar */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600">
                  {peer.avatar}
                </div>

                {/* Match Info */}
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900">
                    {peer.name}
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-slate-600">
                    {peer.trade}
                  </p>
                </div>

                {/* Connect Button */}
                <button
                  type="button"
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-700 active:scale-95"
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Post Request */}
        <section>
          <div className="mb-5">
            <span className="text-sm font-semibold text-indigo-600">
              Skill Exchange
            </span>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Post a Request / Trade
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Tell the community what you want to learn and what you can offer.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            {/* Want to Learn */}
            <div className="mb-5">
              <label
                htmlFor="want-to-learn"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                I want to learn
              </label>

              <input
                id="want-to-learn"
                type="text"
                placeholder="e.g. React UI, C++ Graphs"
                value={wantToLearn}
                onChange={(e) => setWantToLearn(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-150 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Can Teach */}
            <div className="mb-6">
              <label
                htmlFor="can-teach"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                I can teach
              </label>

              <input
                id="can-teach"
                type="text"
                placeholder="e.g. Data Structures, Python"
                value={canTeach}
                onChange={(e) => setCanTeach(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-150 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-700 active:scale-[0.98]"
            >
              Post Request
            </button>
          </form>

          {/* Helper Card */}
          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
            <p className="text-sm leading-6 text-indigo-900">
              <span className="font-semibold">Tip:</span> Be specific about
              what you want to learn and what you can teach to get better
              reciprocal matches.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-6 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-slate-500">
          © 2026 SkillBridge · Learn together. Grow together.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;