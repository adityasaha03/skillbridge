import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchConversations, fetchMessages, sendChatMessage } from "../services/chatService";
import { fetchNotifications } from "../services/notificationService";
import { logoutUser } from "../services/authService";

const Chat = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeContactId, setActiveContactId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  // Load conversations on mount
  useEffect(() => {
    const loadChatData = async () => {
      try {
        const convos = await fetchConversations();
        setConversations(convos);
        if (convos.length > 0 && !activeContactId) {
          setActiveContactId(convos[0].id);
        }

        const notifs = await fetchNotifications();
        setUnreadCount(notifs.unreadCount || 0);
      } catch (err) {
        console.error("Failed to load chat conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadChatData();
  }, []);

  // Load messages when activeContactId changes
  useEffect(() => {
    if (!activeContactId) return;

    let isSubscribed = true;

    const loadActiveMessages = async () => {
      try {
        const msgs = await fetchMessages(activeContactId);
        if (isSubscribed) {
          setActiveMessages(msgs);
        }
      } catch (err) {
        console.error("Failed to load conversation messages:", err);
      }
    };

    loadActiveMessages();

    // Polling every 5 seconds for new messages in active chat
    const interval = setInterval(loadActiveMessages, 5000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [activeContactId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeContactId, activeMessages.length]);

  const activeContact = conversations.find((c) => c.id === activeContactId);

  const filteredContacts = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectContact = (id) => {
    setActiveContactId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !activeContactId) return;

    setDraft("");

    try {
      const savedMsg = await sendChatMessage(activeContactId, text);
      setActiveMessages((prev) => [...prev, savedMsg]);

      // Update conversation list preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeContactId
            ? {
                ...c,
                lastMessage: text,
                lastMessageTime: savedMsg.time,
              }
            : c
        )
      );
    } catch (err) {
      console.error("Failed to send chat message:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      navigate("/login");
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50 text-slate-900">
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
              className="text-sm font-semibold text-indigo-600"
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
            {/* Notification Bell */}
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-600 bg-white text-indigo-600 shadow-sm transition hover:bg-indigo-50 active:scale-95"
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
          MAIN CHAT SHELL
      ====================================== */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-0 overflow-hidden px-0 py-0 sm:px-6 sm:py-6">
        <div className="flex w-full overflow-hidden rounded-none border-0 border-slate-200 bg-white shadow-none sm:rounded-2xl sm:border sm:shadow-sm">
          {/* =====================================
              CONTACTS SIDEBAR
          ====================================== */}
          <aside
            className={`${
              activeContactId ? "hidden md:flex" : "flex"
            } w-full flex-col border-r border-slate-200 md:w-80 lg:w-96`}
          >
            {/* Sidebar Header */}
            <div className="border-b border-slate-200 p-4">
              <h1 className="text-lg font-bold text-slate-950">Study Messages</h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Connected study exchange partners
              </p>

              {/* Search */}
              <div className="relative mt-3">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search connected peers..."
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {loading ? (
                <div className="p-6 text-center text-xs text-slate-400">Loading chats...</div>
              ) : filteredContacts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  {conversations.length === 0 ? (
                    <div>
                      <p className="font-semibold text-slate-700">No active study bridges yet</p>
                      <p className="mt-1 text-slate-400">
                        Connect with reciprocal peers on the Topics Dashboard or accept pending invites in Notifications!
                      </p>
                    </div>
                  ) : (
                    "No matching contacts found."
                  )}
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const isActive = contact.id === activeContactId;

                  return (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => handleSelectContact(contact.id)}
                      className={`flex w-full items-center gap-3 p-4 text-left transition cursor-pointer ${
                        isActive
                          ? "bg-indigo-50/70"
                          : "hover:bg-slate-50 active:bg-slate-100"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                          {contact.avatar}
                        </div>
                        {contact.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {contact.name}
                          </p>
                          <span className="text-[11px] text-slate-400">
                            {contact.lastMessageTime}
                          </span>
                        </div>

                        <div className="mt-0.5 flex items-center justify-between gap-2">
                          <p
                            className={`truncate text-xs ${
                              contact.unread > 0
                                ? "font-semibold text-slate-700"
                                : "text-slate-500"
                            }`}
                          >
                            {contact.lastMessage}
                          </p>

                          {contact.unread > 0 && (
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
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
              CONVERSATION PANEL
          ====================================== */}
          <section
            className={`${
              activeContactId ? "flex" : "hidden md:flex"
            } min-w-0 flex-1 flex-col`}
          >
            {activeContact ? (
              <>
                {/* Conversation Header */}
                <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-5 py-3.5">
                  {/* Back button (mobile only) */}
                  <button
                    type="button"
                    onClick={() => setActiveContactId(null)}
                    className="-ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 md:hidden"
                    aria-label="Back to contacts"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="relative shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-base font-bold text-indigo-600">
                      {activeContact.avatar}
                    </div>
                    {activeContact.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {activeContact.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {activeContact.online ? "Active peer" : `${activeContact.department} · Offline`}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={scrollRef}
                  className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 px-5 py-5"
                >
                  {activeMessages.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No messages in this study session yet. Send a greeting to begin exchanging knowledge!
                    </div>
                  ) : (
                    activeMessages.map((msg, index) => {
                      const isMe = msg.from === "me";
                      const prevMsg = activeMessages[index - 1];
                      const showAvatar = !isMe && (!prevMsg || prevMsg.from !== msg.from);

                      return (
                        <div
                          key={msg.id || index}
                          className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          {!isMe && (
                            <div
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600 ${
                                showAvatar ? "opacity-100" : "opacity-0"
                              }`}
                            >
                              {activeContact.avatar}
                            </div>
                          )}

                          <div className={`flex max-w-[70%] flex-col ${isMe ? "items-end" : "items-start"}`}>
                            <div
                              className={`rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                                isMe
                                  ? "rounded-br-md bg-indigo-600 text-white"
                                  : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                              }`}
                            >
                              {msg.text}
                            </div>
                            <span className="mt-1 px-1 text-[11px] text-slate-400">
                              {msg.time}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Composer */}
                <form
                  onSubmit={handleSend}
                  className="flex shrink-0 items-center gap-3 border-t border-slate-200 px-5 py-3.5"
                >
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={`Message ${activeContact.name.split(" ")[0]}...`}
                    className="w-full flex-1 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />

                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="cursor-pointer flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    aria-label="Send message"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.94 2.94a1.5 1.5 0 0 1 1.61-.34l13 5a1.5 1.5 0 0 1 0 2.8l-13 5a1.5 1.5 0 0 1-2-1.83L3.8 10 1.55 4.77a1.5 1.5 0 0 1 .39-1.83Z" />
                    </svg>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl font-bold text-indigo-600">
                  ✉
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Select a study conversation
                </h3>
                <p className="mt-1 max-w-xs text-sm text-slate-500">
                  Once you connect and accept reciprocal matches, your peers will appear on the left.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Chat;
