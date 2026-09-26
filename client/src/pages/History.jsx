import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchMatchHistory } from "../services/matchService";
import { fetchNotifications } from "../services/notificationService";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import TagBadge from "../components/TagBadge";

const History = () => {
  const [history, setHistory] = useState([]);
  const [totalPeople, setTotalPeople] = useState(0);
  const [totalLearned, setTotalLearned] = useState(0);
  const [totalTaught, setTotalTaught] = useState(0);
  const [search, setSearch] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadHistoryData = async () => {
      try {
        const data = await fetchMatchHistory();
        if (isMounted) {
          setHistory(data.history || []);
          setTotalPeople(data.totalPeople || 0);
          setTotalLearned(data.totalLearned || 0);
          setTotalTaught(data.totalTaught || 0);
        }

        const notifs = await fetchNotifications();
        if (isMounted) {
          setUnreadCount(notifs.unreadCount || 0);
        }
      } catch (err) {
        console.error("Failed to load match history:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadHistoryData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredHistory = history.filter((match) => {
    const searchText = search.toLowerCase();
    const nameMatch = match.name?.toLowerCase().includes(searchText);
    const deptMatch = match.department?.toLowerCase().includes(searchText);
    const learnedMatch = (match.learned || []).some((skill) =>
      skill.toLowerCase().includes(searchText)
    );
    const taughtMatch = (match.taught || []).some((skill) =>
      skill.toLowerCase().includes(searchText)
    );
    return nameMatch || deptMatch || learnedMatch || taughtMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-12">
      {/* Responsive Navbar */}
      <Navbar unreadCount={unreadCount} />

      {/* Header Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-10 text-center shadow-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-bold text-indigo-800">
            Academic Portfolio & Archive
          </span>

          <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-950">
            Your Match History
          </h1>

          <p className="mt-2 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-slate-600">
            Review past academic study sessions, complementary subjects learned, and knowledge you've shared with fellow students.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* =====================================
            STATS SUMMARY GRID
        ====================================== */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Previous Matches */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Connected Peers
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-950">
                {totalPeople}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-700 text-lg border border-indigo-100">
              ↔
            </div>
          </div>

          {/* Skills Learned */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                Skills Gained
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-teal-700">
                {totalLearned}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 font-bold text-teal-700 text-lg border border-teal-100">
              ↓
            </div>
          </div>

          {/* Skills Shared */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-800">
                Skills Shared
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-indigo-700">
                {totalTaught}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-700 text-lg border border-indigo-100">
              ↑
            </div>
          </div>
        </section>

        {/* =====================================
            SEARCH & FILTER CONTROLS
        ====================================== */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-950">
              Session Archive
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Filter by peer name, department, or specific academic subjects.
            </p>
          </div>

          <div className="w-full sm:w-80">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by student or skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
              <svg
                className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </section>

        {/* =====================================
            HISTORY LIST
        ====================================== */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-2xs">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
            <p className="text-sm font-medium">Loading your academic exchange history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 sm:p-14 text-center shadow-2xs">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-2xl font-bold">
              ↔
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {search ? "No matching records found" : "No session history yet"}
            </h3>
            <p className="mt-1.5 max-w-md mx-auto text-xs sm:text-sm text-slate-500 leading-relaxed">
              {search
                ? `No past matches matched "${search}". Try searching for another topic or student name.`
                : "Connect with classmates on the Topics page and accept invitations in Notifications to build your academic history!"}
            </p>
            {!search && (
              <Link
                to="/dashboard"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
              >
                Go to Topics Dashboard →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((match) => (
              <article
                key={match.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs transition-all hover:border-indigo-200 hover:shadow-md"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                  {/* Left: Person Info & Chat Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-start gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-700 border border-indigo-100 shadow-2xs">
                        {match.avatar || match.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-950">
                          {match.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {match.department} · Semester {match.semester}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Matched on {match.date}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={match.peerId ? `/chat?peerId=${match.peerId}` : (match.id ? `/chat?matchId=${match.id}` : "/chat")}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-colors self-start sm:self-auto"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-1.074-.85 9.948 9.948 0 011.026-2.569C4.08 16.273 3 14.264 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                      </svg>
                      Open Chat
                    </Link>
                  </div>

                  {/* Right: Complementary Skill Exchange Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 lg:max-w-xl">
                    {/* Learned */}
                    <div className="rounded-xl border border-teal-200/80 bg-teal-50/50 p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-teal-600 text-white text-[9px] font-bold">
                          ↓
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900">
                          Learned From {match.name.split(" ")[0]}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {(match.learned || []).map((skill, idx) => (
                          <TagBadge key={idx} tag={skill} type="learn" size="sm" />
                        ))}
                      </div>
                    </div>

                    {/* Taught */}
                    <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-600 text-white text-[9px] font-bold">
                          ↑
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900">
                          Taught {match.name.split(" ")[0]}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {(match.taught || []).map((skill, idx) => (
                          <TagBadge key={idx} tag={skill} type="teach" size="sm" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav unreadCount={unreadCount} />
    </div>
  );
};

export default History;