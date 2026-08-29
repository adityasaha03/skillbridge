import React, { useState } from "react";
import { Link } from "react-router-dom";

/* ---------------------------------------
   DUMMY USER DATA
---------------------------------------- */

const initialProfile = {
  name: "Shirsha Chowdhury",
  role: "Undergraduate Student",
  department: "CSE",
  institution: "Ahsanullah University of Science and Technology",
  avatar: "S",
  email: "shirsha.cse@aust.edu",
  phone: "+880 1700-000000",
  bio: "Passionate about algorithms, Flutter development, and building full-stack web and mobile systems.",
  skillsToTeach: ["Data Structures & Algorithms", "C++", "Flutter"],
  skillsToLearn: ["Machine Learning", "System Architecture"],
};

/* ---------------------------------------
   PROFILE PAGE
---------------------------------------- */

const Profile = () => {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialProfile);
  const [newTeachSkill, setNewTeachSkill] = useState("");
  const [newLearnSkill, setNewLearnSkill] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const addSkill = (type) => {
    if (type === "teach" && newTeachSkill.trim()) {
      setFormData((prev) => ({
        ...prev,
        skillsToTeach: [...prev.skillsToTeach, newTeachSkill.trim()],
      }));
      setNewTeachSkill("");
    } else if (type === "learn" && newLearnSkill.trim()) {
      setFormData((prev) => ({
        ...prev,
        skillsToLearn: [...prev.skillsToLearn, newLearnSkill.trim()],
      }));
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
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white">
                3
              </span>
            </Link>

            {/* Theme Switcher */}
            <button
              type="button"
              aria-label="Toggle dark mode"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 active:scale-95"
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="4" />
                <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            </button>

            {/* Logout */}
            <Link
              to="/"
              className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 active:scale-95 sm:px-4 sm:py-2 sm:text-sm"
            >
              Log Out
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================
          PROFILE MAIN SHELL
      ====================================== */}

      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-0 overflow-hidden px-0 py-0 sm:px-6 sm:py-6">
        <div className="flex w-full flex-col overflow-hidden rounded-none border-0 border-slate-200 bg-white shadow-none sm:rounded-2xl sm:border sm:shadow-sm">
          
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h1 className="text-xl font-bold text-slate-950">User Profile</h1>
              <p className="text-xs text-slate-500">Manage your personal information and preferences.</p>
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 sm:text-sm"
              >
                Edit Profile
              </button>
            )}
          </div>

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
                      value={formData.role}
                      onChange={handleInputChange}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
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
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Bio</label>
                  <textarea
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* Edit Skills to Teach */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Skills Can Teach</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.skillsToTeach.map((skill, index) => (
                      <span key={index} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
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
                      placeholder="Add a skill..."
                      className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill("teach")}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Edit Skills to Learn */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Skills Want to Learn</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.skillsToLearn.map((skill, index) => (
                      <span key={index} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
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
                      placeholder="Add a skill..."
                      className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill("learn")}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 sm:text-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 sm:text-sm"
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
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-3xl font-bold text-indigo-600">
                    {profile.avatar}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-950">{profile.name}</h2>
                    <p className="text-sm font-semibold text-indigo-600">{profile.role} · {profile.department}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{profile.institution}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 gap-6 border-y border-slate-100 py-6 sm:grid-cols-2">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</span>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{profile.email}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phone Number</span>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{profile.phone}</p>
                  </div>
                </div>

                {/* Bio Section */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">About Me</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{profile.bio}</p>
                </div>

                {/* Skills Sections */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Skills Can Teach</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.skillsToTeach.map((skill, index) => (
                        <span key={index} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Skills Want to Learn</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.skillsToLearn.map((skill, index) => (
                        <span key={index} className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                          {skill}
                        </span>
                      ))}
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