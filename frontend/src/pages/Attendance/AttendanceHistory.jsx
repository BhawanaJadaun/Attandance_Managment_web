import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Users,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import * as attendanceServiceModule from "../../services/attendanceService";
import toast from "react-hot-toast";

const getAttendanceService = () => {
  const service =
    attendanceServiceModule.attendanceService ??
    attendanceServiceModule.default ??
    attendanceServiceModule;

  if (typeof service.getAll !== "function") {
    throw new Error("attendanceService must export a getAll() function.");
  }

  return service;
};

const normalizeRecord = (record = {}) => ({
  ...record,
  id: String(record.id ?? record._id ?? ""),
  lectureCode: String(record.lectureCode ?? record.lecture_code ?? ""),
  date: String(
    record.date ?? record.attendance_date ?? record.lecture_date ?? "",
  ).slice(0, 10),
  startTime: record.startTime ?? record.start_time ?? "",
  endTime: record.endTime ?? record.end_time ?? "",
  subjectCode: String(record.subjectCode ?? record.subject_code ?? ""),
  subjectName: String(record.subjectName ?? record.subject_name ?? ""),
  professorName: String(
    record.professorName ?? record.professor_name ?? record.teacher_name ?? "",
  ),
  course: String(record.course ?? ""),
  department: String(record.department ?? ""),
  semester: String(record.semester ?? ""),
  registrationNo: String(
    record.registrationNo ?? record.registration_number ?? "",
  ),
  rollNo: String(record.rollNo ?? record.roll_number ?? record.roll_no ?? ""),
  studentName: String(
    record.studentName ?? record.student_name ?? record.full_name ?? "",
  ),
  present: record.present === true,
});

const AttendanceHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const lectureCode = params.get("lecture") || "";
  const date = params.get("date") || "";

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      setLoading(true);
      setError("");

      try {
        const service = getAttendanceService();

        // The backend supports lecture_code and date filters.
        const response = await service.getAll({
          lecture_code: lectureCode,
          date,
        });

        const list = Array.isArray(response)
          ? response
          : (response?.records ??
            response?.attendance ??
            response?.data ??
            response?.items ??
            []);

        if (!Array.isArray(list)) {
          throw new Error(
            "The attendance API returned an unexpected response.",
          );
        }

        const normalized = list.map(normalizeRecord);

        // Filter again on the client so only the selected lecture/date
        // appears even if the backend ignores one of the filters.
        const filtered = normalized.filter((record) => {
          const sameLecture =
            record.lectureCode.toLowerCase() === lectureCode.toLowerCase();

          const sameDate = !date || record.date === date;

          return sameLecture && sameDate;
        });

        if (active) {
          setRecords(filtered);
        }
      } catch (err) {
        const message = err?.message || "Unable to load attendance history.";

        if (active) {
          setError(message);
          setRecords([]);
          toast.error(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (!lectureCode) {
      setRecords([]);
      setError("A lecture code was not provided.");
      setLoading(false);
      return () => {
        active = false;
      };
    }

    loadHistory();

    return () => {
      active = false;
    };
  }, [lectureCode, date]);

  const lectureRecords = useMemo(() => records, [records]);

  const firstRecord = lectureRecords[0];

  const presentCount = lectureRecords.filter((record) => record.present).length;

  const absentCount = lectureRecords.filter((record) => !record.present).length;

  const percentage =
    lectureRecords.length > 0
      ? Math.round((presentCount / lectureRecords.length) * 100)
      : 0;

  const refreshHistory = () => {
    // Re-run the effect by navigating to the same URL with a refresh
    // query value would complicate the route. Reload through a local key
    // instead, implemented by the refreshKey state below.
    setRefreshKey((value) => value + 1);
  };

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (refreshKey === 0) return;

    let active = true;

    const reload = async () => {
      setLoading(true);
      setError("");

      try {
        const service = getAttendanceService();
        const response = await service.getAll({
          lecture_code: lectureCode,
          date,
        });

        const list = Array.isArray(response)
          ? response
          : (response?.records ??
            response?.attendance ??
            response?.data ??
            response?.items ??
            []);

        if (!Array.isArray(list)) {
          throw new Error("Unexpected attendance API response.");
        }

        const filtered = list
          .map(normalizeRecord)
          .filter(
            (record) =>
              record.lectureCode.toLowerCase() === lectureCode.toLowerCase() &&
              (!date || record.date === date),
          );

        if (active) {
          setRecords(filtered);
          toast.success("Attendance history refreshed.");
        }
      } catch (err) {
        if (active) {
          const message =
            err?.message || "Unable to refresh attendance history.";
          setError(message);
          toast.error(message);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    reload();

    return () => {
      active = false;
    };
  }, [refreshKey, lectureCode, date]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/attendance")}
              aria-label="Back to attendance records"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Attendance History
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                View student attendance for this lecture.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={refreshHistory}
            disabled={loading || !lectureCode}
            className="flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
            <RefreshCw
              size={27}
              className="mx-auto animate-spin text-blue-600"
            />
            <p className="mt-3 text-sm text-slate-500">
              Loading attendance history...
            </p>
          </div>
        ) : error && lectureRecords.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
            <ClipboardCheck size={28} className="mx-auto text-slate-400" />
            <h2 className="mt-4 font-semibold text-slate-800">
              Unable to load attendance history
            </h2>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
            <button
              type="button"
              onClick={refreshHistory}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : lectureRecords.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ClipboardCheck size={25} />
            </div>
            <h2 className="mt-4 font-semibold text-slate-800">
              Attendance record not found
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              No attendance rows were returned for lecture{" "}
              <span className="font-medium">{lectureCode}</span>
              {date ? ` on ${date}` : ""}.
            </p>
            <button
              type="button"
              onClick={() => navigate("/attendance")}
              className="mt-4 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to Records
            </button>
          </div>
        ) : (
          <>
            {/* Lecture information */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <ClipboardCheck size={21} />
                    </div>

                    <div>
                      <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {firstRecord.lectureCode}
                      </span>
                      <h2 className="mt-2 text-lg font-bold text-slate-900">
                        {firstRecord.subjectName || "Subject"}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {firstRecord.subjectCode || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <InfoItem
                    icon={CalendarDays}
                    label="Date"
                    value={firstRecord.date}
                  />
                  <InfoItem
                    icon={Clock3}
                    label="Time"
                    value={
                      firstRecord.startTime || firstRecord.endTime
                        ? `${firstRecord.startTime || "—"} - ${
                            firstRecord.endTime || "—"
                          }`
                        : "—"
                    }
                  />
                  <InfoItem
                    icon={Users}
                    label="Professor"
                    value={firstRecord.professorName}
                  />
                  <InfoItem
                    icon={ClipboardCheck}
                    label="Semester"
                    value={
                      firstRecord.semester
                        ? `Semester ${firstRecord.semester}`
                        : "—"
                    }
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                {firstRecord.course && (
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1.5">
                    {firstRecord.course}
                  </span>
                )}
                {firstRecord.department && (
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1.5">
                    {firstRecord.department}
                  </span>
                )}
              </div>
            </section>

            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <SummaryCard
                icon={Users}
                label="Total Students"
                value={lectureRecords.length}
                className="bg-blue-50 text-blue-600"
              />
              <SummaryCard
                icon={CheckCircle2}
                label="Present"
                value={presentCount}
                className="bg-emerald-50 text-emerald-600"
              />
              <SummaryCard
                icon={XCircle}
                label="Absent"
                value={absentCount}
                className="bg-red-50 text-red-600"
              />
              <SummaryCard
                icon={ClipboardCheck}
                label="Attendance"
                value={`${percentage}%`}
                className="bg-slate-100 text-slate-700"
              />
            </div>

            {/* Student attendance */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="font-semibold text-slate-900">
                  Student Attendance
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Attendance status recorded for this lecture.
                </p>
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Registration No.
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Roll No.
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Student Name
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {lectureRecords.map((record, index) => (
                      <tr
                        key={
                          record.id ||
                          `${record.lectureCode}-${record.registrationNo}-${index}`
                        }
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-5 py-4 text-sm font-medium text-slate-800">
                          {record.registrationNo || "—"}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {record.rollNo || "—"}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-800">
                          {record.studentName || "—"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <AttendanceBadge present={record.present} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 p-4 md:hidden">
                {lectureRecords.map((record, index) => (
                  <div
                    key={
                      record.id ||
                      `${record.lectureCode}-${record.registrationNo}-${index}`
                    }
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"
                  >
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-slate-900">
                        {record.studentName || "Unknown student"}
                      </p>
                      <p className="mt-1 break-words text-xs text-slate-500">
                        {record.registrationNo || "—"} · Roll{" "}
                        {record.rollNo || "—"}
                      </p>
                    </div>

                    <AttendanceBadge present={record.present} />
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl bg-slate-50 p-3">
    <div className="flex items-center gap-1.5 text-slate-400">
      <Icon size={14} />
      <span className="text-[10px] font-medium uppercase tracking-wide">
        {label}
      </span>
    </div>
    <p className="mt-1 break-words text-xs font-semibold text-slate-700">
      {value || "—"}
    </p>
  </div>
);

const SummaryCard = ({ icon: Icon, label, value, className }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${className}`}
      >
        <Icon size={19} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  </div>
);

const AttendanceBadge = ({ present }) =>
  present ? (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
      <CheckCircle2 size={14} />
      Present
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
      <XCircle size={14} />
      Absent
    </span>
  );

export default AttendanceHistory;
