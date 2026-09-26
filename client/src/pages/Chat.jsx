import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchConversations, fetchMessages, sendChatMessage } from "../services/chatService";
import { fetchNotifications } from "../services/notificationService";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeContactId, setActiveContactId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  // Load conversations and notifications on mount
  useEffect(() => {
    let isMounted = true;

    const loadChatData = async () => {
      try {
        const convos = await fetchConversations();
        if (isMounted) {
          setConversations(convos || []);
          if (convos && convos.length > 0 && !activeContactId) {
            // Select first conversation on desktop by default
            if (window.innerWidth >= 768) {
              setActiveContactId(convos[0].id);
            }
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
  }, [activeContactId]);

  // Load messages when activeContactId changes + poll every 4 seconds
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

    const interval = setInterval(loadActiveMessages, 4000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [activeContactId]);

  // Auto-scroll to bottom on message update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeContactId, activeMessages]);

  const activeContact = conversations.find((c) => c.id === activeContactId);

  const filteredContacts = conversations.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.department?.toLowerCase().includes(search.toLowerCase())
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
    if (!text || !activeContactId || sending) return;

    setSending(true);
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
                lastMessageTime: savedMsg.time || "Just now",
              }
            : c
        )
      );
    } catch (err) {
      console.error("Failed to send chat message:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-50 text-slate-900 overflow-hidden pb-16 md:pb-0">
      {/* Responsive Navbar */}
      <Navbar unreadCount={unreadCount} />

      {/* Main Chat App Area */}
      <div className="flex flex-1 overflow-hidden p-0 sm:p-4 lg:p-6 mx-auto w-full max-w-7xl">
        <div className="flex w-full flex-1 overflow-hidden rounded-none sm:rounded-2xl border-0 sm:border border-slate-200/90 bg-white shadow-2xs">
          {/* =====================================
              CONTACTS SIDEBAR
          ====================================== */}
          <aside
            className={`${
              activeContactId ? "hidden md:flex" : "flex"
            } w-full flex-col border-r border-slate-200 md:w-80 lg:w-96 shrink-0 bg-white`}
          >
            {/* Sidebar Header */}
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold text-slate-950">Study Messages</h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Connected academic partners
                  </p>
                </div>
                <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                  {conversations.length}
                </span>
              </div>

              {/* Search */}
              <div className="relative mt-3">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search connected peers..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 pl-9 pr-8 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
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
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 font-bold text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                  Loading conversations...
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  {conversations.length === 0 ? (
                    <div className="space-y-3 py-4">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-xl font-bold">
                        ✉
                      </div>
                      <p className="font-bold text-slate-800 text-sm">No active chats yet</p>
                      <p className="text-slate-500 leading-relaxed max-w-xs mx-auto">
                        Connect with reciprocal peers on the Topics Dashboard or accept pending invites in Notifications to start study conversations!
                      </p>
                      <Link
                        to="/dashboard"
                        className="inline-block rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 transition"
                      >
                        Find Peers to Study With →
                      </Link>
                    </div>
                  ) : (
                    <p className="text-slate-500 py-4">No contacts matching "{search}".</p>
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
                      className={`flex w-full items-center gap-3 p-3.5 text-left transition-all cursor-pointer ${
                        isActive
                          ? "bg-indigo-50/80 border-l-4 border-indigo-600 pl-2.5"
                          : "hover:bg-slate-50 active:bg-slate-100"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700 border border-indigo-200/60 shadow-2xs">
                          {contact.avatar || contact.name?.charAt(0)}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {contact.name}
                          </p>
                          <span className="text-[11px] font-medium text-slate-400 shrink-0 ml-1">
                            {contact.lastMessageTime}
                          </span>
                        </div>

                        <div className="mt-0.5 flex items-center justify-between gap-2">
                          <p
                            className={`truncate text-xs ${
                              contact.unread > 0
                                ? "font-bold text-indigo-900"
                                : "text-slate-500"
                            }`}
                          >
                            {contact.lastMessage}
                          </p>

                          {contact.unread > 0 && (
                            <span className="flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shrink-0">
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
            } min-w-0 flex-1 flex-col bg-white h-full`}
          >
            {activeContact ? (
              <>
                {/* Conversation Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 bg-white">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Back Button (Mobile only) */}
                    <button
                      type="button"
                      onClick={() => setActiveContactId(null)}
                      className="-ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors md:hidden"
                      aria-label="Back to contacts list"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <div className="relative shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-base font-bold text-indigo-700 border border-indigo-100">
                        {activeContact.avatar || activeContact.name?.charAt(0)}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-950">
                        {activeContact.name}
                      </p>
                      <p className="text-[11px] font-medium text-slate-500 truncate">
                        {activeContact.department} · Semester {activeContact.semester}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition"
                  >
                    View Info
                  </Link>
                </div>

                {/* Messages Body */}
                <div
                  ref={scrollRef}
                  className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-4 sm:p-5"
                >
                  {activeMessages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-xl font-bold">
                        👋
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        Start your study session
                      </p>
                      <p className="max-w-xs text-xs text-slate-500">
                        Say hello to {activeContact.name.split(" ")[0]} and coordinate what time to exchange study notes!
                      </p>
                    </div>
                  ) : (
                    activeMessages.map((msg, index) => {
                      const isMe = msg.from === "me";

                      return (
                        <div
                          key={msg.id || index}
                          className={`flex items-end gap-2 ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          {!isMe && (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
                              {activeContact.avatar || activeContact.name?.charAt(0)}
                            </div>
                          )}

                          <div
                            className={`flex flex-col ${
                              isMe ? "items-end" : "items-start"
                            } max-w-[85%] sm:max-w-[75%]`}
                          >
                            <div
                              className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed break-words shadow-2xs ${
                                isMe
                                  ? "rounded-br-xs bg-indigo-600 text-white font-normal"
                                  : "rounded-bl-xs border border-slate-200 bg-white text-slate-900 font-normal"
                              }`}
                            >
                              {msg.text}
                            </div>
                            <span className="mt-1 px-1 text-[10px] text-slate-400 font-medium">
                              {msg.time}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input Box */}
                <form
                  onSubmit={handleSend}
                  className="flex shrink-0 items-center gap-2 border-t border-slate-200 bg-white p-3 sm:p-4"
                >
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={`Message ${activeContact.name?.split(" ")[0]}...`}
                    className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                  />

                  <button
                    type="submit"
                    disabled={!draft.trim() || sending}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs transition hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer"
                    aria-label="Send message"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.94 2.94a1.5 1.5 0 0 1 1.61-.34l13 5a1.5 1.5 0 0 1 0 2.8l-13 5a1.5 1.5 0 0 1-2-1.83L3.8 10 1.55 4.77a1.5 1.5 0 0 1 .39-1.83Z" />
                    </svg>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl font-bold text-indigo-600">
                  ✉
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Select a study conversation
                </h3>
                <p className="max-w-xs text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Choose a peer from the list on the left to review messages and coordinate academic learning.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav unreadCount={unreadCount} />
    </div>
  );
};

export default Chat;
