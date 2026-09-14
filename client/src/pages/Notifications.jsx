import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService";
import { acceptMatchRequest, declineMatchRequest } from "../services/matchService";
import { useAuth } from "../context/AuthContext";

const Notification = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const markAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const markOneRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const handleAccept = async (notification) => {
    try {
      if (notification.matchId) {
        await acceptMatchRequest(notification.matchId);
      }
      await markOneRead(notification.id);
      // Reload notifications to see updated state
      await loadNotifications();
    } catch (err) {
      console.error("Failed to accept match request:", err);
    }
  };

  const handleDecline = async (notification) => {
    try {
      if (notification.matchId) {
        await declineMatchRequest(notification.matchId);
      }
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    } catch (err) {
      console.error("Failed to decline match request:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "invite", label: "Invites" },
    { key: "accepted", label: "Accepted" },
  ];

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
            {/* Notification Bell (Active on this page) */}
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border-2 border-indigo-600 bg-white text-indigo-600 shadow-sm transition hover:bg-indigo-50 active:scale-95"
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 8a6 6 0 0 1 12 0c0 3.5 1 5 1.5 6H4.5C5 13 6 11.5 6 8Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 17a2.5 2.5 0 0 0 5 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="cursor-pointer whitespace-nowrap rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 active:scale-95 sm:px-4 sm:py-2 sm:text-sm"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* =====================================
          WELCOME / BANNER
      ====================================== */}
      <section className="mx-auto max-w-7xl px-6 pt-10">
        <div className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm md:p-12">
          <span className="mb-4 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700">
            Stay Updated
          </span>

          <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
            Notifications
          </h1>

          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Track connection acceptances and incoming academic exchange invites from other students.
          </p>
        </div>
      </section>

      {/* =====================================
          MAIN CONTENT
      ====================================== */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        <section>
          <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            {/* Heading */}
            <div>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                Recent Notifications
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
                  : "You're all caught up."}
              </p>
            </div>

            {/* Mark all read */}
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="cursor-pointer w-full whitespace-nowrap rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 active:scale-95 md:w-auto"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  filter === f.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Notification List */}
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              Loading notifications...
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((n) => (
                <article
                  key={n.id}
                  onClick={() => markOneRead(n.id)}
                  className={`cursor-pointer rounded-xl border p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    n.read
                      ? "border-slate-200 bg-white"
                      : "border-indigo-200 bg-indigo-50/40 hover:border-indigo-300"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600">
                        {n.avatar}
                      </div>

                      {/* Type badge */}
                      <div
                        className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white ${
                          n.type === "accepted" ? "bg-emerald-500" : "bg-indigo-600"
                        }`}
                      >
                        {n.type === "accepted" ? "✓" : "+"}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm leading-6 text-slate-700">
                          <span className="font-bold text-slate-900">{n.name}</span>{" "}
                          {n.message}
                        </p>

                        {!n.read && (
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-600" />
                        )}
                      </div>

                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {n.department}
                        </span>
                        <span className="text-xs text-slate-300">·</span>
                        <span className="text-xs text-slate-400">{n.time}</span>
                      </div>

                      {/* Actions for invites */}
                      {n.type === "invite" && (
                        <div className="mt-4 flex gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAccept(n);
                            }}
                            className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDecline(n);
                            }}
                            className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
                          >
                            Decline
                          </button>
                        </div>
                      )}

                      {/* Action for accepted */}
                      {n.type === "accepted" && (
                        <div className="mt-4">
                          <Link
                            to="/chat"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-block rounded-lg border border-indigo-200 bg-white px-4 py-2 text-xs font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 active:scale-95"
                          >
                            Message {n.name.split(" ")[0]}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredNotifications.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl font-bold text-indigo-600">
                🔔
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                No notifications here
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Nothing to show in this filter right now.
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

export default Notification;
