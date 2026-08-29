import React, { useState } from "react";
import { Link } from "react-router-dom";

/* ---------------------------------------
   STANDARD TOPIC TAXONOMY
---------------------------------------- */

const availableTopics = [
  "C Programming",
  "C++",
  "C++ Graph Algorithms",
  "Data Structures",
  "Algorithms",
  "Java",
  "Python",
  "Python for Machine Learning",
  "React",
  "React UI",
  "React Hooks",
  "JavaScript",
  "HTML",
  "CSS",
  "Database Design",
  "SQL",
  "MongoDB",
  "Node.js",
  "Express.js",
  "Machine Learning",
  "Artificial Intelligence",
  "Computer Architecture",
  "Operating Systems",
  "Computer Networks",
  "CAE",
];

/* ---------------------------------------
   SAMPLE RECIPROCAL MATCHES
---------------------------------------- */

const availableMatches = [
  {
    id: 1,
    name: "Rafi Ahmed",
    avatar: "R",
    department: "CSE",
    semester: "3.1",
    learnFromPeer: "React UI",
    teachPeer: "C++ Graph Algorithms",
    bio: "Can help with React components, layouts, and responsive interfaces.",
  },
  {
    id: 2,
    name: "Mehjabin Tasnim",
    avatar: "M",
    department: "CSE",
    semester: "2.2",
    learnFromPeer: "Data Structures",
    teachPeer: "Python",
    bio: "Interested in collaborative problem solving and algorithm practice.",
  },
  {
    id: 3,
    name: "Siam Uddin",
    avatar: "S",
    department: "EEE",
    semester: "3.2",
    learnFromPeer: "Python for Machine Learning",
    teachPeer: "CAE",
    bio: "Can exchange engineering simulation knowledge for practical ML skills.",
  },
];

/* ---------------------------------------
   REUSABLE TOPIC SELECTOR
---------------------------------------- */

