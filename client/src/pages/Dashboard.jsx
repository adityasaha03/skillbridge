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
      {/* Navbar */}
      <header className="bg-slate-950 text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* Logo */}
          <Link
            to="/dashboard"
            className="text-2xl font-bold tracking-tight"
          >
            Skill
            <span className="text-indigo-400">Bridge</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/dashboard"
              className="font-medium text-slate-300 transition hover:text-white"
            >
              Topics
            </Link>

            <Link
              to="/dashboard"
              className="font-medium text-slate-300 transition hover:text-white"
            >
              History
            </Link>

            <Link
              to="/dashboard"
              className="font-medium text-slate-300 transition hover:text-white"
            >
              Profile
            </Link>
          </nav>

          {/* Logout */}
          <Link
            to="/"
            className="rounded-lg border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
          >
            Log Out
          </Link>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-14 text-center">

          <span className="mb-4 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700">
            Peer-to-Peer Academic Learning
          </span>

          <h1 className="mb-5 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Welcome back, Student!
          </h1>

          <p className="max-w-2xl text-center text-base leading-7 text-slate-600">
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
            <h2 className="text-2xl font-bold text-slate-900">
              Available Skill Matches
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Find students whose skills match your learning interests.
            </p>
          </div>

          <div className="space-y-4">
            {availableMatches.map((peer) => (
              <div
                key={peer.id}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              >

                {/* Avatar */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white">
                  {peer.avatar}
                </div>

                {/* User Information */}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900">
                    {peer.name}
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {peer.trade}
                  </p>
                </div>

                {/* Connect Button */}
                <button
                  type="button"
                  className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-95"
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
            <h2 className="text-2xl font-bold text-slate-900">
              Post a Request / Trade
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Share what you want to learn and what you can teach.
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
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                I want to learn
              </label>

              <input
                id="want-to-learn"
                type="text"
                placeholder="e.g. React UI, C++ Graphs"
                value={wantToLearn}
                onChange={(e) => setWantToLearn(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Can Teach */}
            <div className="mb-6">
              <label
                htmlFor="can-teach"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                I can teach
              </label>

              <input
                id="can-teach"
                type="text"
                placeholder="e.g. Data Structures, Python"
                value={canTeach}
                onChange={(e) => setCanTeach(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Post Button */}
            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.99]"
            >
              Post Request
            </button>
          </form>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-slate-500">
          © 2026 SkillBridge · Learn together. Grow together.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;