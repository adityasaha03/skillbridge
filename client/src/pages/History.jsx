import React, { useState } from "react";
import { Link } from "react-router-dom";

/* ---------------------------------------
   SAMPLE MATCH HISTORY
---------------------------------------- */

const matchHistory = [
    {
        id: 1,
        name: "Rafi Ahmed",
        avatar: "R",
        department: "CSE",
        semester: "3.1",
        date: "24 Aug 2026",
        learned: ["React UI", "React Hooks"],
        taught: ["C++ Graph Algorithms", "Data Structures"],
    },
    {
        id: 2,
        name: "Mehjabin Tasnim",
        avatar: "M",
        department: "CSE",
        semester: "2.2",
        date: "18 Aug 2026",
        learned: ["Data Structures", "Algorithms"],
        taught: ["Python", "Machine Learning"],
    },
    {
        id: 3,
        name: "Siam Uddin",
        avatar: "S",
        department: "EEE",
        semester: "3.2",
        date: "12 Aug 2026",
        learned: ["Python for Machine Learning"],
        taught: ["CAE"],
    },
    {
        id: 4,
        name: "Nafisa Islam",
        avatar: "N",
        department: "CSE",
        semester: "2.1",
        date: "05 Aug 2026",
        learned: ["Database Design", "MongoDB"],
        taught: ["Java", "Object Oriented Programming"],
    },
];

/* ---------------------------------------
   HISTORY PAGE
---------------------------------------- */

