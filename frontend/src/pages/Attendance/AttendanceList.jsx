
import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ClipboardCheck,
  Eye,
  Search,
  Users,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as attendanceServiceModule from "../../services/attendanceService";
import toast from "react-hot-toast";

const AttendanceList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Support either a named or default attendanceService export.
  const getAttendanceService = () => {
    const service =
      attendanceServiceModule.attendanceService ??
      attendanceServiceModule.default ??
      attendanceServiceModule;

    if (typeof service.getAll !== "function") {
      throw new Error(
        "attendanceService must export a getAll() function."
      );
    }

    return service;
  };

  // Convert backend snake_case fields to the names used by this UI.
  const normalizeRecord = (record = {}) => ({
    ...record,
    id: String(record.id ?? record._id ?? ""),
    lectureCode: String(
      record.lectureCode ?? record.lecture_code ?? ""
    ),
    date: String(
      record.date ??
        record.attendance_date ??
        record.lecture_date ??
        ""
    ).slice(0, 10),
    startTime: record.startTime ?? record.start_time ?? "",
    endTime: record.endTime ?? record.end_time ?? "",
    subjectCode: String(
      record.subjectCode ?? record.subject_code ?? ""
    ),
    subjectName: String(
      record.subjectName ?? record.subject_name ?? ""
    ),
    professorName: String(
      record.professorName ??
        record.professor_name ??
        record.teacher_name ??
        ""
    ),
    course: String(record.course ?? ""),
    department: String(record.department ?? ""),
    semester: String(record.semester ?? ""),
    registrationNo: String(
      record.registrationNo ??
        record.registration_number ??
        ""
    ),
    rollNo: String(
      record.rollNo ??
        record.roll_number ??
        record.roll_no ??
        ""
    ),
    studentName: String(
      record.studentName ??
        record.student_name ??
        record.full_name ??
        ""
    ),
    present: record.present === true,
  });

  // Fetch attendance from FastAPI/MongoDB.
  const loadAttendance = async (showNotification = false) => {
    setLoading(true);
    setError("");

    try {
      const service = getAttendanceService();
      const response = await service.getAll();

      const list = Array.isArray(response)
        ? response
        : response?.records ??
          response?.attendance ??
          response?.data ??
          response?.items ??
          [];

      if (!Array.isArray(list)) {
        throw new Error(
          "The attendance API returned an unexpected response."
        );
      }

      setRecords(list.map(normalizeRecord));

      if (showNotification) {
        toast.success("Attendance records refreshed.");
      }
    } catch (err) {
      const message =
        err?.message || "Unable to load attendance records.";

      setError(message);
      setRecords([]);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
    // Load records when this page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Group individual student attendance rows into lecture records.
  const groupedRecords = useMemo(() => {
    const groups = new Map();

    records.forEach((record) => {
      const lectureCode = record.lectureCode || "UNKNOWN";
      const date = record.date || "Unknown date";
      const key = `${lectureCode}::${date}`;

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          lectureCode,
          date,
          startTime: record.startTime,
          endTime: record.endTime,
          subjectCode: record.subjectCode,
          subjectName: record.subjectName,
          professorName: record.professorName,
          course: record.course,
          department: record.department,
          semester: record.semester,
          records: [],
        });
      }

      const group = groups.get(key);

      // Fill metadata if a later row contains a value missing from the first.
      group.startTime ||= record.startTime;
      group.endTime ||= record.endTime;
      group.subjectCode ||= record.subjectCode;
      group.subjectName ||= record.subjectName;
      group.professorName ||= record.professorName;
      group.course ||= record.course;
      group.department ||= record.department;
      group.semester ||= record.semester;

      group.records.push(record);
    });

    return Array.from(groups.values()).sort((a, b) => {
      const dateComparison = b.date.localeCompare(a.date);
      return dateComparison || a.lectureCode.localeCompare(b.lectureCode);
    });
  }, [records]);

  // Search by lecture, subject, professor, course or department.
  const filteredRecords = useMemo(() => {
    const text = search.trim().toLowerCase();

    if (!text) return groupedRecords;

    return groupedRecords.filter((item) =>
      [
        item.lectureCode,
        item.subjectCode,
        item.subjectName,
        item.professorName,
        item.course,
        item.department,
        item.semester,
        item.date,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(text)
      )
    );
  }, [groupedRecords, search]);

  const getCounts = (item) => {
    const total = item.records.length;
    const present = item.records.filter(
      (record) => record.present === true
    ).length;
    const absent = item.records.filter(
      (record) => record.present === false
    ).length;
    const percentage =
      total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, percentage };
  };

  const openHistory = (item) => {
    navigate(
      `/attendance/history?lecture=${encodeURIComponent(
        item.lectureCode
      )}&date=${encodeURIComponent(item.date)}`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Attendance Records
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View attendance saved for each lecture.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadAttendance(true)}
              disabled={loading}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => navigate("/attendance/take")}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <ClipboardCheck size={17} />
              Take Attendance
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lecture, subject or professor..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Records */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ClipboardCheck size={19} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">
                  Lecture Records
                </h2>
                <p className="text-xs text-slate-500">
                  {filteredRecords.length} lecture record(s)
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
              <Users size={16} />
              {records.length} student attendance row(s)
            </div>
          </div>

          {loading ? (
            <div className="px-5 py-16 text-center">
              <RefreshCw
                size={26}
                className="mx-auto animate-spin text-blue-600"
              />
              <p className="mt-3 text-sm text-slate-500">
                Loading attendance records...
              </p>
            </div>
          ) : error && records.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <ClipboardCheck
                size={28}
                className="mx-auto text-red-400"
              />
              <h3 className="mt-4 font-semibold text-slate-800">
                Unable to load attendance
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {error}
              </p>
              <button
                type="button"
                onClick={() => loadAttendance()}
                className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <ClipboardCheck size={25} />
              </div>
              <h3 className="mt-4 font-semibold text-slate-800">
                {search
                  ? "No matching attendance records"
                  : "No attendance records"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {search
                  ? "Try a different search term."
                  : "Take attendance for a lecture to create records."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      {[
                        "Lecture",
                        "Subject",
                        "Professor",
                        "Date",
                        "Attendance",
                        "Action",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRecords.map((item) => {
                      const {
                        total,
                        present,
                        absent,
                        percentage,
                      } = getCounts(item);

                      return (
                        <tr
                          key={item.key}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="px-5 py-4">
                            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              {item.lectureCode}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {item.course}
                              {item.semester
                                ? ` · Sem ${item.semester}`
                                : ""}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-slate-800">
                              {item.subjectName || "—"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.subjectCode || "—"}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {item.professorName || "—"}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <CalendarDays size={15} />
                              {item.date}
                            </div>
                            {item.startTime && item.endTime && (
                              <p className="mt-1 text-xs text-slate-400">
                                {item.startTime} – {item.endTime}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-emerald-600">
                                {present}/{total}
                              </span>
                              <span className="text-xs text-slate-400">
                                ({percentage}%)
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              {absent} absent
                            </p>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => openHistory(item)}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <Eye size={15} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 p-4 md:hidden">
                {filteredRecords.map((item) => {
                  const {
                    total,
                    present,
                    absent,
                    percentage,
                  } = getCounts(item);

                  return (
                    <div
                      key={item.key}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            {item.lectureCode}
                          </span>
                          <h3 className="mt-3 font-semibold text-slate-900">
                            {item.subjectName || "Subject not available"}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.subjectCode || "—"} ·{" "}
                            {item.professorName || "Professor not available"}
                          </p>
                        </div>

                        <button
                          type="button"
                          aria-label={`View attendance for ${item.lectureCode}`}
                          onClick={() => openHistory(item)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          <Eye size={16} />
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-[11px] text-slate-500">
                            Date
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {item.date}
                          </p>
                        </div>

                        <div className="rounded-lg bg-emerald-50 p-3">
                          <p className="text-[11px] text-emerald-600">
                            Present
                          </p>
                          <p className="mt-1 text-sm font-semibold text-emerald-700">
                            {present}/{total} ({percentage}%)
                          </p>
                        </div>

                        <div className="rounded-lg bg-red-50 p-3">
                          <p className="text-[11px] text-red-600">
                            Absent
                          </p>
                          <p className="mt-1 text-sm font-semibold text-red-700">
                            {absent}
                          </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-[11px] text-slate-500">
                            Class
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {item.course || "—"}
                            {item.semester
                              ? ` · Sem ${item.semester}`
                              : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default AttendanceList;

