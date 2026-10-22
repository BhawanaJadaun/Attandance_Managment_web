import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Percent,
  User,
  UserX,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { apiGet } from "../../services/api";

const getValue = (value) =>
  value === null || value === undefined ? "" : String(value);

const same = (a, b) => getValue(a).toLowerCase() === getValue(b).toLowerCase();

function SummaryCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function asArray(response, keys = []) {
  if (Array.isArray(response)) return response;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
  }

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.records)) return response.records;

  return [];
}

function normalizeLecture(item = {}) {
  return {
    ...item,
    lectureCode: item.lecture_code || item.lectureCode || "",
    date: item.date || item.lecture_date || "",
    subjectCode: item.subject_code || item.subjectCode || "",
    subjectName: item.subject_name || item.subjectName || "",
    professorName:
      item.professor_name || item.professorName || item.professor || "",
    professorId: item.professor_id || item.professorId || "",
    registrationNo: item.registration_number || item.registrationNo || "",
    course: item.course || "",
    department: item.department || "",
    semester: item.semester ?? "",
    section: item.section || "",
  };
}

function normalizeAttendance(item = {}) {
  let present;

  if (typeof item.present === "boolean") {
    present = item.present;
  } else if (item.present === 1 || item.present === "true") {
    present = true;
  } else if (item.present === 0 || item.present === "false") {
    present = false;
  }

  return {
    ...item,
    lectureCode: item.lecture_code || item.lectureCode || "",
    registrationNo: item.registration_number || item.registrationNo || "",
    present,
  };
}

