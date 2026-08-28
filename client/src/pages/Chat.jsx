import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

/* ---------------------------------------
   DUMMY CONTACTS
---------------------------------------- */

const contacts = [
  {
    id: 1,
    name: "Rafi Ahmed",
    avatar: "R",
    department: "CSE",
    online: true,
    lastMessage: "Sure, I can walk you through DFS cycle detection.",
    lastMessageTime: "2:41 PM",
    unread: 2,
    messages: [
      { id: 1, from: "them", text: "Hey! Saw your request on the dashboard.", time: "2:30 PM" },
      { id: 2, from: "them", text: "You wanted help with graph traversal cycles, right?", time: "2:31 PM" },
      { id: 3, from: "me", text: "Yes exactly! I keep messing up the visited set logic.", time: "2:35 PM" },
      { id: 4, from: "them", text: "No worries, happens to everyone at first.", time: "2:36 PM" },
      { id: 5, from: "them", text: "Sure, I can walk you through DFS cycle detection.", time: "2:41 PM" },
    ],
  },
  {
    id: 2,
    name: "Mehjabin Tasnim",
    avatar: "M",
    department: "CSE",
    online: false,
    lastMessage: "Sounds good, let's do Thursday evening.",
    lastMessageTime: "11:12 AM",
    unread: 0,
    messages: [
      { id: 1, from: "me", text: "Hi Mehjabin! Are you still open to trading Python help for Data Structures?", time: "10:58 AM" },
      { id: 2, from: "them", text: "Yes definitely, I've been wanting to revisit linked lists anyway.", time: "11:05 AM" },
      { id: 3, from: "me", text: "Perfect, when are you free this week?", time: "11:08 AM" },
      { id: 4, from: "them", text: "Sounds good, let's do Thursday evening.", time: "11:12 AM" },
    ],
  },
  {
    id: 3,
    name: "Siam Uddin",
    avatar: "S",
    department: "EEE",
    online: true,
    lastMessage: "I'll send over the CAE simulation files before our session.",
    lastMessageTime: "Yesterday",
    unread: 0,
    messages: [
      { id: 1, from: "them", text: "Hey, thanks for accepting the bridge request!", time: "Yesterday" },
      { id: 2, from: "me", text: "Of course, looking forward to learning some ML basics.", time: "Yesterday" },
      { id: 3, from: "them", text: "I'll send over the CAE simulation files before our session.", time: "Yesterday" },
    ],
  },
];

/* ---------------------------------------
   CHAT PAGE
---------------------------------------- */

const Chat = () => {
  const [activeContactId, setActiveContactId] = useState(contacts[0].id);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [conversations, setConversations] = useState(contacts);
  const scrollRef = useRef(null);

  const activeContact = conversations.find((c) => c.id === activeContactId);

  const filteredContacts = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeContactId, activeContact?.messages.length]);

  const handleSelectContact = (id) => {
    setActiveContactId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  const handleSend = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const newMessage = {
      id: Date.now(),
      from: "me",
      text,
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeContactId
          ? {
              ...c,
              messages: [...c.messages, newMessage],
              lastMessage: text,
              lastMessageTime: newMessage.time,
            }
          : c
      )
    );

    setDraft("");
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50 text-slate-900">
      {/* =====================================
          NAVBAR
      ====================================== */}

      <header className="sticky top-0 z-50 shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-md">
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

          {/* Logout */}

          <Link
            to="/"
            className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 active:scale-95 sm:px-4 sm:py-2 sm:text-sm"
          >
            Log Out
          </Link>
        </div>
      </header>

      {/* =====================================
          CHAT SHELL
      ====================================== */}

      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-0 overflow-hidden px-0 py-0 sm:px-6 sm:py-6">
        <div className="flex w-full overflow-hidden rounded-none border-0 border-slate-200 bg-white shadow-none sm:rounded-2xl sm:border sm:shadow-sm">

          {/* =====================================
              CONTACTS SIDEBAR
          ====================================== */}

          <aside
            className={`${
              activeContactId ? "hidden md:flex" : "flex"
            } w-full shrink-0 flex-col border-r border-slate-200 md:w-[340px]`}
          >
            {/* Sidebar Header */}
            <div className="shrink-0 border-b border-slate-200 px-5 py-4">
              <h2 className="text-xl font-bold text-slate-950">Messages</h2>
              <div className="relative mt-3">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="11" cy="11" r="7" />
                  <path strokeLinecap="round" d="m20 20-3.5-3.5" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto">
              {filteredContacts.length === 0 && (
                <p className="px-5 py-6 text-center text-sm text-slate-500">
                  No contacts found.
                </p>
              )}

              {filteredContacts.map((contact) => {
                const isActive = contact.id === activeContactId;

                return (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => handleSelectContact(contact.id)}
                    className={`flex w-full items-center gap-3 border-b border-slate-100 px-5 py-3.5 text-left transition ${
                      isActive ? "bg-indigo-50" : "hover:bg-slate-50"
                    }`}
                  >
                    {/* Avatar with online dot */}
                    <div className="relative shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600">
                        {contact.avatar}
                      </div>
                      {contact.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                      )}
                    </div>

                    {/* Name + Preview */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`truncate text-sm ${
                            isActive || contact.unread > 0
                              ? "font-bold text-slate-900"
                              : "font-semibold text-slate-800"
                          }`}
                        >
                          {contact.name}
                        </p>
                        <span className="shrink-0 text-xs text-slate-400">
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
              })}
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
                      {activeContact.online ? "Active now" : `${activeContact.department} · Offline`}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={scrollRef}
                  className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 px-5 py-5"
                >
                  {activeContact.messages.map((msg, index) => {
                    const isMe = msg.from === "me";
                    const prevMsg = activeContact.messages[index - 1];
                    const showAvatar = !isMe && (!prevMsg || prevMsg.from !== msg.from);

                    return (
                      <div
                        key={msg.id}
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
                  })}
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
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    aria-label="Send message"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.94 2.94a1.5 1.5 0 0 1 1.61-.34l13 5a1.5 1.5 0 0 1 0 2.8l-13 5a1.5 1.5 0 0 1-2-1.83L3.8 10 1.55 4.77a1.5 1.5 0 0 1 .39-1.83Z" />
                    </svg>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl font-bold text-indigo-600">
                  ✉
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Select a conversation
                </h3>
                <p className="mt-1 max-w-xs text-sm text-slate-500">
                  Choose a contact from the list to view your message history.
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
