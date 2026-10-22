import React from "react";
import { Outlet, Link } from "react-router-dom";
import About from "../../pages/About/About";
import { useTheme } from "../../context/ThemeContext";
import {
  ShieldCheck,
  Users,
   Sun,
  Moon,
  GraduationCap,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ChevronDown,
} from "lucide-react";

function AuthLayout() {
  const { darkMode, toggleTheme } = useTheme();
  const features = [
    {
      icon: Users,
      title: "Student Management",
      text: "Manage students and registration records.",
    },
    {
      icon: GraduationCap,
      title: "Professor Workflow",
      text: "Create lectures and mark attendance.",
    },
    {
      icon: BarChart3,
      title: "Attendance Analytics",
      text: "Track attendance and generate reports.",
    },
  ];

  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* =====================================================
          AUTHENTICATION SECTION
      ===================================================== */}
      <section className="relative min-h-screen overflow-hidden">
        {/* ================= GLOBAL THEME TOGGLE ================= */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          className="
    fixed right-5 top-5 z-[100]
    flex h-11 w-11 items-center justify-center
    rounded-full
    border border-white/30
    bg-white/20
    text-slate-700
    shadow-lg shadow-slate-900/10
    backdrop-blur-xl
    transition-all duration-300
    hover:scale-110
    hover:bg-white/30
    dark:border-white/10
    dark:bg-slate-800/60
    dark:text-yellow-300
    dark:hover:bg-slate-700/70
  "
        >
          {darkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
        {/* ================= BACKGROUND ================= */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative grid min-h-screen lg:grid-cols-2">
          {/* =====================================================
              LEFT BRANDING
          ===================================================== */}
          <section className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
            {/* Animated border */}
            <div className="pointer-events-none absolute inset-3 rounded-[2rem] border border-white/10" />

            {/* Decorative circles */}
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />

            <div className="absolute right-10 top-20 h-44 w-44 rounded-full border border-white/10" />

            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/5" />

            {/* ================= LOGO ================= */}
            <div className="relative z-10">
              <Link
                to="/login"
                className="inline-flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xl shadow-blue-950/20">
                  <ShieldCheck className="h-7 w-7 text-blue-600" />
                </div>

                <div>
                  <p className="text-sm font-bold tracking-wide">ATTENDANCE</p>

                  <p className="text-xs text-blue-100">Management System</p>
                </div>
              </Link>
            </div>

            {/* ================= MAIN CONTENT ================= */}
            <div className="relative z-10 max-w-xl">
              {/* Badge */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
                <Sparkles className="h-4 w-4" />
                Smart Attendance Platform
              </div>

              {/* Heading */}
              <h1 className="text-4xl font-extrabold leading-tight xl:text-5xl">
                Manage attendance
                <span className="block text-blue-100">smarter and faster.</span>
              </h1>

              {/* Description */}
              <p className="mt-5 max-w-lg text-base leading-7 text-blue-100 xl:text-lg">
                A secure attendance management platform designed for students,
                professors and administrators.
              </p>

              {/* ================= FEATURES ================= */}
              <div className="mt-8 grid gap-3">
                {features.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md transition-all duration-300 hover:translate-x-2 hover:border-white/20 hover:bg-white/15"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold">{item.title}</p>

                        <p className="mt-1 text-sm text-blue-100">
                          {item.text}
                        </p>
                      </div>

                      <ArrowRight className="h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                    </div>
                  );
                })}
              </div>

              {/* ================= ABOUT SCROLL BUTTON ================= */}
              <button
                type="button"
                onClick={scrollToAbout}
                className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white/90 transition hover:text-white"
              >
                Learn more about the system
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>

            {/* ================= BOTTOM ================= */}
            <div className="relative z-10 flex items-center gap-2 text-sm text-blue-100">
              <CheckCircle2 className="h-4 w-4" />
              Secure role-based attendance management
            </div>
          </section>

          {/* =====================================================
              RIGHT AUTH AREA
          ===================================================== */}
          <section className="relative flex min-h-screen items-center justify-center px-4 pb-10 pt-24 sm:px-6 lg:px-10 lg:py-10">
            {/* ================= MOBILE BRANDING ================= */}
            <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-5 lg:hidden">
              <Link to="/login" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Attendance
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Management System
                  </p>
                </div>
              </Link>

              {/* Mobile About Scroll */}
              <button
                type="button"
                onClick={scrollToAbout}
                className="text-sm font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400"
              >
                About
              </button>
            </div>

            {/* ================= RIGHT IMAGE ================= */}
            <div className="pointer-events-none absolute bottom-8 right-8 hidden xl:block">
              <div className="auth-image-glow absolute inset-0 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative h-48 w-48 overflow-hidden rounded-[2rem] border border-blue-200/70 bg-white/70 p-3 shadow-2xl shadow-blue-500/10 backdrop-blur dark:border-blue-900/60 dark:bg-slate-900/70">
                <img
                  src="/images/auth-illustration.png"
                  alt="Attendance management illustration"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            {/* ================= AUTH PAGE ================= */}
            <div className="relative z-10 w-full max-w-md animate-[authFade_0.5s_ease-out]">
              <Outlet />
            </div>
          </section>
        </div>
      </section>

      {/* =====================================================
          BOTTOM GLASS SCROLL ICON
      ===================================================== */}
      <div className="relative z-30 flex justify-center -mt-10 pb-8 lg:-mt-12 lg:pb-10">
        <button
          type="button"
          onClick={scrollToAbout}
          aria-label="Scroll to About"
          className="group relative flex h-16 w-16 items-center justify-center"
        >
          {/* Outer glow */}
          <span className="absolute -inset-4 rounded-full bg-blue-500/10 blur-xl transition-all duration-500 group-hover:bg-cyan-400/25 group-hover:blur-2xl" />

          {/* Glass circle */}
          <span
            className="
              relative flex h-16 w-16 items-center justify-center
              rounded-full
              border border-white/60
              bg-white/40
              shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_8px_30px_rgba(15,23,42,0.15)]
              backdrop-blur-xl
              backdrop-saturate-150
              transition-all duration-500
              group-hover:-translate-y-2
              group-hover:scale-110
              group-hover:border-blue-300/80
              group-hover:bg-white/55
            "
          >
            {/* Glass shine */}
            <span className="absolute left-2 top-1 h-5 w-8 rotate-[-25deg] rounded-full bg-white/50 blur-md" />

            {/* Small inner glow */}
            <span className="absolute inset-2 rounded-full border border-white/20" />

            {/* Arrow */}
            <ChevronDown
              className="
                relative z-10 h-9 w-9
                animate-bounce
                text-blue-600
                drop-shadow-[0_2px_5px_rgba(37,99,235,0.25)]
                transition-all duration-500
                group-hover:scale-125
                group-hover:text-cyan-500
              "
              strokeWidth={2.5}
            />
          </span>
        </button>
      </div>

      {/* =====================================================
          ABOUT SECTION
      ===================================================== */}
      <section id="about">
        <About showHeader={false} />
      </section>
    </main>
  );
}

export default AuthLayout;
