import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchTags } from "../services/tagService";
import { fetchUserProfile, updateUserSkills } from "../services/userService";
import { fetchReciprocalMatches, sendMatchRequest } from "../services/matchService";
import { fetchNotifications } from "../services/notificationService";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import TagBadge from "../components/TagBadge";

/* ---------------------------------------
   STANDARDIZED TOPICS TAXONOMY
---------------------------------------- */
const defaultTopics = [
  "Data Structures",
  "Algorithms",
  "React",
  "Python",
  "C++",
  "Java",
  "Node.js",
  "Machine Learning",
  "Database Design",
  "Operating Systems",
  "Computer Networks",
  "C Programming",
  "SQL",
  "Artificial Intelligence",
  "Flutter",
  "JavaScript",
  "HTML & CSS",
  "Computer Architecture",
  "System Architecture",
];

const popularSuggestions = [
  "Algorithms",
  "Data Structures",
  "React",
  "Python",
  "C++",
  "Database Design",
  "Operating Systems",
];

/* ---------------------------------------
   REUSABLE RESPONSIVE TOPIC SELECTOR
---------------------------------------- */
const TopicSelector = ({
  label,
  type = "neutral", // "learn" | "teach"
  placeholder,
  selectedTopics,
  setSelectedTopics,
  availableTopics = [],
}) => {
  const [input, setInput] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef(null);

  const filteredTopics = availableTopics.filter(
    (topic) =>
      topic.toLowerCase().includes(input.toLowerCase()) &&
      !selectedTopics.includes(topic)
  );

  const addTopic = (topic) => {
    const cleanTopic = topic.trim();
    if (cleanTopic && !selectedTopics.includes(cleanTopic)) {
      setSelectedTopics([...selectedTopics, cleanTopic]);
    }
    setInput("");
    setIsDropdownOpen(false);
  };

  const removeTopic = (topic) => {
    setSelectedTopics(selectedTopics.filter((t) => t !== topic));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredTopics.length > 0) {
        addTopic(filteredTopics[0]);
      } else if (input.trim()) {
        addTopic(input.trim());
      }
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
          {label}
        </label>
        {selectedTopics.length > 0 && (
          <span className="text-[11px] font-semibold text-slate-500">
            {selectedTopics.length} selected
          </span>
        )}
      </div>

      {/* Selected Topics Badges */}
      {selectedTopics.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
          {selectedTopics.map((topic) => (
            <TagBadge
              key={topic}
              tag={topic}
              type={type}
              onRemove={() => removeTopic(topic)}
            />
          ))}
        </div>
      ) : (
        <div className="mb-2.5 text-xs text-slate-400 italic">
          No topics selected yet. Pick from popular or type below.
        </div>
      )}

      {/* Search / Input Field */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onFocus={() => setIsDropdownOpen(true)}
          onChange={(e) => {
            setInput(e.target.value);
            setIsDropdownOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
        />

        {input && (
          <button
            type="button"
            onClick={() => addTopic(input)}
            className="absolute right-2 top-2 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Add
          </button>
        )}

        {/* Suggestions Dropdown */}
        {isDropdownOpen && input && filteredTopics.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-fade-in">
            {filteredTopics.slice(0, 8).map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => addTopic(topic)}
                className="w-full text-left px-3 py-2 text-xs sm:text-sm font-medium rounded-lg text-slate-800 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center justify-between"
              >
                <span>{topic}</span>
                <span className="text-[11px] text-indigo-500 font-semibold">+ Add</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Add Chips */}
      <div className="mt-2.5">
        <span className="text-[11px] font-medium text-slate-500 block mb-1">
          Quick suggestions:
        </span>
        <div className="flex flex-wrap gap-1">
          {popularSuggestions
            .filter((s) => !selectedTopics.includes(s))
            .slice(0, 5)
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addTopic(s)}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors cursor-pointer"
              >
                + {s}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------
   DASHBOARD COMPONENT
---------------------------------------- */
const Dashboard = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [allTopics, setAllTopics] = useState(defaultTopics);

  const [wantToLearn, setWantToLearn] = useState([]);
  const [canTeach, setCanTeach] = useState([]);

  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [connectingUserId, setConnectingUserId] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const formSectionRef = useRef(null);

  const loadMatches = useCallback(async () => {
    setLoadingMatches(true);
    try {
      const matchSuggestions = await fetchReciprocalMatches();
      setMatches(matchSuggestions || []);
    } catch (err) {
      console.error("Failed to load reciprocal matches:", err);
    } finally {
      setLoadingMatches(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        // Fetch topics
        try {
          const tags = await fetchTags();
          if (tags && tags.length > 0 && isMounted) {
            setAllTopics(tags.map((t) => t.name));
          }
        } catch (e) {
          console.warn("Using fallback topic taxonomy", e);
        }

        // Fetch User Profile
        try {
          const user = await fetchUserProfile();
          if (user && isMounted) {
            setCurrentUser(user);
            if (user.weakTags && user.weakTags.length > 0) {
              setWantToLearn(user.weakTags.map((t) => t.name || t));
            }
            if (user.strongTags && user.strongTags.length > 0) {
              setCanTeach(user.strongTags.map((t) => t.name || t));
            }
          }
        } catch {
          navigate("/login");
          return;
        }

        // Fetch matches
        if (isMounted) {
          await loadMatches();
        }

        // Fetch unread notifications count
        try {
          const notifs = await fetchNotifications();
          if (isMounted) {
            setUnreadCount(notifs.unreadCount || 0);
          }
        } catch (e) {
          console.warn("Failed to fetch notification count", e);
        }
      } catch (err) {
        console.error("Dashboard initialization error:", err);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [navigate, loadMatches]);

  /* ---------------------------------------
     UPDATE SKILLS & RECALCULATE MATCHES
  ---------------------------------------- */
  const handleSubmit = async (e) => {
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

    setSubmitting(true);
    try {
      await updateUserSkills({ wantToLearn, canTeach });
      setMessage("Your skills request is active! Reciprocal campus matches have been updated.");
      await loadMatches();
    } catch (err) {
      setError(err.message || "Failed to update skills. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------------------
     CONNECT WITH PEER
  ---------------------------------------- */
  const handleConnect = async (peerId) => {
    setError("");
    setConnectingUserId(peerId);

    try {
      await sendMatchRequest(peerId);
      setConnectedUsers((prev) => [...prev, peerId]);
      
      // Update local match state immediately
      setMatches((prev) =>
        prev.map((m) =>
          m.id === peerId ? { ...m, connectionStatus: "pending" } : m
        )
      );

      setMessage("Bridge connection invite sent successfully!");
    } catch (err) {
      setError(err.message || "Failed to send connection request.");
    } finally {
      setConnectingUserId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-10">
      {/* Responsive Navbar */}
      <Navbar unreadCount={unreadCount} />

      {/* =====================================
          HERO BANNER
      ====================================== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-10 text-center shadow-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-bold text-indigo-800">
            <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            AUST Reciprocal Peer Knowledge Sharing
          </span>

          <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-950">
            Welcome back, {currentUser?.fullName || authUser?.fullName || "Student"}!
          </h1>

          <p className="mt-2 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-slate-600">
            Find peers who can teach what you need while you help them master topics you excel at. Balanced knowledge trade without fees.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                formSectionRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              Update your learning goals ↓
            </button>
          </div>
        </div>
      </section>

      {/* System alert messages */}
      {(message || error) && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-4">
          {message && (
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm font-medium text-emerald-800 animate-fade-in shadow-2xs">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                <span>{message}</span>
              </div>
              <button
                type="button"
                onClick={() => setMessage("")}
                className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 text-base"
              >
                ×
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs sm:text-sm font-medium text-rose-800 animate-fade-in shadow-2xs">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-rose-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-rose-700 hover:text-rose-950 font-bold ml-2 text-base"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}

      {/* =====================================
          MAIN CONTENT (2 COLUMNS ON DESKTOP, RESPONSIVE STACK ON MOBILE/PAD)
      ====================================== */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 py-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* =====================================
            LEFT: RECIPROCAL MATCHES
        ====================================== */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Matching Algorithm
              </span>
              <h2 className="mt-0.5 text-xl sm:text-2xl font-extrabold text-slate-950">
                Available Skill Matches
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {matches.length} peer{matches.length === 1 ? "" : "s"} with mutual exchange
            </span>
          </div>

          {loadingMatches ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-2xs">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
              <p className="text-sm font-medium">Finding reciprocal peers across your university...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 sm:p-12 text-center shadow-2xs">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-2xl font-bold">
                ⇄
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                No reciprocal matches found yet
              </h3>
              <p className="mt-1.5 max-w-md mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed">
                Add more subjects you want to learn or can teach in the <strong>Post a Request</strong> section on the right. Once a peer needs what you teach and has what you want, they will show up here automatically!
              </p>
              <button
                type="button"
                onClick={() => {
                  formSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition"
              >
                Update Skills on Right →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((peer) => {
                const isRequested =
                  connectedUsers.includes(peer.id) ||
                  peer.connectionStatus === "pending";
                const isAccepted = peer.connectionStatus === "accepted";
                const isConnecting = connectingUserId === peer.id;

                return (
                  <article
                    key={peer.id}
                    className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-md"
                  >
                    {/* Header: Avatar, Name, Department & Connect Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-700 border border-indigo-100 shadow-2xs">
                          {peer.avatar || peer.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-slate-950 truncate">
                            {peer.name}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">
                            {peer.department} · Semester {peer.semester}
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="w-full sm:w-auto">
                        {isAccepted ? (
                          <Link
                            to="/chat"
                            className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-1.074-.85 9.948 9.948 0 011.026-2.569C4.08 16.273 3 14.264 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                            </svg>
                            Message
                          </Link>
                        ) : (
                          <button
                            type="button"
                            disabled={isRequested || isConnecting}
                            onClick={() => handleConnect(peer.id)}
                            className={`w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer ${
                              isRequested
                                ? "cursor-default border border-emerald-200 bg-emerald-50 text-emerald-800"
                                : "bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 disabled:opacity-60"
                            }`}
                          >
                            {isConnecting ? (
                              "Connecting..."
                            ) : isRequested ? (
                              <>
                                <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Request Sent
                              </>
                            ) : (
                              <>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.765z" />
                                </svg>
                                Connect
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Reciprocal Exchange Boxes (Responsive 1-col on mobile, 2-col on tablet/desktop) */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* You Learn From Peer */}
                      <div className="rounded-xl border border-teal-200/80 bg-teal-50/50 p-3.5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-white text-[10px] font-bold">
                              ↓
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900">
                              You Learn From {peer.name.split(" ")[0]}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {(peer.learnFromPeerTags || (peer.learnFromPeer ? peer.learnFromPeer.split(", ") : [])).map((t, idx) => (
                              <TagBadge key={idx} tag={t} type="learn" size="sm" />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* You Teach Peer */}
                      <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-3.5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                              ↑
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900">
                              You Teach {peer.name.split(" ")[0]}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {(peer.teachPeerTags || (peer.teachPeer ? peer.teachPeer.split(", ") : [])).map((t, idx) => (
                              <TagBadge key={idx} tag={t} type="teach" size="sm" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bio / Study Context */}
                    {peer.bio && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          <span className="font-semibold text-slate-700">About:</span> {peer.bio}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* =====================================
            RIGHT: POST / UPDATE SKILL EXCHANGE
        ====================================== */}
        <section ref={formSectionRef} className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              Exchange Inventory
            </span>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-extrabold text-slate-950">
              Post a Request
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Update what you want to learn and what you can teach to trigger matches.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-6"
          >
            {/* Learn Topics (Weak Tags) */}
            <TopicSelector
              label="I want to learn (My Target Skills)"
              type="learn"
              placeholder="Type topic (e.g. React, Algorithms)..."
              selectedTopics={wantToLearn}
              setSelectedTopics={setWantToLearn}
              availableTopics={allTopics}
            />

            <div className="border-t border-slate-200/80" />

            {/* Teach Topics (Strong Tags) */}
            <TopicSelector
              label="I can teach (My Strengths)"
              type="teach"
              placeholder="Type topic (e.g. C++, Python, SQL)..."
              selectedTopics={canTeach}
              setSelectedTopics={setCanTeach}
              availableTopics={allTopics}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving & Matching...
                </>
              ) : (
                <>
                  <span>Save Skills & Discover Matches</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Reciprocity Information Box */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
            <div className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold mt-0.5">
                i
              </span>
              <div className="text-xs leading-relaxed text-indigo-950">
                <p className="font-bold mb-0.5">How SkillBridge matching works:</p>
                <p>
                  Our engine matches student pairs with mutual reciprocity (Cycle of 2). You only match with peers who teach what you want to learn AND want to learn what you can teach.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav unreadCount={unreadCount} />
    </div>
  );
};

export default Dashboard;