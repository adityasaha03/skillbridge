import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile, updateUserProfile, updateUserSkills } from "../services/userService";
import { fetchNotifications } from "../services/notificationService";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import TagBadge from "../components/TagBadge";

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
  const { user: authUser } = useAuth();
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
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const user = await fetchUserProfile();
        if (user && isMounted) {
          const mapped = {
            name: user.fullName || authUser?.fullName || "Student",
            role: user.roles?.includes("tutor") ? "Tutor / Student" : "Undergraduate Student",
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

      try {
        const notifs = await fetchNotifications();
        if (isMounted) {
          setUnreadCount(notifs.unreadCount || 0);
        }
      } catch (e) {
        console.warn("Failed to fetch notification count", e);
      }
    };

    loadProfile();

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
      setStatusMessage("Profile and complementary skills updated successfully!");
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
      const clean = newTeachSkill.trim();
      if (!formData.skillsToTeach.includes(clean)) {
        setFormData((prev) => ({
          ...prev,
          skillsToTeach: [...prev.skillsToTeach, clean],
        }));
      }
      setNewTeachSkill("");
    } else if (type === "learn" && newLearnSkill.trim()) {
      const clean = newLearnSkill.trim();
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-12">
      {/* Responsive Navbar */}
      <Navbar unreadCount={unreadCount} />

      {/* Main Profile Shell */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 p-5 sm:p-6 bg-slate-50/50">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950">
                Academic Profile
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Manage your student identity, bio, and reciprocal knowledge trade inventory.
              </p>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="self-start sm:self-auto cursor-pointer rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-2xs hover:bg-indigo-700 active:scale-95 transition"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Alert Messages */}
          {statusMessage && (
            <div className="mx-5 sm:mx-6 mt-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm font-medium text-emerald-800 animate-fade-in shadow-2xs">
              <span>{statusMessage}</span>
              <button type="button" onClick={() => setStatusMessage("")} className="font-bold text-emerald-900 ml-2">
                ×
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="mx-5 sm:mx-6 mt-4 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs sm:text-sm font-medium text-rose-800 animate-fade-in shadow-2xs">
              <span>{errorMessage}</span>
              <button type="button" onClick={() => setErrorMessage("")} className="font-bold text-rose-900 ml-2">
                ×
              </button>
            </div>
          )}

          {/* Body */}
          <div className="p-5 sm:p-8">
            {isEditing ? (
              /* =====================================
                 EDIT MODE FORM
              ====================================== */
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Role / Designation
                    </label>
                    <input
                      type="text"
                      name="role"
                      disabled
                      value={formData.role}
                      className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs sm:text-sm text-slate-500 outline-none cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="e.g. Department of CSE"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Semester
                    </label>
                    <input
                      type="text"
                      name="semester"
                      value={formData.semester || ""}
                      onChange={handleInputChange}
                      placeholder="e.g. 2.2, 3.1"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Phone Number (Optional)
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
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Bio & Learning Objectives
                  </label>
                  <textarea
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Describe what courses you excel in and what academic areas you want to improve..."
                    className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* Edit Skills to Teach */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-indigo-900">
                    Skills Can Teach (Strengths)
                  </label>
                  <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                    {formData.skillsToTeach.map((skill, index) => (
                      <TagBadge
                        key={index}
                        tag={skill}
                        type="teach"
                        onRemove={() => removeSkill("teach", index)}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
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
                      placeholder="Add a skill you can teach..."
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill("teach")}
                      className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Edit Skills to Learn */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-teal-900">
                    Skills Want to Learn (Target Subjects)
                  </label>
                  <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                    {formData.skillsToLearn.map((skill, index) => (
                      <TagBadge
                        key={index}
                        tag={skill}
                        type="learn"
                        onRemove={() => removeSkill("learn", index)}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
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
                      placeholder="Add a skill you want to learn..."
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill("learn")}
                      className="cursor-pointer rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={saving}
                    className="cursor-pointer rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xs hover:bg-indigo-700 active:scale-95 transition disabled:opacity-60"
                  >
                    {saving ? "Saving Changes..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="cursor-pointer rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-400 active:scale-95 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* =====================================
                 VIEW MODE
              ====================================== */
              <div className="space-y-8">
                {/* Profile Identity Bar */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 pb-6 border-b border-slate-200">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-3xl font-extrabold text-indigo-700 border-2 border-indigo-200 shadow-sm">
                    {profile.avatar}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-slate-950">
                      {profile.name}
                    </h2>
                    <p className="text-sm font-semibold text-indigo-700">
                      {profile.role} · {profile.department} (Semester {profile.semester})
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {profile.institution}
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-4 border-b border-slate-200">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      AUST Email Address
                    </span>
                    <p className="mt-1 text-sm font-semibold text-slate-900 break-all">
                      {profile.email || "student@aust.edu"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Phone Number
                    </span>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {profile.phone || "Not specified"}
                    </p>
                  </div>
                </div>

                {/* About & Bio */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    About & Academic Focus
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                    {profile.bio || "No study bio added yet. Click 'Edit Profile' to introduce what subjects you enjoy and what you want to master!"}
                  </p>
                </div>

                {/* Skills Cards Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Skills to Teach */}
                  <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/40 p-5 space-y-3">
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                        ↑
                      </span>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                        Skills I Can Teach (Strengths)
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skillsToTeach && profile.skillsToTeach.length > 0 ? (
                        profile.skillsToTeach.map((skill, idx) => (
                          <TagBadge key={idx} tag={skill} type="teach" />
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No teaching skills listed yet</span>
                      )}
                    </div>
                  </div>

                  {/* Skills to Learn */}
                  <div className="rounded-2xl border border-teal-200/80 bg-teal-50/40 p-5 space-y-3">
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-white text-[10px] font-bold">
                        ↓
                      </span>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900">
                        Skills I Want to Learn (Needs)
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skillsToLearn && profile.skillsToLearn.length > 0 ? (
                        profile.skillsToLearn.map((skill, idx) => (
                          <TagBadge key={idx} tag={skill} type="learn" />
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No learning goals listed yet</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav unreadCount={unreadCount} />
    </div>
  );
};

export default Profile;