import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchUserProfile, updateUserProfile, updateUserSkills } from "../services/userService";
import { fetchNotifications } from "../services/notificationService";
import { logoutUser } from "../services/authService";

const initialProfile = {
  name: "Student",
  role: "Undergraduate Student",
  department: "CSE",
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
            role: user.roles?.includes("tutor") ? "Tutor / Student" : "Undergraduate Student",
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
      if (!formData.skillsToTeach.includes(newTeachSkill.trim())) {
        setFormData((prev) => ({
          ...prev,
          skillsToTeach: [...prev.skillsToTeach, newTeachSkill.trim()],
        }));
      }
      setNewTeachSkill("");
    } else if (type === "learn" && newLearnSkill.trim()) {
      if (!formData.skillsToLearn.includes(newLearnSkill.trim())) {
        setFormData((prev) => ({
          ...prev,
          skillsToLearn: [...prev.skillsToLearn, newLearnSkill.trim()],
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
      await logoutUser();
    } finally {
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* =====================================
          NAVBAR
      ====================================== */}
      <header className="sticky top-0 z-50 border-b border-slate-300 bg-white/80 backdrop-blur-md">
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
          PROFILE MAIN SHELL
      ====================================== */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-0 overflow-hidden px-0 py-0 sm:px-6 sm:py-6">
        <div className="flex w-full flex-col overflow-hidden rounded-none border-0 border-slate-300 bg-white shadow-none sm:rounded-2xl sm:border sm:shadow-sm">
          
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-slate-300 px-6 py-5">
            <div>
              <h1 className="text-xl font-bold text-slate-950">User Profile</h1>
              <p className="text-xs text-slate-500">Manage your university information, bio, and complementary skills.</p>
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 sm:text-sm"
              >
                Edit Profile
              </button>
            )}
          </div>

          {statusMessage && (
            <div className="mx-6 mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
              {statusMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mx-6 mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
              {errorMessage}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {isEditing ? (
              /* EDIT FORM */
              <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Role / Designation</label>
                    <input
                      type="text"
                      name="role"
                      disabled
                      value={formData.role}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Semester</label>
                    <input
                      type="text"
                      name="semester"
                      value={formData.semester || ""}
                      onChange={handleInputChange}
                      placeholder="e.g. 2.2, 3.1"
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Institution</label>
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+880 1..."
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Bio & Study Context</label>
                  <textarea
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Describe what you excel at and what topics you need help with..."
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* Edit Skills to Teach */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Skills Can Teach (Strong Tags)</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.skillsToTeach.map((skill, index) => (
                      <span key={index} className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                        {skill}
                        <button type="button" onClick={() => removeSkill("teach", index)} className="hover:text-indigo-900">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={newTeachSkill}
                      onChange={(e) => setNewTeachSkill(e.target.value)}
                      placeholder="Add a skill you can teach..."
                      className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill("teach")}
                      className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Edit Skills to Learn */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Skills Want to Learn (Weak Tags)</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.skillsToLearn.map((skill, index) => (
                      <span key={index} className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {skill}
                        <button type="button" onClick={() => removeSkill("learn", index)} className="hover:text-slate-900">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={newLearnSkill}
                      onChange={(e) => setNewLearnSkill(e.target.value)}
                      placeholder="Add a skill you want to learn..."
                      className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill("learn")}
                      className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 sm:text-sm disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* VIEW MODE */
              <div className="space-y-8 max-w-4xl">
                {/* Header Profile Info */}
                <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 text-3xl font-bold text-indigo-600">
                    {profile.avatar}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-950">{profile.name}</h2>
                    <p className="text-sm font-semibold text-indigo-600">{profile.role} · {profile.department} (Semester {profile.semester || "2.2"})</p>
                    <p className="text-xs text-slate-500 mt-0.5">{profile.institution}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 gap-6 border-y border-slate-300 py-6 sm:grid-cols-2">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email Address</span>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{profile.email}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Phone Number</span>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{profile.phone || "Not specified"}</p>
                  </div>
                </div>

                {/* Bio Section */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">About Me</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {profile.bio || "No bio specified yet. Click 'Edit Profile' to share what you're working on!"}
                  </p>
                </div>

                {/* Skills Sections */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-300 bg-slate-50/60 p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Skills Can Teach</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.skillsToTeach && profile.skillsToTeach.length > 0 ? (
                        profile.skillsToTeach.map((skill, index) => (
                          <span key={index} className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">No skills added yet</span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-300 bg-slate-50/60 p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Skills Want to Learn</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.skillsToLearn && profile.skillsToLearn.length > 0 ? (
                        profile.skillsToLearn.map((skill, index) => (
                          <span key={index} className="rounded-full border border-slate-300 bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">No skills added yet</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;