const TopicSelector = ({
  label,
  placeholder,
  selectedTopics,
  setSelectedTopics,
}) => {
  const [input, setInput] = useState("");

  const filteredTopics = availableTopics.filter(
    (topic) =>
      topic.toLowerCase().includes(input.toLowerCase()) &&
      !selectedTopics.includes(topic)
  );

  const addTopic = (topic) => {
    if (!selectedTopics.includes(topic)) {
      setSelectedTopics([...selectedTopics, topic]);
    }

    setInput("");
  };

  const removeTopic = (topic) => {
    setSelectedTopics(
      selectedTopics.filter((selectedTopic) => selectedTopic !== topic)
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (filteredTopics.length > 0) {
        addTopic(filteredTopics[0]);
      }
    }
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
      </label>

      {/* Selected Topics */}

      {selectedTopics.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedTopics.map((topic) => (
            <span
              key={topic}
              className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
            >
              {topic}

              <button
                type="button"
                onClick={() => removeTopic(topic)}
                className="font-bold text-indigo-400 transition hover:text-indigo-700"
                aria-label={`Remove ${topic}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search Input */}

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />

        {/* Suggestions */}

        {input && filteredTopics.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-52 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
            {filteredTopics.slice(0, 6).map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => addTopic(topic)}
                className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
              >
                {topic}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Search and select from standardized SkillBridge topics.
      </p>
    </div>
  );
};

/* ---------------------------------------
   DASHBOARD
---------------------------------------- */

const Dashboard = () => {
  const [wantToLearn, setWantToLearn] = useState([]);
  const [canTeach, setCanTeach] = useState([]);

  const [connectedUsers, setConnectedUsers] = useState([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* ---------------------------------------
     POST REQUEST
  ---------------------------------------- */

  const handleSubmit = (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (wantToLearn.length === 0) {
      setError("Please select at least one topic you want to learn.");
      return;
    }

    if (canTeach.length === 0) {
      setError("Please select at least one topic you can teach.");
      return;
    }

    console.log({
      wantToLearn,
      canTeach,
    });

    setMessage("Your skill exchange request has been posted successfully.");
  };

  /* ---------------------------------------
     CONNECT
  ---------------------------------------- */

  const handleConnect = (userId) => {
    if (!connectedUsers.includes(userId)) {
      setConnectedUsers([...connectedUsers, userId]);
    }
  };

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
                    className="text-sm font-semibold text-indigo-600"
                  >
                    Topics
                  </Link>
      
                  <Link
                    to="/history"
                    className="text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
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
          WELCOME
      ====================================== */}

      <section className="mx-auto max-w-7xl px-6 pt-10">
        <div className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm md:p-12">
          <span className="mb-4 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700">
            Peer-to-Peer Academic Learning
          </span>

          <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
            Welcome back, Student!
          </h1>

          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Discover students who can teach what you want to learn while
            learning something valuable from you in return.
          </p>
        </div>
      </section>

      {/* =====================================
          MAIN CONTENT
      ====================================== */}

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[1.15fr_0.85fr]">
        {/* =====================================
            MATCHES
        ====================================== */}

        <section>
          <div className="mb-5">
            <span className="text-sm font-semibold text-indigo-600">
              Reciprocal Matching
            </span>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Available Skill Matches
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              These students offer skills you want while also being interested
              in skills you can teach.
            </p>
          </div>

          <div className="space-y-4">
            {availableMatches.map((peer) => {
              const requestSent = connectedUsers.includes(peer.id);

              return (
                <article
                  key={peer.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                >
                  {/* Student Information */}
                  <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">

                    {/* Avatar */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600">
                      {peer.avatar}
                    </div>

                    {/* Main Card Content */}
                    <div className="w-full min-w-0 flex-1">

                      {/* Name + Connect */}
                      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div className="text-center sm:text-left">
                          <h3 className="font-bold text-slate-900">
                            {peer.name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {peer.department} · Semester {peer.semester}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={requestSent}
                          onClick={() => handleConnect(peer.id)}
                          className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition sm:w-auto ${requestSent
                            ? "cursor-default border border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:scale-95"
                            }`}
                        >
                          {requestSent ? "Request Sent" : "Connect"}
                        </button>

                      </div>

                      {/* Reciprocal Exchange */}
                      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

                        {/* You Learn */}
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            You Learn
                          </p>

                          <p className="mt-1 font-semibold text-indigo-700">
                            {peer.learnFromPeer}
                          </p>
                        </div>

                        {/* You Teach */}
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            You Teach
                          </p>

                          <p className="mt-1 font-semibold text-slate-800">
                            {peer.teachPeer}
                          </p>
                        </div>

                      </div>

                      {/* Context */}
                      <div className="mt-4 text-center sm:text-left">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Context
                        </p>

                        <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-600 sm:mx-0">
                          {peer.bio}
                        </p>
                      </div>

                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* =====================================
            POST REQUEST
        ====================================== */}

        <section>
          <div className="mb-5">
            <span className="text-sm font-semibold text-indigo-600">
              Skill Exchange
            </span>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Post a Request
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Select what you want to learn and what you can teach in return.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            {/* Learn Topics */}

            <TopicSelector
              label="I want to learn"
              placeholder="Search topics..."
              selectedTopics={wantToLearn}
              setSelectedTopics={setWantToLearn}
            />

            <div className="my-6 border-t border-slate-200" />

            {/* Teach Topics */}

            <TopicSelector
              label="I can teach"
              placeholder="Search topics..."
              selectedTopics={canTeach}
              setSelectedTopics={setCanTeach}
            />

            {/* Error */}

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* Success */}

            {message && (
              <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {message}
              </div>
            )}

            {/* Post Button */}

            <button
              type="submit"
              className="mt-6 w-full rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-700 active:scale-[0.98]"
            >
              Post Request
            </button>
          </form>

          {/* Information */}

          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
            <p className="text-sm leading-6 text-indigo-900">
              <span className="font-semibold">How matching works:</span>{" "}
              SkillBridge looks for students who can teach your selected topics
              and want to learn topics that you can teach.
            </p>
          </div>
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

export default Dashboard;