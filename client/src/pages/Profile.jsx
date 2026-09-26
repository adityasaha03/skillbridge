import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchUserProfile, updateUserProfile, updateUserSkills } from "../services/userService";
import { fetchNotifications } from "../services/notificationService";
import { useAuth } from "../context/AuthContext";

const initialProfile = {
  name: "Student",
  role: "Undergraduate Student",
  department: "CSE",
  semester: "2.2",
  institution: "Ahsanullah University of Science and Technology",
  avatar: "S",
  email: "",
  phone: "",
  bio: "",
  skillsToTeach: [],
  skillsToLearn: [],
};

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialProfile);
  const [newTeachSkill, setNewTeachSkill] = useState("");
  const [newLearnSkill, setNewLearnSkill] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await fetchUserProfile();
        if (user) {
          const mapped = {
            name: user.fullName || "Student",
            role: user.roles?.includes("tutor") ? "Tutor / Peer Mentor" : "Undergraduate Student",
            department: user.department || "CSE",
            semester: user.semester || "2.2",
            institution: user.institution || "Ahsanullah University of Science and Technology",
            avatar: user.avatar || user.fullName?.charAt(0).toUpperCase() || "S",
            email: user.email || "",
            phone: user.phone || "",
            bio: user.contextBio || "",
            skillsToTeach: (user.strongTags || []).map((t) => t.name || t),
            skillsToLearn: (user.weakTags || []).map((t) => t.name || t),
          };
          setProfile(mapped);
          setFormData(mapped);
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }

      try {
        const notifs = await fetchNotifications();
        setUnreadCount(notifs.unreadCount || 0);
      } catch (e) {
        console.warn("Failed to fetch notification count", e);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      // 1. Update personal details
      await updateUserProfile({
        fullName: formData.name,
        department: formData.department,
        semester: formData.semester,
        phone: formData.phone,
        institution: formData.institution,
        contextBio: formData.bio,
      });

      // 2. Update skills
      await updateUserSkills({
        wantToLearn: formData.skillsToLearn,
        canTeach: formData.skillsToTeach,
      });

      setProfile(formData);
      setIsEditing(false);
      setStatusMessage("Profile updated successfully!");
      setTimeout(() => setStatusMessage(""), 4000);
    } catch (err) {
      setErrorMessage(err.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
    setErrorMessage("");
  };

  const addSkill = (type) => {
    if (type === "teach" && newTeachSkill.trim()) {
      const trimmed = newTeachSkill.trim();
      if (!formData.skillsToTeach.includes(trimmed)) {
        setFormData((prev) => ({
          ...prev,
          skillsToTeach: [...prev.skillsToTeach, trimmed],
        }));
      }
      setNewTeachSkill("");
    } else if (type === "learn" && newLearnSkill.trim()) {
      const trimmed = newLearnSkill.trim();
      if (!formData.skillsToLearn.includes(trimmed)) {
        setFormData((prev) => ({
          ...prev,
          skillsToLearn: [...prev.skillsToLearn, trimmed],
        }));
      }
      setNewLearnSkill("");
    }
  };

  const removeSkill = (type, index) => {
    if (type === "teach") {
      setFormData((prev) => ({
        ...prev,
        skillsToTeach: prev.skillsToTeach.filter((_, i) => i !== index),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        skillsToLearn: prev.skillsToLearn.filter((_, i) => i !== index),
      }));
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">
        <svg className="mr-3 h-5 w-5 animate-spin text-indigo-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        Loading profile...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
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
              className="text-sm font-semibold text-indigo-600"
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
          MAIN PROFILE CONTENT
      ====================================== */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Banner / Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 text-left">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
                AUST Student Portal
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                Verified Exchange Member
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Academic Profile
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your academic credentials, contact info, and reciprocal study exchange skills.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-xs">
            <svg className="h-5 w-5 shrink-0 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            {statusMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 shadow-xs">
            <svg className="h-5 w-5 shrink-0 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {errorMessage}
          </div>
        )}

        {/* Balanced Grid: Left Card (Identity & Meta) + Right Cards (Bio & Skills) */}
        {!isEditing ? (
          /* =====================================
             VIEW MODE (BALANCED 12-COLUMN GRID)
          ====================================== */
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 text-left">
            {/* Left Column: Identity & Contact Card (4 cols) */}
            <div className="space-y-6 lg:col-span-4">
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                {/* Avatar & Main Identity */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-3xl font-extrabold text-white shadow-md ring-4 ring-indigo-50">
                      {profile.avatar}
                    </div>
                    <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white bg-emerald-500" title="Active student" />
                  </div>

                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    {profile.name}
                  </h2>
                  <p className="mt-0.5 text-xs font-semibold text-indigo-600">
                    {profile.role}
                  </p>

                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      Dept: {profile.department}
                    </span>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      Semester: {profile.semester || "2.2"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                    <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                    </svg>
                    <span className="truncate">{profile.institution}</span>
                  </div>
                </div>

                <hr className="my-6 border-slate-100" />

                {/* Contact Information */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Contact Details
                  </h3>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50/70 p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email</p>
                        <p className="truncate text-xs font-semibold text-slate-800">{profile.email || "No email provided"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-slate-50/70 p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Phone</p>
                        <p className="truncate text-xs font-semibold text-slate-800">{profile.phone || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="my-6 border-slate-100" />

                {/* Quick Academic Exchange Metrics */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Exchange Snapshot
                  </h3>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-center">
                      <p className="text-2xl font-bold text-indigo-700">{profile.skillsToTeach?.length || 0}</p>
                      <p className="text-[11px] font-semibold text-indigo-600">Can Teach</p>
                    </div>
                    <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-3 text-center">
                      <p className="text-2xl font-bold text-violet-700">{profile.skillsToLearn?.length || 0}</p>
                      <p className="text-[11px] font-semibold text-violet-600">Want to Learn</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Bio & Skills Section (8 cols) */}
            <div className="space-y-6 lg:col-span-8">
              {/* About Me / Bio Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">About Me & Academic Goals</h3>
                </div>
                <div className="mt-4 text-sm leading-relaxed text-slate-600">
                  {profile.bio ? (
                    <p className="whitespace-pre-line">{profile.bio}</p>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                      <p className="text-xs text-slate-400">
                        You haven't written an academic bio yet. Introduce your background, current courses, and what you enjoy discussing!
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="mt-3 cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        + Add a bio now
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills I Can Teach Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Skills I Can Teach</h3>
                      <p className="text-xs text-slate-500">Your strong academic subjects and topics offered to peers</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    {profile.skillsToTeach?.length || 0} topics
                  </span>
                </div>

                <div className="mt-4">
                  {profile.skillsToTeach && profile.skillsToTeach.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skillsToTeach.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-2xs transition hover:bg-emerald-100"
                        >
                          <svg className="h-3.5 w-3.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                      No teaching topics listed yet. Add topics you're confident in to get matched with learners!
                    </div>
                  )}
                </div>
              </div>

              {/* Skills I Want to Learn Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Skills I Want to Learn</h3>
                      <p className="text-xs text-slate-500">Topics you're seeking assistance or collaborative study partners for</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                    {profile.skillsToLearn?.length || 0} topics
                  </span>
                </div>

                <div className="mt-4">
                  {profile.skillsToLearn && profile.skillsToLearn.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skillsToLearn.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1.5 text-xs font-semibold text-indigo-800 shadow-2xs transition hover:bg-indigo-100"
                        >
                          <svg className="h-3.5 w-3.5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zm0 13a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zm0-8a3 3 0 100 6 3 3 0 000-6z" />
                          </svg>
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                      No learning topics listed yet. Add challenging topics to find peers who can explain them!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =====================================
             EDIT MODE (COHESIVE BALANCED FORM)
          ====================================== */
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-8 lg:grid-cols-12 text-left">
            {/* Left Edit Column: Identity Details (5 cols) */}
            <div className="space-y-6 lg:col-span-5">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                <h3 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
                  Personal & Academic Details
                </h3>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Aditya Saha"
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        placeholder="e.g. CSE"
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Semester
                      </label>
                      <input
                        type="text"
                        name="semester"
                        value={formData.semester || ""}
                        onChange={handleInputChange}
                        placeholder="e.g. 2.2"
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Institution / University
                    </label>
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleInputChange}
                      placeholder="e.g. Ahsanullah University of Science and Technology"
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+880 1..."
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Email Address (Managed by Account)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Edit Column: Bio & Skills (7 cols) */}
            <div className="space-y-6 lg:col-span-7">
              {/* Bio Edit */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                <h3 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
                  About Me & Context
                </h3>
                <div className="mt-4">
                  <textarea
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Describe your academic focus, favorite courses, semester goals, or learning style..."
                    className="w-full rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  <p className="mt-1.5 text-right text-[11px] text-slate-400">
                    Max 500 characters
                  </p>
                </div>
              </div>

              {/* Skills to Teach Edit */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Skills Can Teach (Strengths)
                  </h3>
                  <span className="text-xs font-semibold text-emerald-600">
                    {formData.skillsToTeach.length} selected
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.skillsToTeach.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill("teach", index)}
                          className="cursor-pointer text-emerald-500 hover:text-emerald-800 font-bold ml-0.5"
                          title="Remove topic"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={newTeachSkill}
                      onChange={(e) => setNewTeachSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill("teach");
                        }
                      }}
                      placeholder="Add a topic you excel at (e.g. Data Structures)..."
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill("teach")}
                      className="cursor-pointer rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Skills to Learn Edit */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Skills Want to Learn (Goals)
                  </h3>
                  <span className="text-xs font-semibold text-indigo-600">
                    {formData.skillsToLearn.length} selected
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.skillsToLearn.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill("learn", index)}
                          className="cursor-pointer text-indigo-500 hover:text-indigo-800 font-bold ml-0.5"
                          title="Remove topic"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={newLearnSkill}
                      onChange={(e) => setNewLearnSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill("learn");
                        }
                      }}
                      placeholder="Add a topic you need assistance with (e.g. Microprocessors)..."
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill("learn")}
                      className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="cursor-pointer rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default Profile;