export default function StudentReport({ student }) {
  const [lectures, setLectures] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const registrationNo =
    student?.registrationNo || student?.registration_number || "";

  useEffect(() => {
    let active = true;

    async function loadStudentReport() {
      if (!registrationNo) {
        setLectures([]);
        setAttendance([]);
        setLoadError("Student registration number is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError("");

      try {
        const [lectureResponse, attendanceResponse] = await Promise.all([
          apiGet("/api/lectures"),
          apiGet("/api/attendance"),
        ]);

        const allLectures = asArray(lectureResponse, ["lectures"]).map(
          normalizeLecture,
        );

        const allAttendance = asArray(attendanceResponse, ["attendance"]).map(
          normalizeAttendance,
        );

        const studentLectures = allLectures.filter((lecture) => {
          // If lectures are associated with a student, match the
          // registration number. Otherwise use academic scope.
          if (lecture.registrationNo) {
            return same(lecture.registrationNo, registrationNo);
          }

          if (student.course && !same(lecture.course, student.course)) {
            return false;
          }

          if (
            student.department &&
            !same(lecture.department, student.department)
          ) {
            return false;
          }

          if (
            student.semester !== undefined &&
            student.semester !== null &&
            student.semester !== "" &&
            !same(lecture.semester, student.semester)
          ) {
            return false;
          }

          return true;
        });

        const studentAttendance = allAttendance.filter((record) =>
          same(record.registrationNo, registrationNo),
        );

        if (active) {
          setLectures(studentLectures);
          setAttendance(studentAttendance);
        }
      } catch (error) {
        console.error("Student report loading failed:", error);

        if (active) {
          setLoadError(
            error?.message ||
              "Unable to load student attendance from the backend.",
          );
          toast.error("Failed to load student report.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStudentReport();

    return () => {
      active = false;
    };
  }, [registrationNo, student?.course, student?.department, student?.semester]);

  const report = useMemo(() => {
    const rows = lectures.map((lecture) => {
      const record = attendance.find(
        (item) =>
          same(item.lectureCode, lecture.lectureCode) &&
          same(item.registrationNo, registrationNo),
      );

      return {
        lecture,
        record,
        status:
          record?.present === true
            ? "Present"
            : record?.present === false
              ? "Absent"
              : "Not Submitted",
      };
    });

    const present = rows.filter((row) => row.status === "Present").length;

    const absent = rows.filter((row) => row.status === "Absent").length;

    const notSubmitted = rows.filter(
      (row) => row.status === "Not Submitted",
    ).length;

    // Only submitted attendance records count toward the percentage.
    const submitted = present + absent;

    const percentage =
      submitted > 0 ? Number(((present / submitted) * 100).toFixed(2)) : 0;

    let lecturesNeeded = 0;

    if (percentage < 75 && submitted > 0) {
      while ((present + lecturesNeeded) / (submitted + lecturesNeeded) < 0.75) {
        lecturesNeeded += 1;

        if (lecturesNeeded > 10000) break;
      }
    }

    return {
      rows,
      conducted: rows.length,
      present,
      absent,
      notSubmitted,
      percentage,
      eligible: submitted > 0 && percentage >= 75,
      lecturesNeeded,
    };
  }, [student, lectures, attendance, registrationNo]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Loading student attendance report...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {loadError}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="ml-2 font-semibold underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Select a student to view their report.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* STUDENT HEADER */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <User size={25} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {student.name || student.full_name || "Student"}
              </h2>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                  Reg. No: {registrationNo || "-"}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                  Roll No: {student.rollNo || student.roll_no || "-"}
                </span>

                {student.course && (
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700">
                    {student.course}
                  </span>
                )}

                {student.department && (
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700">
                    {student.department}
                  </span>
                )}

                {student.semester && (
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700">
                    Semester {student.semester}
                  </span>
                )}

                {student.section && (
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700">
                    Section {student.section}
                  </span>
                )}
              </div>
            </div>
          </div>

          <span
            className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${
              report.eligible
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {report.eligible ? "Eligible" : "Short Attendance"}
          </span>
        </div>
      </section>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <SummaryCard
          title="Conducted"
          value={report.conducted}
          icon={ClipboardCheck}
        />

        <SummaryCard
          title="Present"
          value={report.present}
          icon={CheckCircle2}
        />

        <SummaryCard title="Absent" value={report.absent} icon={UserX} />

        <SummaryCard
          title="Attendance"
          value={`${report.percentage}%`}
          icon={Percent}
        />

        <SummaryCard
          title="Needed"
          value={
            report.eligible || report.present + report.absent === 0
              ? 0
              : report.lecturesNeeded
          }
          icon={BarChart3}
        />
      </div>

      {/* ATTENDANCE MESSAGE */}
      {report.conducted > 0 &&
        report.present + report.absent > 0 &&
        !report.eligible && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 text-red-600" size={22} />
              <div>
                <h3 className="font-semibold text-red-800">Short Attendance</h3>

                <p className="mt-1 text-sm text-red-700">
                  Current submitted attendance is{" "}
                  <strong>{report.percentage}%</strong>.
                </p>

                <p className="mt-1 text-sm text-red-700">
                  The student needs to attend{" "}
                  <strong>{report.lecturesNeeded}</strong> consecutive future
                  lectures to reach 75%, assuming each future lecture is
                  attended.
                </p>
              </div>
            </div>
          </div>
        )}

      {/* COMPLETE REPORT */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-semibold text-slate-900">
            Student Lecture Report
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Complete attendance history for this student.
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Not submitted: {report.notSubmitted}
          </p>
        </div>

        {report.rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No lecture records found for this student's academic scope.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Professor</th>
                  <th className="px-5 py-3">Lecture Code</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {report.rows.map(({ lecture, status }, index) => (
                  <tr
                    key={`${lecture.lectureCode || "lecture"}-${index}`}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-sm text-slate-700">
                      {String(lecture.date || "").slice(0, 10) || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {lecture.subjectCode || "-"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {lecture.subjectName}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-700">
                        {lecture.professorName || "-"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        ID: {lecture.professorId || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-semibold text-indigo-600">
                      {lecture.lectureCode || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          status === "Present"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : status === "Absent"
                              ? "border-red-200 bg-red-50 text-red-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
