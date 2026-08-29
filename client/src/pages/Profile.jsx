import React, { useState } from "react";
import { Link } from "react-router-dom";

/* Standard Topic Taxonomy from README / Shared State */
const availableTopics = [
  "C Programming",
  "C++",
  "C++ Graph Algorithms",
  "Data Structures",
  "Algorithms",
  "Java",
  "Python",
  "Python for Machine Learning",
  "React",
  "React UI",
  "React Hooks",
  "JavaScript",
  "HTML",
  "CSS",
  "Database Design",
  "SQL",
  "MongoDB",
  "Node.js",
  "Express.js",
  "Machine Learning",
  "Artificial Intelligence",
  "Computer Architecture",
  "Operating Systems",
  "Computer Networks",
  "CAE",
];

/* Tag Selector Sub-component */
const TagManager = ({ label, description, badgeColor, selectedTags, setSelectedTags }) => {
  const [input, setInput] = useState("");

  const filteredTopics = availableTopics.filter(
    (topic) =>
      topic.toLowerCase().includes(input.toLowerCase()) &&
      !selectedTags.includes(topic)
  );

  const addTag = (topic) => {
    if (!selectedTags.includes(topic)) {
      setSelectedTags([...selectedTags, topic]);
    }
    setInput("");
  };

  const removeTag = (topic) => {
    setSelectedTags(selectedTags.filter((t) => t !== topic));
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-semibold text-slate-900">{label}</label>
        <p className="text-xs text-slate-500">{description}</p>
      </div>

      {/* Tag Badges */}
      <div className="flex flex-wrap gap-2 min-h-9.5 p-2 bg-slate-50 border border-slate-200 rounded-lg">
        {selectedTags.length === 0 && (
          <span className="text-xs text-slate-400 self-center px-1">No tags selected yet.</span>
        )}
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:opacity-75 font-bold"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Autocomplete Search */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search and add standardized tags..."
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />

        {input && filteredTopics.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
            {filteredTopics.slice(0, 5).map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => addTag(topic)}
                className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
              >
                {topic}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Profile = () => {
  // Mock initial user state based on User Schema in README
  const [profile, setProfile] = useState({
    name: "Shirsha Chowdhury",
    department: "CSE",
    semester: "2.2",
    email: "shirsha@aust.edu",
    contextBio:
      "I am comfortable with C++ memory management and graphs, but I need someone to explain React state for my web project.",
  });

  const [strongTags, setStrongTags] = useState(["C++", "C++ Graph Algorithms", "Data Structures"]);
  const [weakTags, setWeakTags] = useState(["React", "React UI"]);

  const [savedMessage, setSavedMessage] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated User Document:", { ...profile, strongTags, weakTags });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="text-2xl font-bold tracking-tight text-slate-950">
            Skill<span className="text-indigo-600">Bridge</span>
          </Link>

          <nav className="flex items-center gap-4 md:gap-8">
            <Link to="/dashboard" className="text-sm font-semibold text-slate-600 transition hover:text-indigo-600">
              Topics
            </Link>
            <Link to="/history" className="text-sm font-semibold text-slate-600 transition hover:text-indigo-600">
              History
            </Link>
            <Link to="/profile" className="text-sm font-semibold text-indigo-600">
              Profile
            </Link>
          </nav>

          <Link
            to="/"
            className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 active:scale-95 sm:px-4 sm:py-2 sm:text-sm"
          >
            Log Out
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-4xl px-6 py-10">
        
        {/* Intro Banner */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-3xl font-bold text-indigo-600 border border-indigo-100">
            {profile.name ? profile.name.charAt(0) : "U"}
          </div>
          <div className="text-center sm:text-left">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
              Student Profile
            </span>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">{profile.name}</h1>
            <p className="text-sm text-slate-500">
              Department of {profile.department} · Semester {profile.semester} · {profile.email}
            </p>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* General Information */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Academic & Personal Identity</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">AUST Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department</label>
                <select
                  name="department"
                  value={profile.department}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="CSE">CSE</option>
                  <option value="EEE">EEE</option>
                  <option value="CE">CE</option>
                  <option value="TE">TE</option>
                  <option value="ME">ME</option>
                  <option value="IPE">IPE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Semester</label>
                <select
                  name="semester"
                  value={profile.semester}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="1.1">1.1</option>
                  <option value="1.2">1.2</option>
                  <option value="2.1">2.1</option>
                  <option value="2.2">2.2</option>
                  <option value="3.1">3.1</option>
                  <option value="3.2">3.2</option>
                  <option value="4.1">4.1</option>
                  <option value="4.2">4.2</option>
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Context Bio (Academic Needs & Strengths)
              </label>
              <textarea
                name="contextBio"
                rows="3"
                value={profile.contextBio}
                onChange={handleInputChange}
                placeholder="Give peers human context about what you're working on..."
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Skill Inventory / MongoDB Tags */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Skill Inventory & Taxonomy</h2>
              <p className="text-xs text-slate-500 mt-1">
                These standardized tags are directly evaluated by the SkillBridge reciprocal matching engine.
              </p>
            </div>

            {/* Strong Tags */}
            <TagManager
              label="Strong Tags (What You Can Teach)"
              description="Topics you excel in and can comfortably explain to peers."
              badgeColor="bg-emerald-50 text-emerald-700 border border-emerald-200"
              selectedTags={strongTags}
              setSelectedTags={setStrongTags}
            />

            <div className="border-t border-slate-100" />

            {/* Weak Tags */}
            <TagManager
              label="Weak Tags (What You Need to Learn)"
              description="Roadblock topics where you require dedicated one-on-one help."
              badgeColor="bg-indigo-50 text-indigo-700 border border-indigo-200"
              selectedTags={weakTags}
              setSelectedTags={setWeakTags}
            />
          </div>

          {/* Submission Feedback */}
          {savedMessage && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 text-center">
              Profile updated successfully!
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-700 active:scale-[0.98]"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-slate-500">
          © 2026 SkillBridge · Learn together. Grow together.
        </div>
      </footer>
    </div>
  );
};

export default Profile;