import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user, loading, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* =====================================
          HEADER
      ====================================== */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4">
          <Link to="/" className="flex items-center gap-2 group text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-base shadow-sm group-hover:bg-indigo-700 transition-colors">
              SB
            </span>
            <span>
              Skill<span className="text-indigo-600">Bridge</span>
            </span>
          </Link>

          {/* Desktop Auth Controls */}
          <nav className="hidden sm:flex items-center gap-3">
            {!loading && user ? (
              <>
                <span className="text-xs font-semibold text-slate-600">
                  Welcome, <strong className="text-slate-900">{user.fullName?.split(' ')[0]}</strong>
                </span>
                <Link
                  to="/dashboard"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-2xs hover:bg-indigo-700 active:scale-95 transition"
                >
                  Go to Dashboard →
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-2xs hover:bg-indigo-700 active:scale-95 transition"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            {!loading && user ? (
              <Link
                to="/dashboard"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs"
              >
                Dashboard →
              </Link>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* =====================================
          HERO SECTION
      ====================================== */}
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20 lg:py-24">
          <div className="flex flex-col items-center text-center rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-12 lg:p-16 shadow-xs relative overflow-hidden">
            {/* Background gradient blur */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />

            <span className="relative mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-700 border border-indigo-100 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
              Reciprocal University Academic Exchange
            </span>

            <h1 className="relative mb-4 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 max-w-3xl leading-[1.15]">
              Exchange Knowledge with Campus Peers.
            </h1>

            <p className="relative max-w-2xl text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600 mb-8">
              Connect with fellow students for reciprocal academic growth. Trade your academic strengths, learn tough subjects from classmates, and build a lasting skill inventory.
            </p>

            <div className="relative flex flex-col sm:flex-row gap-3 justify-center w-full sm:w-auto">
              {!loading && user ? (
                <Link
                  to="/dashboard"
                  className="rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition text-center"
                >
                  Enter Your Dashboard →
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition text-center"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className="rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 hover:border-slate-400 active:scale-95 transition text-center"
                  >
                    Log In with AUST Email
                  </Link>
                </>
              )}
            </div>

            {/* Quick Demo Preview Stats */}
            <div className="relative mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl pt-8 border-t border-slate-100">
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-indigo-600">100%</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Reciprocal Trade</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900">2-Way</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Cycle-2 Matching</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900">Standard</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Course Taxonomies</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-teal-600">Zero Cost</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Free Peer Mentoring</p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================
            FEATURES GRID
        ====================================== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xl border border-indigo-100">
                ⇄
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2">
                Reciprocal Matching Engine
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                Guaranteed mutual learning balance. You only match with peers who want what you can teach and offer what you need to learn.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700 font-bold text-xl border border-teal-100">
                #
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2">
                Standardized Topics
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                Curated academic course tags across Data Structures, Algorithms, Systems, AI, and Software Engineering for precision pairing.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xl border border-indigo-100">
                ✓
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2">
                Seamless Study Chat
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                In-app messaging to coordinate study sessions, share study resources, and track past exchange sessions seamlessly.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================
          FOOTER
      ====================================== */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 SkillBridge · Peer Knowledge Sharing for Academic Excellence.</p>
          <div className="flex gap-4 font-medium text-slate-600">
            <Link to="/login" className="hover:text-indigo-600">Log In</Link>
            <Link to="/register" className="hover:text-indigo-600">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;