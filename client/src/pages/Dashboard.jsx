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
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      {/* Header */}
      <header className="grid grid-cols-[auto_1fr_auto] items-center gap-6 border-b border-gray-200 bg-white px-6 py-4">
        {/* Logo */}
        <div className="text-xl font-semibold text-gray-900">
          SkillBridge
        </div>

        {/* Navigation */}
        <nav className="flex items-center justify-center gap-6">
          <Link
            to="/dashboard"
            className="rounded-md px-2.5 py-1.5 font-medium text-gray-600 transition hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Explore Skills
          </Link>

          <Link
            to="/dashboard"
            className="rounded-md px-2.5 py-1.5 font-medium text-gray-600 transition hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            My Requests
          </Link>

          <Link
            to="/dashboard"
            className="rounded-md px-2.5 py-1.5 font-medium text-gray-600 transition hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Profile
          </Link>
        </nav>

        {/* Logout */}
        <Link
          to="/"
          className="justify-self-end rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-800 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Log Out
        </Link>
      </header>

      {/* Welcome Banner */}
      <section className="border-b border-gray-200 px-6 py-8 text-center">
        <h1 className="mb-8 text-3xl font-bold text-black">
          Welcome back, Student!
        </h1>

        <p className="mx-auto max-w-[680px] leading-relaxed text-black">
          SkillBridge connects you with peers for mutual academic growth.
          List a skill you want to learn and one you can teach in return.
          Our matching engine finds reciprocal exchanges so knowledge flows
          both ways.
        </p>
      </section>

      {/* Main Content */}
      <main className="grid grid-cols-1 gap-8 px-5 py-6 lg:grid-cols-2 lg:px-6 lg:py-8">
        {/* Available Skill Matches */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-black">
            Available Skill Matches
          </h2>

          <div className="flex flex-col gap-4">
            {availableMatches.map((peer) => (
              <div
                key={peer.id}
                className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 transition hover:border-gray-300 hover:shadow-sm"
              >
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                  {peer.avatar}
                </div>

                {/* Match Info */}
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 text-base font-semibold text-black">
                    {peer.name}
                  </h3>

                  <p className="text-sm text-gray-600">
                    {peer.trade}
                  </p>
                </div>

                {/* Connect Button */}
                <button
                  type="button"
                  className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 active:scale-[0.97]"
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Post Request / Trade */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-black">
            Post a Request / Trade
          </h2>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 rounded-lg border border-gray-200 bg-gray-50 p-5"
          >
            {/* Want to Learn */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="want-to-learn"
                className="text-sm font-medium text-gray-800"
              >
                I want to learn
              </label>

              <input
                id="want-to-learn"
                type="text"
                placeholder="e.g. React UI, C++ Graphs"
                value={wantToLearn}
                onChange={(e) => setWantToLearn(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Can Teach */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="can-teach"
                className="text-sm font-medium text-gray-800"
              >
                I can teach
              </label>

              <input
                id="can-teach"
                type="text"
                placeholder="e.g. Data Structures, Python"
                value={canTeach}
                onChange={(e) => setCanTeach(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Post Button */}
            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-[15px] font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
            >
              Post Request
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;