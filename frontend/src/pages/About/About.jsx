import React from "react";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  GraduationCap,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

const features = [
  {
    icon: Users,
    title: "Student Management",
    description:
      "Manage student registration numbers, roll numbers, departments, courses and semesters.",
  },
  {
    icon: GraduationCap,
    title: "Professor Management",
    description:
      "Maintain professor information and connect teachers with their assigned subjects.",
  },
  {
    icon: CalendarCheck,
    title: "Smart Attendance",
    description:
      "Record present and absent status using lecture and registration number based tracking.",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description:
      "View attendance history, percentages and useful attendance reports.",
  },
];

const technologies = [
  "React.js",
  "Vite",
  "Tailwind CSS",
  "Python",
  "FastAPI",
  "MongoDB",
  "PyMongo",
  "JWT",
  "OTP",
];

function About({ showHeader = true }) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* =========================================================
          ANIMATED BACKGROUND
      ========================================================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl sm:h-96 sm:w-96" />

        <div
          className="absolute -right-32 top-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl sm:h-[420px] sm:w-[420px]"
          style={{ animation: "pulse 4s ease-in-out infinite" }}
        />

        <div
          className="absolute bottom-[-150px] left-[30%] h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl sm:h-[420px] sm:w-[420px]"
          style={{ animation: "pulse 5s ease-in-out infinite" }}
        />

        <span className="absolute left-[10%] top-[25%] h-2 w-2 animate-bounce rounded-full bg-blue-500/50 sm:h-3 sm:w-3" />

        <span
          className="absolute right-[15%] top-[35%] h-2 w-2 animate-ping rounded-full bg-cyan-500/60"
          style={{ animationDelay: "1s" }}
        />

        <span
          className="absolute bottom-[25%] left-[20%] h-2 w-2 animate-ping rounded-full bg-indigo-500/50"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* =========================================================
          HEADER
          Hidden when About is embedded inside AuthLayout
      ========================================================= */}
      {showHeader && (
        <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
            <Link
              to="/login"
              className="group flex min-w-0 items-center gap-2 sm:gap-3"
            >
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-600/30 transition-all duration-300 group-hover:scale-105 sm:h-11 sm:w-11 sm:rounded-2xl">
                <CalendarCheck className="h-5 w-5 sm:h-6 sm:w-6" />

                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-slate-900 dark:text-white sm:text-base">
                  Attendance
                </p>

                <p className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:block">
                  Management System
                </p>
              </div>
            </Link>

            <Link
              to="/login"
              className="group inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600 hover:shadow-lg sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-400"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />

              <span>Back to Login</span>
            </Link>
          </div>
        </header>
      )}

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative z-10">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
          {/* HERO CONTENT */}
          <div className="animate-[aboutFade_0.8s_ease-out]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-black tracking-wide text-blue-700 shadow-sm sm:px-4 sm:text-xs dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />

              SMART ATTENDANCE PLATFORM
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              Simple.

              <span className="block animate-[gradientMove_5s_ease_infinite] bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                Secure.
              </span>

              <span className="block">Smart Attendance.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8 lg:text-lg dark:text-slate-400">
              Attendance Management System is a modern college solution
              designed to make student attendance easier, faster and more
              organized for students, professors and administrators.
            </p>

            {/* FEATURE POINTS */}
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                "Registration-based tracking",
                "Professor attendance control",
                "Secure authentication",
                "Attendance analytics",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs font-bold text-slate-700 sm:text-sm dark:text-slate-300"
                  style={{
                    animation: `slideUp 0.6s ease-out ${
                      index * 100
                    }ms both`,
                  }}
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />

                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* HERO BUTTONS */}
            <div className="mt-8 flex flex-col gap-3 xs:flex-row sm:flex-row sm:flex-wrap sm:gap-4">
              {/* GET STARTED */}
              <Link
                to="/login"
                className="group relative inline-flex w-full overflow-hidden rounded-2xl p-[2px] shadow-xl shadow-blue-600/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-600/30 sm:w-auto"
              >
                <span className="absolute inset-0 animate-[gradientMove_3s_linear_infinite] bg-gradient-to-r from-blue-600 via-cyan-400 via-indigo-600 to-blue-600 bg-[length:300%_300%]" />

                <span className="relative flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-7 py-3.5 text-sm font-black text-white sm:w-auto">
                  Get Started

                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />

                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </span>
              </Link>

              {/* EXPLORE FEATURES */}
              <a
                href="#features"
                className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-blue-600 bg-blue-600 px-7 py-4 text-base font-black text-white shadow-lg shadow-blue-600/25 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 sm:w-auto dark:border-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                <span className="tracking-wide">Explore Features</span>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 transition-all duration-300 group-hover:bg-white/25">
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </a>
            </div>
          </div>

          {/* DASHBOARD ILLUSTRATION */}
          <div className="relative flex min-h-[360px] items-center justify-center sm:min-h-[430px] lg:min-h-[520px]">
            <div className="absolute h-56 w-56 animate-pulse rounded-full bg-blue-500/20 blur-3xl sm:h-72 sm:w-72" />

            <div className="absolute h-[280px] w-[280px] animate-[spin_20s_linear_infinite] rounded-full border border-blue-300/40 sm:h-[330px] sm:w-[330px] dark:border-blue-500/20" />

            <div className="absolute h-[330px] w-[330px] animate-[spin_30s_linear_infinite_reverse] rounded-full border border-dashed border-cyan-300/30 sm:h-[390px] sm:w-[390px] dark:border-cyan-500/20" />

            <div className="relative w-full max-w-[500px] animate-[floatIllustration_4s_ease-in-out_infinite]">
              <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-cyan-400/20 blur-2xl sm:-inset-4 sm:rounded-[2.5rem]" />

              <div className="relative overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/75 p-4 shadow-2xl shadow-blue-900/10 backdrop-blur-xl sm:rounded-[2rem] sm:p-6 dark:border-slate-700/70 dark:bg-slate-900/75">
                {/* DASHBOARD HEADER */}
                <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600 sm:text-xs dark:text-blue-400">
                      Dashboard
                    </p>

                    <p className="mt-1 text-base font-black text-slate-900 sm:text-xl dark:text-white">
                      Attendance Overview
                    </p>
                  </div>

                  <div className="shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 text-white shadow-lg shadow-blue-600/20 sm:p-3">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="rounded-xl bg-blue-50 p-3 sm:rounded-2xl sm:p-4 dark:bg-blue-950/40">
                    <Users className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5 dark:text-blue-400" />

                    <p className="mt-2 text-lg font-black text-slate-900 sm:mt-3 sm:text-xl dark:text-white">
                      248
                    </p>

                    <p className="text-[9px] font-medium text-slate-500 sm:text-[11px]">
                      Students
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-50 p-3 sm:rounded-2xl sm:p-4 dark:bg-emerald-950/30">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5" />

                    <p className="mt-2 text-lg font-black text-slate-900 sm:mt-3 sm:text-xl dark:text-white">
                      92%
                    </p>

                    <p className="text-[9px] font-medium text-slate-500 sm:text-[11px]">
                      Present
                    </p>
                  </div>

                  <div className="rounded-xl bg-indigo-50 p-3 sm:rounded-2xl sm:p-4 dark:bg-indigo-950/30">
                    <CalendarCheck className="h-4 w-4 text-indigo-600 sm:h-5 sm:w-5" />

                    <p className="mt-2 text-lg font-black text-slate-900 sm:mt-3 sm:text-xl dark:text-white">
                      18
                    </p>

                    <p className="text-[9px] font-medium text-slate-500 sm:text-[11px]">
                      Lectures
                    </p>
                  </div>
                </div>

                {/* CHART */}
                <div className="mt-3 rounded-xl border border-slate-100 bg-white/80 p-3 sm:mt-4 sm:rounded-2xl sm:p-5 dark:border-slate-800 dark:bg-slate-950/50">
                  <div className="flex h-28 items-end justify-between gap-2 sm:h-36 sm:gap-3">
                    {[45, 70, 55, 85, 65, 92, 76].map((height, index) => (
                      <div
                        key={index}
                        className="group relative flex h-full flex-1 items-end"
                      >
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 via-indigo-500 to-cyan-400 transition-all duration-500 group-hover:from-cyan-400 group-hover:to-blue-600"
                          style={{
                            height: `${height}%`,
                            animation: `chartGrow 1s ease-out ${
                              index * 100
                            }ms both`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECURITY */}
                <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-3 text-white shadow-lg shadow-blue-600/20 sm:mt-4 sm:gap-3 sm:rounded-2xl sm:p-4">
                  <div className="rounded-lg bg-white/15 p-2">
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold sm:text-sm">
                      Secure Attendance
                    </p>

                    <p className="truncate text-[10px] text-blue-100 sm:text-xs">
                      Protected with authentication
                    </p>
                  </div>

                  <LockKeyhole className="ml-auto h-4 w-4 shrink-0 animate-pulse sm:h-5 sm:w-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FEATURES
      ========================================================= */}
      <section
        id="features"
        className="relative z-10 border-t border-slate-200/70 bg-white/60 py-16 backdrop-blur-xl sm:py-20 dark:border-slate-800/70 dark:bg-slate-950/50"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-[10px] font-black tracking-wide text-blue-700 sm:text-xs dark:bg-blue-950/40 dark:text-blue-300">
              <Sparkles className="h-4 w-4" />

              POWERFUL FEATURES
            </span>

            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Everything you need to manage attendance
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400">
              A centralized platform designed for students, professors and
              administrators.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 sm:p-6 dark:border-slate-800 dark:bg-slate-900"
                  style={{
                    animation: `slideUp 0.7s ease-out ${
                      index * 120
                    }ms both`,
                  }}
                >
                  <div className="absolute left-0 right-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 transition-transform duration-500 group-hover:scale-x-100" />

                  <div className="relative flex h-13 w-13 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 sm:h-14 sm:w-14">
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />

                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  </div>

                  <h3 className="mt-5 text-lg font-black text-slate-900 sm:mt-6 dark:text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {feature.description}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                    Learn more

                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          TECHNOLOGIES
      ========================================================= */}
      <section className="relative z-10 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 sm:text-xs dark:text-blue-400">
            TECHNOLOGY STACK
          </span>

          <h2 className="mt-4 text-3xl font-black sm:text-4xl lg:text-5xl">
            Built with modern technologies
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400">
            A modern technology stack designed for a fast, secure and
            maintainable attendance platform.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-2.5 sm:mt-10 sm:gap-3">
            {technologies.map((technology, index) => (
              <span
                key={technology}
                className="cursor-default rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/20 sm:px-5 sm:py-2.5 sm:text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500"
                style={{
                  animation: `fadeScale 0.5s ease-out ${
                    index * 70
                  }ms both`,
                }}
              >
                {technology}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================= */}
      <section className="relative z-10 px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 p-[1px] shadow-2xl shadow-blue-900/20 sm:rounded-[2rem]">
          <div className="relative overflow-hidden rounded-[calc(1.75rem-1px)] bg-slate-950 px-5 py-12 text-center sm:rounded-[calc(2rem-1px)] sm:px-12 sm:py-14">
            <div className="absolute inset-0 animate-[gradientMove_6s_ease_infinite] bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-cyan-500/20 bg-[length:300%_300%]" />

            <div className="relative">
              <div className="mx-auto flex h-14 w-14 animate-bounce items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-xl shadow-blue-500/30 sm:h-16 sm:w-16">
                <GraduationCap className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>

              <h2 className="mt-5 text-2xl font-black text-white sm:mt-6 sm:text-4xl">
                Ready to manage attendance smarter?
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Login to your account and start managing students, professors
                and attendance from one centralized platform.
              </p>

              <Link
                to="/login"
                className="group relative mt-7 inline-flex w-full max-w-xs overflow-hidden rounded-2xl p-[2px] sm:mt-8 sm:w-auto sm:max-w-none"
              >
                <span className="absolute inset-0 animate-[gradientMove_2.5s_linear_infinite] bg-gradient-to-r from-cyan-300 via-blue-500 via-indigo-500 to-cyan-300 bg-[length:300%_300%]" />

                <span className="relative flex w-full items-center justify-center gap-2 rounded-[14px] bg-white px-7 py-3.5 text-sm font-black text-blue-700 transition-all duration-300 group-hover:bg-slate-100">
                  Login to Dashboard

                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          UNIQUE FOOTER
      ========================================================= */}
      <footer className="relative z-10 overflow-hidden border-t border-slate-200/70 bg-white/80 dark:border-slate-800/70 dark:bg-slate-950/90">
        {/* TOP GLOW */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-6 pt-12 sm:px-6 sm:pt-14 lg:px-8">
          {/* FOOTER MAIN */}
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
            {/* BRAND */}
            <div>
              <Link
                to="/login"
                className="group inline-flex items-center gap-3"
              >
                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-xl shadow-blue-600/25 transition-all duration-300 group-hover:scale-105">
                  <CalendarCheck className="h-6 w-6" />

                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </div>

                <div>
                  <p className="text-base font-black text-slate-900 dark:text-white">
                    Attendance
                  </p>

                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Management System
                  </p>
                </div>
              </Link>

              <p className="mt-5 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">
                A smart academic attendance platform designed to simplify
                student, professor and attendance management through a
                centralized digital system.
              </p>

              {/* STATUS */}
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>

                System Ready
              </div>
            </div>

            {/* QUICK LINKS */}
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Quick Links
              </h3>

              <div className="mt-5 space-y-3">
                <a
                  href="#features"
                  className="group flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  Features
                </a>

                <a
                  href="#features"
                  className="group flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  Attendance
                </a>

                <Link
                  to="/login"
                  className="group flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  Login
                </Link>
              </div>
            </div>

            {/* SYSTEM */}
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                System
              </h3>

              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Secure Authentication
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                      JWT & OTP protected
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                    <MapPin className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Academic Platform
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                      Built for modern colleges
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-cyan-50 p-2 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400">
                    <Mail className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Digital Support
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                      Centralized management
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="my-8 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700" />

          {/* BOTTOM FOOTER */}
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div>
              <p className="text-xs font-semibold text-slate-500 sm:text-sm dark:text-slate-400">
                © 2026 Attendance Management System
              </p>

              <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
                Built for modern academic attendance management
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-500 sm:text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                React.js
              </span>

              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-500 sm:text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                FastAPI
              </span>

              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-500 sm:text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                MongoDB
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================
          ANIMATIONS
      ========================================================= */}
      <style>{`
        @keyframes aboutFade {
          from {
            opacity: 0;
            transform: translateY(30px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes floatIllustration {
          0%,
          100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-14px);
          }
        }

        @keyframes chartGrow {
          from {
            height: 0;
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }

          100% {
            background-position: 0% 50%;
          }
        }

        @media (max-width: 640px) {
          html {
            scroll-behavior: smooth;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </main>
  );
}

export default About;