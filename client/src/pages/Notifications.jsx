import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService";
import { acceptMatchRequest, declineMatchRequest } from "../services/matchService";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [successToast, setSuccessToast] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications();
        if (isMounted) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
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
    setProcessingId(notification.id);
    setSuccessToast("");

    try {
      if (notification.matchId) {
        await acceptMatchRequest(notification.matchId);
      }
      await markOneRead(notification.id);
      
      // Update local card state to accepted
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? {
                ...n,
                type: "accepted",
                read: true,
                message: `accepted study exchange. You are now connected!`,
              }
            : n
        )
      );
      setSuccessToast(`You and ${notification.name} are now connected! You can start chatting.`);
    } catch (err) {
      console.error("Failed to accept match request:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (notification) => {
    setProcessingId(notification.id);

    try {
      if (notification.matchId) {
        await declineMatchRequest(notification.matchId);
      }
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    } catch (err) {
      console.error("Failed to decline match request:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "invite", label: "Invites" },
    { key: "accepted", label: "Accepted" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-12">
      {/* Responsive Navbar */}
      <Navbar unreadCount={unreadCount} />

      {/* Header Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-10 text-center shadow-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-bold text-indigo-800">
            Inbox & Alerts
          </span>

          <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-950">
            Notifications
          </h1>

          <p className="mt-2 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-slate-600">
            Track connection requests, match invitations, and updates from your study partners across campus.
          </p>
        </div>
      </section>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-4">
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm font-medium text-emerald-800 animate-fade-in shadow-2xs">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              <span>{successToast}</span>
            </div>
            <Link
              to="/chat"
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline ml-2"
            >
              Open Chat →
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <section>
          {/* Header controls & Filter row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950">
                Recent Activity
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
                  : "All caught up with peer notifications."}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="self-start sm:self-auto cursor-pointer rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-400 active:scale-95 transition"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`cursor-pointer rounded-full px-3.5 py-1 text-xs font-bold transition-all shadow-2xs ${
                  filter === f.key
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="mt-5 space-y-3.5">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-2xs">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
                <p className="text-sm font-medium">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 sm:p-14 text-center shadow-2xs">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-2xl font-bold">
                  🔔
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  No notifications in this filter
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  When other students request to exchange skills with you or accept your requests, they will show up here.
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const isProcessing = processingId === n.id;

                return (
                  <article
                    key={n.id}
                    onClick={() => !n.read && markOneRead(n.id)}
                    className={`rounded-2xl border p-4 sm:p-5 shadow-2xs transition-all ${
                      n.read
                        ? "border-slate-200 bg-white hover:border-slate-300"
                        : "border-indigo-200 bg-indigo-50/40 hover:border-indigo-300 hover:bg-indigo-50/60"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-base font-bold text-indigo-700 border border-indigo-200/70 shadow-2xs">
                          {n.avatar}
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white ${
                            n.type === "accepted" ? "bg-emerald-500" : "bg-indigo-600"
                          }`}
                        >
                          {n.type === "accepted" ? "✓" : "+"}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <p className="text-xs sm:text-sm text-slate-800 leading-snug">
                            <strong className="text-slate-950 font-bold">{n.name}</strong>{" "}
                            {n.message}
                          </p>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-medium text-slate-400">
                              {n.time}
                            </span>
                            {!n.read && (
                              <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                            )}
                          </div>
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                          <span>{n.department}</span>
                        </div>

                        {/* Interactive Action Buttons */}
                        {n.type === "invite" && (
                          <div className="mt-3.5 flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAccept(n);
                              }}
                              className="cursor-pointer inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 active:scale-95 transition disabled:opacity-60"
                            >
                              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {isProcessing ? "Accepting..." : "Accept Bridge"}
                            </button>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDecline(n);
                              }}
                              className="cursor-pointer rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-400 active:scale-95 transition"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {n.type === "accepted" && (
                          <div className="mt-3">
                            <Link
                              to="/chat"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition shadow-2xs"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-1.074-.85 9.948 9.948 0 011.026-2.569C4.08 16.273 3 14.264 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                              </svg>
                              Message {n.name.split(" ")[0]}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav unreadCount={unreadCount} />
    </div>
  );
};

export default Notifications;