const History = () => {
    const [search, setSearch] = useState("");

    /* ---------------------------------------
       SEARCH HISTORY
    ---------------------------------------- */

    const filteredHistory = matchHistory.filter((match) => {
        const searchText = search.toLowerCase();

        const nameMatch = match.name.toLowerCase().includes(searchText);

        const learnedMatch = match.learned.some((skill) =>
            skill.toLowerCase().includes(searchText)
        );

        const taughtMatch = match.taught.some((skill) =>
            skill.toLowerCase().includes(searchText)
        );

        return nameMatch || learnedMatch || taughtMatch;
    });

    /* ---------------------------------------
       STATISTICS
    ---------------------------------------- */

    const totalPeople = matchHistory.length;

    const totalLearned = matchHistory.reduce(
        (total, match) => total + match.learned.length,
        0
    );

    const totalTaught = matchHistory.reduce(
        (total, match) => total + match.taught.length,
        0
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* =====================================
          NAVBAR
      ====================================== */}

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

          <nav className="flex items-center gap-4 md:gap-8">
            <Link
              to="/dashboard"
              className="text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
            >
              Topics
            </Link>

            <Link
              to="/history"
                className="text-sm font-semibold text-indigo-600"
            >
              History
            </Link>

            <Link
              to="/chat"
              className="text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
            >
              Chat
            </Link>

            <Link
              to="/profile"
              className="text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
            >
              Profile
            </Link>
          </nav>

          {/* Right-side controls */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Notification Bell — active state (unread present) */}
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-600 bg-white text-indigo-600 shadow-sm transition hover:bg-indigo-50 active:scale-95"
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 8a6 6 0 0 1 12 0c0 3.5 1 5 1.5 6H4.5C5 13 6 11.5 6 8Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 17a2.5 2.5 0 0 0 5 0" />
              </svg>
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white">
                3
              </span>
            </Link>

            {/* Theme Switcher */}
            <button
              type="button"
              aria-label="Toggle dark mode"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 active:scale-95"
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="4" />
                <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            </button>

          
            {/* Logout */}
            <Link
              to="/"
              className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 active:scale-95 sm:px-4 sm:py-2 sm:text-sm"
            >
              Log Out
            </Link>
          </div>
        </div>
      </header>

            {/* =====================================
          HISTORY INTRO
      ====================================== */}

            <section className="mx-auto max-w-7xl px-6 pt-10">
                <div className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm md:p-12">
                    <span className="mb-4 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700">
                        Your Learning Journey
                    </span>

                    <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
                        Match History
                    </h1>

                    <p className="max-w-2xl text-base leading-7 text-slate-600">
                        Review the students you previously matched with and see the skills
                        you exchanged with each other.
                    </p>
                </div>
            </section>

            {/* =====================================
          MAIN CONTENT
      ====================================== */}

            <main className="mx-auto max-w-7xl px-6 py-10">
                {/* =====================================
            SUMMARY
        ====================================== */}

                <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Previous Matches */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-1 flex h-5 w-10 items-center justify-center rounded-lg bg-indigo-50 font-bold text-indigo-600">
                            ↔
                        </div>

                        <p className="text-sm font-medium text-slate-500">
                            Previous Matches
                        </p>

                        <p className="mt-1 text-3xl font-bold text-slate-950">
                            {totalPeople}
                        </p>
                    </div>

                    {/* Skills Learned */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-3 flex h-5 w-10 items-center justify-center rounded-lg bg-indigo-50 font-bold text-indigo-600">
                            ↓
                        </div>

                        <p className="text-sm font-medium text-slate-500">
                            Skills Learned
                        </p>

                        <p className="mt-1 text-3xl font-bold text-indigo-600">
                            {totalLearned}
                        </p>
                    </div>

                    {/* Skills Shared */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-3 flex h-5 w-10 items-center justify-center rounded-lg bg-indigo-50 font-bold text-indigo-600">
                            ↑
                        </div>

                        <p className="text-sm font-medium text-slate-500">
                            Skills Shared
                        </p>

                        <p className="mt-1 text-3xl font-bold text-indigo-600">
                            {totalTaught}
                        </p>
                    </div>
                </section>

                {/* =====================================
            HISTORY HEADER
        ====================================== */}

                <section>
                    <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        {/* Heading */}
                        <div>
                            <span className="text-sm font-semibold text-indigo-600">
                                Previous Connections
                            </span>

                            <h2 className="mt-1 text-2xl font-bold text-slate-950">
                                Your Previous Matches
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                See who you matched with and what knowledge you exchanged.
                            </p>
                        </div>

                        {/* Search */}
                        <div className="w-full md:w-80">
                            <label
                                htmlFor="history-search"
                                className="mb-2 block text-left text-sm font-semibold text-slate-700"
                            >
                                Search history
                            </label>

                            <input
                                id="history-search"
                                type="text"
                                placeholder="Search name or skill..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                    </div>

                    {/* =====================================
              HISTORY LIST
          ====================================== */}

                    <div className="space-y-5">
                        {filteredHistory.map((match) => (
                            <article
                                key={match.id}
                                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                            >
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                                    {/* Person Information */}
                                    <div className="flex min-w-[250px] items-center gap-4">
                                        {/* Avatar */}
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl font-bold text-indigo-600">
                                            {match.avatar}
                                        </div>

                                        {/* Name */}
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">
                                                {match.name}
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {match.department} · Semester {match.semester}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                Matched on {match.date}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Skill Exchange */}
                                    <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                                        {/* Learned */}
                                        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                                            <p className="text-center text-xs font-semibold uppercase tracking-wide text-indigo-600">
                                                You Learned From {match.name.split(" ")[0]}
                                            </p>

                                            <div className="mt-5 flex flex-wrap justify-center gap-2">
                                                {match.learned.map((skill) => (
                                                    <span
                                                        key={skill}
                                                        className="rounded-md border border-indigo-100 bg-white px-2.5 py-1 text-xs font-semibold text-indigo-700"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Taught */}
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                You Taught {match.name.split(" ")[0]}
                                            </p>

                                            <div className="mt-5 flex flex-wrap justify-center gap-2">
                                                {match.taught.map((skill) => (
                                                    <span
                                                        key={skill}
                                                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* =====================================
              EMPTY SEARCH RESULT
          ====================================== */}

                    {filteredHistory.length === 0 && (
                        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl font-bold text-indigo-600">
                                ↔
                            </div>

                            <h3 className="text-lg font-bold text-slate-900">
                                No matches found
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                We couldn't find a previous match for "{search}".
                            </p>
                        </div>
                    )}
                </section>
            </main>

            {/* =====================================
          FOOTER
      ====================================== */}

            <footer className="mt-6 border-t border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-slate-500">
                    © 2026 SkillBridge · Learn together. Grow together.
                </div>
            </footer>
        </div>
    );
};

export default History;