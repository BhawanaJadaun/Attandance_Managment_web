
import React, { useMemo, useState } from "react";
import {
  Bell,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  UserX,
  Users,
  ClipboardCheck,
  ArrowUpRight,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useStudents } from "../../context/StudentContext";
import { useAttendance } from "../../context/AttendanceContext";

export default function Dashboard() {
  const navigate = useNavigate();

  const { students = [] } = useStudents();
  const { attendance = [] } = useAttendance();

  const [range, setRange] = useState("7");
  const [notificationOpen, setNotificationOpen] = useState(false);

  /* =========================================================
     TODAY
  ========================================================= */

  const todayDate = new Date().toISOString().split("T")[0];

  /* =========================================================
     TODAY ATTENDANCE
  ========================================================= */

  const todayRecords = useMemo(() => {
    return attendance.filter(
      (record) => record?.date === todayDate
    );
  }, [attendance, todayDate]);

  const presentToday = todayRecords.filter(
    (record) => record?.present === true
  ).length;

  const absentToday = todayRecords.filter(
    (record) => record?.present === false
  ).length;

  const lateToday = 0;

  const totalToday =
    presentToday + absentToday + lateToday;

  const attendancePercentage =
    totalToday > 0
      ? Math.round((presentToday / totalToday) * 100)
      : 0;

  /* =========================================================
     LAST 7 / 14 / 30 DAYS
  ========================================================= */

  const chartData = useMemo(() => {
    const numberOfDays = Number(range);

    return Array.from(
      { length: numberOfDays },
      (_, index) => {
        const date = new Date();

        date.setDate(
          date.getDate() -
            (numberOfDays - 1 - index)
        );

        const dateString = date
          .toISOString()
          .split("T")[0];

        const recordsForDay = attendance.filter(
          (record) =>
            record?.date === dateString
        );

        const present = recordsForDay.filter(
          (record) =>
            record?.present === true
        ).length;

        const absent = recordsForDay.filter(
          (record) =>
            record?.present === false
        ).length;

        const total = present + absent;

        const percentage =
          total > 0
            ? Math.round((present / total) * 100)
            : 0;

        return {
          date: dateString,
          day: date.toLocaleDateString(
            "en-US",
            {
              weekday: "short",
            }
          ),
          shortDate:
            date.toLocaleDateString(
              "en-US",
              {
                day: "numeric",
                month: "short",
              }
            ),
          present,
          absent,
          total,
          percentage,
        };
      }
    );
  }, [attendance, range]);

  /* =========================================================
     STAT CARDS
  ========================================================= */

  const stats = [
    {
      title: "Total Students",
      value: students.length,
      icon: Users,
      iconClass:
        "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300",
    },
    {
      title: "Present Today",
      value: presentToday,
      percentage:
        totalToday > 0
          ? `${Math.round(
              (presentToday / totalToday) * 100
            )}%`
          : "0%",
      icon: CheckCircle2,
      iconClass:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300",
    },
    {
      title: "Absent Today",
      value: absentToday,
      percentage:
        totalToday > 0
          ? `${Math.round(
              (absentToday / totalToday) * 100
            )}%`
          : "0%",
      icon: UserX,
      iconClass:
        "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300",
    },
    {
      title: "Late Today",
      value: lateToday,
      percentage: "0%",
      icon: Clock3,
      iconClass:
        "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300",
    },
  ];

  /* =========================================================
     QUICK ACTIONS
  ========================================================= */

  const quickActions = [
    {
      title: "Take Attendance",
      description: "Mark today's attendance",
      icon: ClipboardCheck,
      path: "/attendance/take",
    },
    {
      title: "Add Student",
      description: "Register a new student",
      icon: Plus,
      path: "/students/add",
    },
    {
      title: "Attendance History",
      description: "View attendance records",
      icon: CalendarCheck,
      path: "/attendance/history",
    },
    {
      title: "View Reports",
      description: "Generate attendance reports",
      icon: FileText,
      path: "/reports",
    },
  ];

  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  const notifications = [
    {
      id: 1,
      title: "Attendance Update",
      message:
        presentToday > 0
          ? `${presentToday} student(s) marked present today.`
          : "No attendance has been marked today.",
      time: "Today",
    },
    {
      id: 2,
      title: "Student Summary",
      message: `${students.length} student(s) currently registered.`,
      time: "Today",
    },
  ];

  return (
    <main className="min-h-full w-full bg-slate-50 p-4 text-slate-900 transition-colors duration-200 sm:p-5 lg:p-6 xl:p-7 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto w-full max-w-[1600px]">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="relative mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Welcome back! Here's what's happening today.
            </p>
          </div>

          {/* =================================================
              NOTIFICATION
          ================================================= */}

          <div className="relative self-end sm:self-auto">

            <button
              type="button"
              onClick={() =>
                setNotificationOpen(
                  (previous) => !previous
                )
              }
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              title="Notifications"
            >
              <Bell size={19} />

              {/* Notification dot */}
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800" />
            </button>

            {/* Notification Panel */}

            {notificationOpen && (
              <div className="absolute right-0 top-12 z-50 w-[calc(100vw-32px)] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">

                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700">

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Notifications
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Latest dashboard updates
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setNotificationOpen(false)
                    }
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto">

                  {notifications.map(
                    (notification) => (
                      <div
                        key={notification.id}
                        className="border-b border-slate-100 p-4 last:border-b-0 dark:border-slate-700"
                      >
                        <div className="flex gap-3">

                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                            <Bell size={15} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {notification.title}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                              {notification.message}
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                              {notification.time}
                            </p>
                          </div>

                        </div>
                      </div>
                    )
                  )}

                </div>
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            STAT CARDS
        ===================================================== */}

        <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex items-center gap-4">

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconClass}`}
                  >
                    <Icon size={21} />
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                      {stat.title}
                    </p>

                    <div className="mt-1 flex items-center gap-2">

                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {stat.value}
                      </h2>

                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {stat.percentage}
                      </span>

                    </div>

                  </div>
                </div>
              </div>
            );
          })}

        </section>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">

          {/* ===================================================
              ATTENDANCE OVERVIEW
          =================================================== */}

          <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">

            {/* Header */}

            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 dark:border-slate-700">

              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Attendance Overview
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Attendance percentage for recent days
                </p>
              </div>

              <select
                value={range}
                onChange={(event) =>
                  setRange(event.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:w-auto dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="7">
                  Last 7 Days
                </option>

                <option value="14">
                  Last 14 Days
                </option>

                <option value="30">
                  Last 30 Days
                </option>
              </select>

            </div>

            {/* Chart */}

            <div className="overflow-x-auto">

              <div
                className="flex min-w-[560px] items-end gap-2 px-4 py-5 sm:gap-3 sm:px-5"
                style={{ height: "310px" }}
              >

                {chartData.map((item) => {

                  const height =
                    item.percentage === 0
                      ? 5
                      : Math.max(
                          8,
                          (item.percentage / 100) *
                            200
                        );

                  return (
                    <div
                      key={item.date}
                      className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                    >

                      {/* Percentage */}

                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-300 sm:text-xs">
                        {item.percentage}%
                      </span>

                      {/* Bar */}

                      <div className="flex h-[210px] w-full items-end justify-center">

                        <div
                          className="w-6 rounded-t-lg bg-indigo-500 transition-all duration-500 hover:bg-indigo-600 sm:w-8"
                          style={{
                            height: `${height}px`,
                          }}
                          title={`${item.shortDate}: ${item.percentage}% attendance`}
                        />

                      </div>

                      {/* Day */}

                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 sm:text-xs">
                        {item.day}
                      </span>

                    </div>
                  );
                })}

              </div>
            </div>

            {/* Summary */}

            <div className="border-t border-slate-100 px-4 py-4 dark:border-slate-700 sm:px-5">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Today's Attendance
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                    {attendancePercentage}%
                  </p>
                </div>

                <div className="w-full sm:max-w-xs">

                  <div className="mb-1 flex justify-between text-xs">

                    <span className="text-slate-500 dark:text-slate-400">
                      Present
                    </span>

                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {presentToday}
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">

                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{
                        width: `${attendancePercentage}%`,
                      }}
                    />

                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ===================================================
              QUICK ACTIONS
          =================================================== */}

          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">

            <div className="border-b border-slate-100 p-4 dark:border-slate-700 sm:p-5">

              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Quick Actions
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Frequently used actions
              </p>

            </div>

            <div className="grid grid-cols-1 gap-3 p-4 sm:p-5">

              {quickActions.map(
                (action) => {

                  const Icon = action.icon;

                  return (
                    <button
                      key={action.title}
                      type="button"
                      onClick={() =>
                        navigate(action.path)
                      }
                      className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-500/50 dark:hover:bg-slate-700"
                    >

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {action.title}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                          {action.description}
                        </p>

                      </div>

                      <ArrowUpRight
                        size={16}
                        className="shrink-0 text-slate-400 transition group-hover:text-indigo-500 dark:text-slate-500 dark:group-hover:text-indigo-300"
                      />

                    </button>
                  );
                }
              )}

            </div>
          </div>

        </section>

        {/* =====================================================
            TODAY SUMMARY
        ===================================================== */}

        <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Present */}

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Present
                </p>

                <p className="mt-1 text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                  {presentToday}
                </p>
              </div>

              <CheckCircle2
                size={25}
                className="text-emerald-600 dark:text-emerald-400"
              />

            </div>
          </div>

          {/* Absent */}

          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/30">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-medium text-red-700 dark:text-red-300">
                  Absent
                </p>

                <p className="mt-1 text-2xl font-bold text-red-800 dark:text-red-200">
                  {absentToday}
                </p>
              </div>

              <UserX
                size={25}
                className="text-red-600 dark:text-red-400"
              />

            </div>
          </div>

          {/* Attendance */}

          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/30">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                  Attendance Rate
                </p>

                <p className="mt-1 text-2xl font-bold text-indigo-800 dark:text-indigo-200">
                  {attendancePercentage}%
                </p>
              </div>

              <CalendarCheck
                size={25}
                className="text-indigo-600 dark:text-indigo-400"
              />

            </div>
          </div>

        </section>

      </div>
    </main>
  );
}

