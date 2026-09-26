import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchConversations, fetchMessages, sendChatMessage } from "../services/chatService";
import { fetchNotifications } from "../services/notificationService";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";


// Helper to format date header (Today, Yesterday, or formatted date)
const formatDateLabel = (dateString) => {
  if (!dateString) return "Earlier";
  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

// URL linkifier helper for meeting links & resources
const renderMessageContent = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      const isMeet = part.includes("meet.google.com") || part.includes("meet.jit.si") || part.includes("zoom.us");
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 font-semibold underline underline-offset-2 break-all transition ${
            isMeet ? "text-amber-300 hover:text-white" : "text-indigo-200 hover:text-white"
          }`}
        >
          {isMeet && (
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
          {part}
        </a>
      );
    }
    return part;
  });
};

const Chat = () => {
  const [searchParams] = useSearchParams();
  const peerIdParam = searchParams.get("peerId");
  const matchIdParam = searchParams.get("matchId");

  const [conversations, setConversations] = useState([]);
  const [activeContactId, setActiveContactId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'unread'
  const [draft, setDraft] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  // Load conversations and notifications
  useEffect(() => {
    let isMounted = true;

    const loadChatData = async () => {
      try {
        const convos = await fetchConversations();
        if (!isMounted) return;

        setConversations(convos || []);

        // URL param matching: prioritize peerId or matchId from navigation
        let targetConvoId = null;
        if (peerIdParam) {
          const matchByPeer = convos?.find(
            (c) => c.peerId === peerIdParam || c.id === peerIdParam
          );
          if (matchByPeer) targetConvoId = matchByPeer.id;
        } else if (matchIdParam) {
          const matchById = convos?.find((c) => c.id === matchIdParam);
          if (matchById) targetConvoId = matchById.id;
        }

        if (targetConvoId) {
          setActiveContactId(targetConvoId);
        } else if (!activeContactId && convos && convos.length > 0) {
          // On desktop, auto-select first conversation
          if (window.innerWidth >= 768) {
            setActiveContactId(convos[0].id);
          }
        }

        const notifs = await fetchNotifications();
        if (isMounted) {
          setUnreadCount(notifs.unreadCount || 0);
        }
      } catch (err) {
        console.error("Failed to load chat conversations:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadChatData();

    return () => {
      isMounted = false;
    };
  }, [peerIdParam, matchIdParam]);

  // Load active messages + periodic polling
  useEffect(() => {
    if (!activeContactId) return;

    let isSubscribed = true;

    const loadActiveMessages = async () => {
      try {
        const msgs = await fetchMessages(activeContactId);
        if (isSubscribed) {
          setActiveMessages(msgs || []);
        }
      } catch (err) {
        console.error("Failed to load conversation messages:", err);
      }
    };

    loadActiveMessages();

    const interval = setInterval(loadActiveMessages, 3500);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [activeContactId]);

  // Only scroll down when switching to a different conversation
  useEffect(() => {
    if (activeContactId && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeContactId]);

  const activeContact = useMemo(
    () => conversations.find((c) => c.id === activeContactId),
    [conversations, activeContactId]
  );

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return conversations.filter((c) => {
      const matchesSearch =
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.department?.toLowerCase().includes(search.toLowerCase()) ||
        c.lastMessage?.toLowerCase().includes(search.toLowerCase());

      if (filterType === "unread") {
        return matchesSearch && (c.unread || 0) > 0;
      }
      return matchesSearch;
    });
  }, [conversations, search, filterType]);

  const unreadTotal = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unread || 0), 0);
  }, [conversations]);

  const handleSelectContact = (id) => {
    setActiveContactId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const text = draft.trim();
    if (!text || !activeContactId || sending) return;

    setSending(true);
    setDraft("");

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      from: "me",
      text,
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setActiveMessages((prev) => [...prev, optimisticMessage]);

    // Smoothly scroll down on user send
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);

    try {
      const savedMsg = await sendChatMessage(activeContactId, text);
      setActiveMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? savedMsg : msg))
      );

      // Update conversations preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeContactId
            ? {
                ...c,
                lastMessage: text,
                lastMessageTime: savedMsg.time || "Just now",
              }
            : c
        )
      );
    } catch (err) {
      console.error("Failed to send chat message:", err);
      // Remove optimistic message on error
      setActiveMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    } finally {
      setSending(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-100 text-slate-900 overflow-hidden font-sans">
      {/* Top Main Navigation */}
      <Navbar unreadCount={unreadCount} />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 overflow-hidden p-0 sm:p-3 lg:p-4 mx-auto w-full max-w-7xl">
        <div className="flex w-full flex-1 overflow-hidden rounded-none sm:rounded-2xl border-0 sm:border border-slate-200/90 bg-white shadow-sm">
          {/* =====================================
              1. CONTACTS & CONVERSATIONS SIDEBAR
          ====================================== */}
          <aside
            className={`${
              activeContactId ? "hidden md:flex" : "flex"
            } w-full flex-col border-r border-slate-200 md:w-80 lg:w-96 shrink-0 bg-white select-none`}
          >
            {/* Sidebar Top Header */}
            <div className="border-b border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-extrabold text-slate-950 tracking-tight">
                    Messages
                  </h1>
                  <span className="flex h-5 items-center justify-center rounded-full bg-indigo-50 border border-indigo-200/80 px-2 text-[11px] font-bold text-indigo-700">
                    {conversations.length}
                  </span>
                </div>

                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                  title="Find more peers on the Topics Dashboard"
                >
                  <span>+ Find Peers</span>
                </Link>
              </div>

              {/* Search Bar */}
              <div className="relative mt-3">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search students, topics..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-8 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
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
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="mt-2.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setFilterType("all")}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                    filterType === "all"
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  All ({conversations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("unread")}
                  className={`cursor-pointer flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                    filterType === "unread"
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  <span>Unread</span>
                  {unreadTotal > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                      {unreadTotal}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-3">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                  <p>Loading your study channels...</p>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  {conversations.length === 0 ? (
                    <div className="space-y-4 py-8">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-2xl font-bold shadow-2xs">
                        💬
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">No Active Chats Yet</p>
                        <p className="text-slate-500 leading-relaxed max-w-xs mx-auto mt-1">
                          When you match with study peers on Topics or accept requests in Notifications, your chat channels appear here.
                        </p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="inline-block rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 transition active:scale-95"
                      >
                        Explore Skill Matches →
                      </Link>
                    </div>
                  ) : (
                    <div className="py-8">
                      <p className="font-medium text-slate-600">No chats found</p>
                      <p className="text-[11px] text-slate-400 mt-1">Try another search term or reset filter.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setFilterType("all");
                        }}
                        className="cursor-pointer mt-3 text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        Reset filters
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const isActive = contact.id === activeContactId;
                  const hasUnread = (contact.unread || 0) > 0;

                  return (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => handleSelectContact(contact.id)}
                      className={`group flex w-full items-center gap-3 p-3.5 text-left transition-all cursor-pointer relative ${
                        isActive
                          ? "bg-indigo-50/70 border-l-4 border-indigo-600 pl-2.5"
                          : "hover:bg-slate-50/90 active:bg-slate-100"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-100 to-indigo-50 text-sm font-bold text-indigo-700 border border-indigo-200/60 shadow-2xs group-hover:scale-102 transition-transform">
                          {contact.avatar || contact.name?.charAt(0)}
                        </div>
                      </div>

                      {/* Info & Snippet */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-xs sm:text-sm font-bold text-slate-900">
                            {contact.name}
                          </p>
                          <span className="text-[10px] font-medium text-slate-400 shrink-0 ml-1">
                            {contact.lastMessageTime}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                            {contact.department || "CSE"} · {contact.semester || "2.2"}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p
                            className={`truncate text-xs ${
                              hasUnread
                                ? "font-bold text-indigo-900"
                                : "text-slate-500"
                            }`}
                          >
                            {contact.lastMessage}
                          </p>

                          {hasUnread && (
                            <span className="flex h-4.5 min-w-4.5 px-1.5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shrink-0 animate-fade-in">
                              {contact.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* =====================================
              2. ACTIVE CONVERSATION THREAD
          ====================================== */}
          <section
            className={`${
              activeContactId ? "flex" : "hidden md:flex"
            } min-w-0 flex-1 flex-col bg-white h-full relative`}
          >
            {activeContact ? (
              <>
                {/* Thread Header Bar (Clean - No Online Status, No Start Call Button) */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 bg-white/95 backdrop-blur-xs z-10">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile Back Button */}
                    <button
                      type="button"
                      onClick={() => setActiveContactId(null)}
                      className="-ml-1 flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition md:hidden cursor-pointer"
                      aria-label="Back to contacts list"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <div className="relative shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-base font-bold text-indigo-700 border border-indigo-100 shadow-2xs">
                        {activeContact.avatar || activeContact.name?.charAt(0)}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-bold text-slate-950">
                        {activeContact.name}
                      </h2>
                      <p className="text-[11px] font-medium text-slate-500 truncate">
                        {activeContact.department} · Semester {activeContact.semester} · {activeContact.institution || "AUST"}
                      </p>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-1.5">
                    {/* Toggle Partner Details Drawer */}
                    <button
                      type="button"
                      onClick={() => setShowDetailsDrawer((prev) => !prev)}
                      className={`cursor-pointer flex h-8 w-8 items-center justify-center rounded-xl border transition shadow-2xs ${
                        showDetailsDrawer
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                      title="Toggle Academic Partner Details"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Messages Stream */}
                <div
                  ref={scrollRef}
                  className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-4 sm:p-5"
                >
                  {activeMessages.length === 0 ? (
                    <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center p-6 space-y-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-2xl font-bold shadow-2xs">
                        👋
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Say hello to {activeContact.name.split(" ")[0]}!
                        </h3>
                        <p className="max-w-xs text-xs text-slate-500 mt-1 leading-relaxed">
                          Coordinate topics, share course notes, or agree on a study session time.
                        </p>
                      </div>
                    </div>
                  ) : (
                    activeMessages.map((msg, index) => {
                      const isMe = msg.from === "me";
                      const prevMsg = index > 0 ? activeMessages[index - 1] : null;
                      const nextMsg = index < activeMessages.length - 1 ? activeMessages[index + 1] : null;

                      // Consecutive message detection
                      const isFirstInSequence = !prevMsg || prevMsg.from !== msg.from;
                      const isLastInSequence = !nextMsg || nextMsg.from !== msg.from;

                      // Date separation check
                      const showDateHeader =
                        !prevMsg ||
                        formatDateLabel(prevMsg.createdAt) !==
                          formatDateLabel(msg.createdAt);

                      return (
                        <div key={msg.id || index} className="space-y-1">
                          {/* Date Header Separator */}
                          {showDateHeader && (
                            <div className="relative my-4 flex items-center justify-center">
                              <span className="rounded-full bg-slate-200/80 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 shadow-2xs">
                                {formatDateLabel(msg.createdAt)}
                              </span>
                            </div>
                          )}

                          {/* Message Row */}
                          <div
                            className={`relative flex items-end gap-2 ${
                              isMe ? "justify-end" : "justify-start"
                            }`}
                          >
                            {/* Profile icon beside peer's text: only shown beside the latest (last) chat of consecutive messages */}
                            {!isMe && (
                              <div className="h-7 w-7 shrink-0">
                                {isLastInSequence ? (
                                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700 shadow-2xs">
                                    {activeContact.avatar || activeContact.name?.charAt(0)}
                                  </div>
                                ) : (
                                  <div className="h-7 w-7" />
                                )}
                              </div>
                            )}

                            <div
                              className={`flex flex-col ${
                                isMe ? "items-end" : "items-start"
                              } max-w-[85%] sm:max-w-[75%]`}
                            >
                              {/* Sender name: mentioned only once above the first of consecutive messages */}
                              {!isMe && isFirstInSequence && (
                                <span className="mb-1 text-[11px] font-semibold text-slate-500 pl-1">
                                  {activeContact.name.split(" ")[0]}
                                </span>
                              )}

                              <div
                                className={`rounded-2xl px-4 py-2 text-xs sm:text-sm leading-relaxed break-words shadow-2xs ${
                                  isMe
                                    ? "rounded-br-xs bg-indigo-600 text-white font-normal"
                                    : "rounded-bl-xs border border-slate-200/90 bg-white text-slate-900 font-normal"
                                }`}
                              >
                                {renderMessageContent(msg.text)}
                              </div>

                              {isMe && msg.pending && (
                                <span className="mt-0.5 px-1 text-[10px] text-slate-400 italic">
                                  Sending...
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input Form */}
                <form
                  onSubmit={handleSend}
                  className="flex shrink-0 items-end gap-2 border-t border-slate-200 bg-white p-3 sm:p-4"
                >
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Message ${activeContact.name?.split(" ")[0]} (Enter to send, Shift+Enter for new line)...`}
                      className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50/80 px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 max-h-32"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!draft.trim() || sending}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs transition hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer"
                    aria-label="Send message"
                  >
                    {sending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.94 2.94a1.5 1.5 0 0 1 1.61-.34l13 5a1.5 1.5 0 0 1 0 2.8l-13 5a1.5 1.5 0 0 1-2-1.83L3.8 10 1.55 4.77a1.5 1.5 0 0 1 .39-1.83Z" />
                      </svg>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* No Conversation Selected Placeholder */
              <div className="flex flex-1 flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-3xl font-bold text-indigo-600 shadow-sm">
                  💬
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Select a Study Channel
                  </h3>
                  <p className="max-w-xs text-xs sm:text-sm text-slate-500 leading-relaxed mt-1">
                    Choose a student from the sidebar to review mutual topics, coordinate study meetings, and share resources.
                  </p>
                </div>
                <Link
                  to="/dashboard"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 transition"
                >
                  Browse Topics & Match →
                </Link>
              </div>
            )}
          </section>

          {/* =====================================
              3. STUDY PARTNER DETAILS DRAWER (RIGHT PANE)
          ====================================== */}
          {activeContact && showDetailsDrawer && (
            <aside className="w-80 shrink-0 border-l border-slate-200 bg-white flex flex-col overflow-y-auto animate-fade-in p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Study Partner Info</h3>
                <button
                  type="button"
                  onClick={() => setShowDetailsDrawer(false)}
                  className="cursor-pointer text-slate-400 hover:text-slate-600 text-base font-bold"
                  aria-label="Close details"
                >
                  ×
                </button>
              </div>

              {/* Profile Card */}
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-2xl font-extrabold text-white shadow-md ring-4 ring-indigo-50">
                  {activeContact.avatar || activeContact.name?.charAt(0)}
                </div>
                <h4 className="font-bold text-slate-900 text-base">
                  {activeContact.name}
                </h4>
                <p className="text-xs text-indigo-600 font-semibold">
                  {activeContact.department} · Semester {activeContact.semester}
                </p>
                <p className="text-[11px] text-slate-400">
                  {activeContact.institution || "Ahsanullah University of Science and Technology"}
                </p>
              </div>

              {/* Mutual Skills Grid */}
              <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    They Teach You
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {activeContact.strongTags && activeContact.strongTags.length > 0 ? (
                      activeContact.strongTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No strong topics listed</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-200/60 pt-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    You Teach Them
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {activeContact.weakTags && activeContact.weakTags.length > 0 ? (
                      activeContact.weakTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-800"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No learning topics listed</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Academic Bio
                </h5>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {activeContact.bio || "No academic bio provided yet."}
                </p>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Study Channels
                </h5>

                {activeContact.email && (
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs">
                    <span className="text-slate-500 truncate mr-2">{activeContact.email}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(activeContact.email);
                        alert("Email copied to clipboard!");
                      }}
                      className="cursor-pointer text-[10px] font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav unreadCount={unreadCount} />
    </div>
  );
};

export default Chat;
