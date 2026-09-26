import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchUserProfile, updateUserProfile, updateUserSkills } from "../services/userService";
import { fetchNotifications } from "../services/notificationService";
import { fetchTags } from "../services/tagService";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";

const defaultTopicSuggestions = [
  "C Programming",
  "C++",
  "Data Structures",
  "Algorithms",
  "Java",
  "Python",
  "Machine Learning",
  "React",
  "JavaScript",
  "HTML & CSS",
  "Database Design",
  "SQL",
  "MongoDB",
  "Node.js",
  "Computer Networks",
  "Operating Systems",
  "Computer Architecture",
  "Discrete Mathematics",
  "Digital Logic Design",
  "Microprocessors",
];

const initialProfile = {
  name: "Student",
  role: "Undergraduate Student",
  studentId: "",
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
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialProfile);

  const [availableTopics, setAvailableTopics] = useState(defaultTopicSuggestions);
  const [newTeachSkill, setNewTeachSkill] = useState("");
  const [newLearnSkill, setNewLearnSkill] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfileData = async () => {
      try {
        const user = await fetchUserProfile();
        if (user && isMounted) {
          const mapped = {
            name: user.fullName || authUser?.fullName || "Student",
            role: user.roles?.includes("tutor") ? "Tutor / Peer Mentor" : "Undergraduate Student",
            studentId: user.studentId || authUser?.studentId || "",
            department: user.department || "CSE",
            semester: user.semester || "2.2",
            institution: user.institution || "Ahsanullah University of Science and Technology",
            avatar: user.avatar || user.fullName?.charAt(0).toUpperCase() || "S",
            email: user.email || authUser?.email || "",
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
        if (isMounted) setLoading(false);
      }

      // Fetch taxonomy tags for autocompletion
      try {
        const tags = await fetchTags();
        if (tags && tags.length > 0 && isMounted) {
          setAvailableTopics(tags.map((t) => t.name));
        }
      } catch (e) {
        console.warn("Using fallback topic suggestions", e);
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
    };

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, [navigate, authUser]);

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
      setStatusMessage("Profile and exchange skills saved successfully!");
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

  const addSkill = (type, customSkill = "") => {
    const skillToAdd = customSkill || (type === "teach" ? newTeachSkill : newLearnSkill);
    const clean = skillToAdd.trim();
    if (!clean) return;

    if (type === "teach") {
      if (!formData.skillsToTeach.includes(clean)) {
        setFormData((prev) => ({
          ...prev,
          skillsToTeach: [...prev.skillsToTeach, clean],
        }));
      }
      setNewTeachSkill("");
    } else {
      if (!formData.skillsToLearn.includes(clean)) {
        setFormData((prev) => ({
          ...prev,
          skillsToLearn: [...prev.skillsToLearn, clean],
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

  const handleCopyEmail = () => {
    if (!profile.email) return;
    navigator.clipboard?.writeText(profile.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Filter suggestions for autocomplete
  const filteredTeachSuggestions = availableTopics.filter(
    (t) =>
      newTeachSkill &&
      t.toLowerCase().includes(newTeachSkill.toLowerCase()) &&
      !formData.skillsToTeach.includes(t)
  );

  const filteredLearnSuggestions = availableTopics.filter(
    (t) =>
      newLearnSkill &&
      t.toLowerCase().includes(newLearnSkill.toLowerCase()) &&
      !formData.skillsToLearn.includes(t)
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-700">Loading student profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-12 font-sans">
      {/* Navigation */}
      <Navbar unreadCount={unreadCount} />

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Status Alerts */}
        {statusMessage && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm font-semibold text-emerald-800 shadow-2xs animate-fade-in">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{statusMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage("")}
              className="cursor-pointer text-emerald-700 hover:text-emerald-900 font-bold ml-2 text-base leading-none"
            >
              ×
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs sm:text-sm font-semibold text-rose-800 shadow-2xs animate-fade-in">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="cursor-pointer text-rose-700 hover:text-rose-900 font-bold ml-2 text-base leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* =====================================
            HERO PROFILE CARD (BANNER)
        ====================================== */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
          {/* Subtle gradient top strip */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pt-2">
            {/* Identity Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="flex h-22 w-22 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-3xl font-extrabold text-white shadow-md ring-4 ring-indigo-50">
                  {profile.avatar}
                </div>
                <span className="absolute bottom-1 right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white" title="Verified Member">
                  <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </div>

              {/* Names & Metadata */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                    {profile.name}
                  </h1>
                </div>

                <p className="text-sm font-semibold text-slate-700">
                  {profile.department} · Semester {profile.semester || "2.2"}
                  {profile.studentId && (
                    <span className="text-slate-400 font-normal"> · ID: {profile.studentId}</span>
                  )}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                    </svg>
                    {profile.institution}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Right Action */}
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xs hover:bg-indigo-700 active:scale-95 transition shrink-0"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-2xs hover:bg-indigo-700 active:scale-95 transition disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* =====================================
            VIEW MODE vs EDIT MODE
        ====================================== */}
        {!isEditing ? (
          /* =====================================
             VIEW MODE: BALANCED 12-COLUMN GRID
          ====================================== */
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column: Contact & Quick Metrics (4 Cols) */}
            <div className="space-y-6 lg:col-span-4">
              {/* Contact Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Student Credentials
                </h2>

                <div className="space-y-3">
                  {/* Email */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        AUST Email
                      </span>
                      {profile.email && (
                        <button
                          type="button"
                          onClick={handleCopyEmail}
                          className="cursor-pointer text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 transition"
                        >
                          {copiedEmail ? "Copied! ✓" : "Copy"}
                        </button>
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs sm:text-sm font-bold text-slate-900">
                      {profile.email || "student@aust.edu"}
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Phone Number
                    </span>
                    <p className="mt-1 text-xs sm:text-sm font-bold text-slate-900">
                      {profile.phone || "Not specified"}
                    </p>
                  </div>

                  {/* Academic Department */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Department & Level
                    </span>
                    <p className="mt-1 text-xs sm:text-sm font-bold text-slate-900">
                      {profile.department} (Semester {profile.semester || "2.2"})
                    </p>
                  </div>
                </div>
              </div>

              {/* Reciprocal Trade Inventory Snapshot Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Exchange Snapshot
                </h2>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5">
                    <p className="text-2xl font-black text-indigo-700">
                      {profile.skillsToTeach?.length || 0}
                    </p>
                    <p className="text-[11px] font-bold text-indigo-900 mt-0.5">Can Teach</p>
                    <span className="text-[10px] text-indigo-600">Strengths</span>
                  </div>

                  <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-3.5">
                    <p className="text-2xl font-black text-teal-700">
                      {profile.skillsToLearn?.length || 0}
                    </p>
                    <p className="text-[11px] font-bold text-teal-900 mt-0.5">Want to Learn</p>
                    <span className="text-[10px] text-teal-600">Objectives</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Bio & Skills Details (8 Cols) */}
            <div className="space-y-6 lg:col-span-8">
              {/* Academic Bio Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  <h2 className="text-base font-bold text-slate-900">
                    About Me & Study Style
                  </h2>
                </div>

                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
                  {profile.bio ? (
                    <p className="whitespace-pre-line">{profile.bio}</p>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                      <p className="text-xs text-slate-400">
                        You haven't written an academic bio yet. Introduce yourself, current courses, and how you like to collaborate with study peers!
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="mt-2.5 cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        + Write bio now
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills I Can Teach (Strengths) */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs">
                      ↑
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Skills I Can Teach
                      </h2>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Your strong academic topics offered to peers for exchange
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                    {profile.skillsToTeach?.length || 0} topics
                  </span>
                </div>

                <div>
                  {profile.skillsToTeach && profile.skillsToTeach.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skillsToTeach.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-900 shadow-2xs transition hover:bg-emerald-100/80"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-400">
                      No teaching skills listed yet. Add topics you are confident in to get matched with learners!
                    </div>
                  )}
                </div>
              </div>

              {/* Skills I Want to Learn (Goals) */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs">
                      ↓
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Skills I Want to Learn
                      </h2>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Topics you are seeking peer tutoring or study sessions for
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-800 border border-indigo-200">
                    {profile.skillsToLearn?.length || 0} topics
                  </span>
                </div>

                <div>
                  {profile.skillsToLearn && profile.skillsToLearn.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skillsToLearn.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-900 shadow-2xs transition hover:bg-indigo-100/80"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-400">
                      No learning goals listed yet. Add challenging topics to find peers who can explain them!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =====================================
             EDIT MODE: STREAMLINED FORM
          ====================================== */
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 lg:grid-cols-12 text-left animate-fade-in">
            {/* Column 1: Academic & Personal Info (5 Cols) */}
            <div className="space-y-6 lg:col-span-5">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
                  Personal & Academic Details
                </h2>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="e.g. CSE"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Semester
                    </label>
                    <input
                      type="text"
                      name="semester"
                      value={formData.semester || ""}
                      onChange={handleInputChange}
                      placeholder="e.g. 2.2"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Institution
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+880 1..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    AUST Email (Account Bound)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs sm:text-sm text-slate-500 cursor-not-allowed outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Column 2: Bio & Skills Editor (7 Cols) */}
            <div className="space-y-6 lg:col-span-7">
              {/* Bio Field */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-3">
                <label className="block text-sm font-bold text-slate-900">
                  Academic Bio & Learning Preferences
                </label>
                <textarea
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Describe what subjects you excel at, topics you want to practice, or preferred study schedules..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Skills Can Teach Editor */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <label className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Skills Can Teach (Strengths)
                  </label>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {formData.skillsToTeach.length} selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                  {formData.skillsToTeach.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill("teach", index)}
                        className="cursor-pointer text-emerald-600 hover:text-emerald-900 font-bold ml-0.5 text-sm leading-none"
                        title="Remove topic"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Teach Input */}
                <div className="relative flex gap-2">
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
                    placeholder="Type topic to add (e.g. Data Structures, React)..."
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                  <button
                    type="button"
                    onClick={() => addSkill("teach")}
                    className="cursor-pointer rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition"
                  >
                    Add
                  </button>

                  {/* Autocomplete Dropdown */}
                  {newTeachSkill && filteredTeachSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-16 z-20 mt-1 max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                      {filteredTeachSuggestions.slice(0, 5).map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => addSkill("teach", suggestion)}
                          className="cursor-pointer w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-lg transition"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Skills Want to Learn Editor */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <label className="text-sm font-bold text-indigo-950 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    Skills Want to Learn (Objectives)
                  </label>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {formData.skillsToLearn.length} selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                  {formData.skillsToLearn.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-900"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill("learn", index)}
                        className="cursor-pointer text-indigo-600 hover:text-indigo-900 font-bold ml-0.5 text-sm leading-none"
                        title="Remove topic"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Learn Input */}
                <div className="relative flex gap-2">
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
                    placeholder="Type topic to add (e.g. Microprocessors, Algorithms)..."
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    type="button"
                    onClick={() => addSkill("learn")}
                    className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 transition"
                  >
                    Add
                  </button>

                  {/* Autocomplete Dropdown */}
                  {newLearnSkill && filteredLearnSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-16 z-20 mt-1 max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                      {filteredLearnSuggestions.slice(0, 5).map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => addSkill("learn", suggestion)}
                          className="cursor-pointer w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 rounded-lg transition"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Bottom Save Actions */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="cursor-pointer rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xs hover:bg-indigo-700 active:scale-95 transition disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav unreadCount={unreadCount} />
    </div>
  );
};

export default Profile;