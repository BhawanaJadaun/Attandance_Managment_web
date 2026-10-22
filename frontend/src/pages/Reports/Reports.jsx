import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Users,
  CheckCircle2,
  XCircle,
  Percent,
  BookOpen,
  GraduationCap,
  CalendarDays,
} from "lucide-react";
import { toast } from "react-hot-toast";
import ReportFilters from "./components/ReportFilters";
import { apiGet } from "../../services/api";

// Initial filters used by the Reports page.
const DEFAULT_REPORT_FILTERS = {
  course: "",
  department: "",
  semester: "",
  registrationNo: "",
  rollNo: "",
  studentName: "",
  subjectCode: "",
  professorId: "",
  lectureCode: "",
  attendanceStatus: "",
  fromDate: "",
  toDate: "",
};

// Supports APIs returning an array directly or inside a common property.
function getArray(response) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.students)) return response.students;
  if (Array.isArray(response?.professors)) return response.professors;
  if (Array.isArray(response?.subjects)) return response.subjects;
  if (Array.isArray(response?.lectures)) return response.lectures;
  if (Array.isArray(response?.records)) return response.records;

  return [];
}

function normalizeStudent(item = {}) {
  return {
    ...item,
    id: String(item._id || item.id || item.registration_number || ""),
    registrationNo: item.registration_number || item.registrationNo || "",
    rollNo: String(item.roll_no || item.rollNo || ""),
    name: item.full_name || item.name || item.student_name || "",
    course: item.course || "",
    department: item.department || "",
    semester: item.semester ?? "",
    status: item.status || "Active",
  };
}

function normalizeProfessor(item = {}) {
  return {
    ...item,
    id: String(item._id || item.id || item.professor_id || ""),
    professorId: item.professor_id || item.professorId || "",
    name: item.full_name || item.name || item.professor_name || "",
  };
}

function normalizeSubject(item = {}) {
  return {
    ...item,
    id: String(item._id || item.id || item.subject_code || ""),
    subjectCode: item.subject_code || item.subjectCode || "",
    subjectName: item.subject_name || item.subjectName || item.name || "",
    course: item.course || "",
    department: item.department || "",
    semester: item.semester ?? "",
    professorId: item.professor_id || item.professorId || "",
    professorName: item.professor_name || item.professorName || "",
  };
}

function normalizeLecture(item = {}) {
  return {
    ...item,
    id: String(item._id || item.id || item.lecture_code || ""),
    lectureCode: item.lecture_code || item.lectureCode || "",
    date: String(
      item.date || item.lecture_date || item.attendance_date || "",
    ).slice(0, 10),
    day: item.day || "",
    course: item.course || "",
    department: item.department || "",
    semester: item.semester ?? "",
    subjectCode: item.subject_code || item.subjectCode || "",
    subjectName: item.subject_name || item.subjectName || "",
    professorId: item.professor_id || item.professorId || "",
    professorName: item.professor_name || item.professorName || "",
    startTime: item.start_time || item.startTime || "",
    endTime: item.end_time || item.endTime || "",
    status: item.status || "Conducted",
  };
}

function normalizeAttendance(item = {}) {
  const present =
    item.present === true || item.present === 1 || item.present === "true";

  return {
    ...item,
    id: String(
      item._id ||
        item.id ||
        `${item.lecture_code || item.lectureCode || ""}-${item.registration_number || item.registrationNo || ""}`,
    ),
    lectureCode: item.lecture_code || item.lectureCode || "",
    date: String(
      item.attendance_date || item.date || item.lecture_date || "",
    ).slice(0, 10),
    day: item.day || "",
    course: item.course || "",
    department: item.department || "",
    semester: item.semester ?? "",
    subjectCode: item.subject_code || item.subjectCode || "",
    subjectName: item.subject_name || item.subjectName || "",
    professorId: item.professor_id || item.professorId || "",
    professorName: item.professor_name || item.professorName || "",
    registrationNo: item.registration_number || item.registrationNo || "",
    rollNo: String(item.roll_no || item.rollNo || ""),
    studentName: item.student_name || item.full_name || item.name || "",
    present,
    startTime: item.start_time || item.startTime || "",
    endTime: item.end_time || item.endTime || "",
  };
}

function StatCard({ title, value, icon: Icon, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
          <Icon className="h-5 w-5 text-indigo-600" />
        </div>
      </div>
    </div>
  );
}

function EmptyRow({ colSpan, children = "No records found." }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-5 py-10 text-center text-sm text-slate-400"
      >
        {children}
      </td>
    </tr>
  );
}

export default function Reports() {
  const [filters, setFilters] = useState(DEFAULT_REPORT_FILTERS);

  const [students, setStudents] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [loadingLists, setLoadingLists] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportError, setReportError] = useState("");

  const updateFilter = (key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({ ...DEFAULT_REPORT_FILTERS });
  };

  // Load supporting lists from the backend.
  useEffect(() => {
    let active = true;

    async function loadLists() {
      setLoadingLists(true);

      const endpoints = [
        { key: "students", url: "/api/students" },
        { key: "professors", url: "/api/professors" },
        { key: "subjects", url: "/api/subjects" },
        { key: "lectures", url: "/api/lectures" },
      ];

      const results = await Promise.allSettled(
        endpoints.map((endpoint) => apiGet(endpoint.url)),
      );

      if (!active) return;

      results.forEach((result, index) => {
        if (result.status !== "fulfilled") {
          console.error(
            `Could not load ${endpoints[index].key}:`,
            result.reason,
          );
          return;
        }

        const data = getArray(result.value);

        switch (endpoints[index].key) {
          case "students":
            setStudents(data.map(normalizeStudent));
            break;
          case "professors":
            setProfessors(data.map(normalizeProfessor));
            break;
          case "subjects":
            setSubjects(data.map(normalizeSubject));
            break;
          case "lectures":
            setLectures(data.map(normalizeLecture));
            break;
          default:
            break;
        }
      });

      if (active) setLoadingLists(false);
    }

    loadLists();

    return () => {
      active = false;
    };
  }, []);

  // Ask the existing reports endpoint for attendance data.
  useEffect(() => {
    let active = true;

    async function loadReports() {
      setLoadingReports(true);
      setReportError("");

      const params = new URLSearchParams();

      // These are the filters supported by the existing backend route.
      if (filters.registrationNo.trim()) {
        params.set("registration_number", filters.registrationNo.trim());
      }
      if (filters.department) {
        params.set("department", filters.department);
      }
      if (filters.subjectCode) {
        params.set("subject_code", filters.subjectCode);
      }
      if (filters.professorId) {
        params.set("professor_id", filters.professorId);
      }
      if (filters.lectureCode) {
        params.set("lecture_code", filters.lectureCode);
      }
      if (filters.fromDate) {
        params.set("start_date", filters.fromDate);
      }
      if (filters.toDate) {
        params.set("end_date", filters.toDate);
      }

      const query = params.toString();
      const url = query
        ? `/api/reports/attendance?${query}`
        : "/api/reports/attendance";

      try {
        const response = await apiGet(url);
        const records = getArray(response).map(normalizeAttendance);

        if (active) {
          setAttendance(records);
        }
      } catch (error) {
        console.error("Reports API error:", error);

        if (active) {
          setAttendance([]);
          setReportError(
            error?.message ||
              "Could not load attendance reports. Check the backend and login.",
          );
        }
      } finally {
        if (active) setLoadingReports(false);
      }
    }

    loadReports();

    return () => {
      active = false;
    };
  }, [
    filters.registrationNo,
    filters.department,
    filters.subjectCode,
    filters.professorId,
    filters.lectureCode,
    filters.fromDate,
    filters.toDate,
  ]);

  // Apply filters not supported by the existing report API locally.
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      if (filters.course && student.course !== filters.course) return false;

      if (filters.department && student.department !== filters.department) {
        return false;
      }

      if (
        filters.semester &&
        String(student.semester) !== String(filters.semester)
      ) {
        return false;
      }

      if (
        filters.registrationNo &&
        !student.registrationNo
          .toLowerCase()
          .includes(filters.registrationNo.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.rollNo &&
        !student.rollNo.toLowerCase().includes(filters.rollNo.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.studentName &&
        !student.name.toLowerCase().includes(filters.studentName.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [students, filters]);

  const filteredLectures = useMemo(() => {
    return lectures.filter((lecture) => {
      if (filters.course && lecture.course !== filters.course) return false;

      if (filters.department && lecture.department !== filters.department) {
        return false;
      }

      if (
        filters.semester &&
        String(lecture.semester) !== String(filters.semester)
      ) {
        return false;
      }

      if (filters.subjectCode && lecture.subjectCode !== filters.subjectCode) {
        return false;
      }

      if (filters.professorId && lecture.professorId !== filters.professorId) {
        return false;
      }

      if (filters.lectureCode && lecture.lectureCode !== filters.lectureCode) {
        return false;
      }

      if (filters.fromDate && lecture.date < filters.fromDate) return false;
      if (filters.toDate && lecture.date > filters.toDate) return false;

      return true;
    });
  }, [lectures, filters]);

  const filteredAttendance = useMemo(() => {
    return attendance.filter((record) => {
      if (filters.course && record.course !== filters.course) return false;

      if (filters.department && record.department !== filters.department) {
        return false;
      }

      if (
        filters.semester &&
        String(record.semester) !== String(filters.semester)
      ) {
        return false;
      }

      if (filters.subjectCode && record.subjectCode !== filters.subjectCode) {
        return false;
      }

      if (filters.professorId && record.professorId !== filters.professorId) {
        return false;
      }

      if (filters.lectureCode && record.lectureCode !== filters.lectureCode) {
        return false;
      }

      if (
        filters.registrationNo &&
        record.registrationNo !== filters.registrationNo
      ) {
        return false;
      }

      if (filters.rollNo && record.rollNo !== filters.rollNo) return false;

      if (
        filters.studentName &&
        !record.studentName
          .toLowerCase()
          .includes(filters.studentName.toLowerCase())
      ) {
        return false;
      }

      if (filters.attendanceStatus === "Present" && !record.present) {
        return false;
      }

      if (filters.attendanceStatus === "Absent" && record.present) {
        return false;
      }

      if (filters.fromDate && record.date < filters.fromDate) return false;
      if (filters.toDate && record.date > filters.toDate) return false;

      return true;
    });
  }, [attendance, filters]);

  // Attendance counts use the actual returned attendance records.
  const presentCount = filteredAttendance.filter(
    (record) => record.present,
  ).length;

  const absentCount = filteredAttendance.filter(
    (record) => !record.present,
  ).length;

  const totalAttendance = presentCount + absentCount;

  const attendancePercentage =
    totalAttendance > 0
      ? ((presentCount / totalAttendance) * 100).toFixed(1)
      : "0.0";

  // Subject summary: count distinct lectures and their attendance records.
  const subjectSummary = useMemo(() => {
    const map = new Map();

    filteredLectures.forEach((lecture) => {
      const code = lecture.subjectCode || "Unknown";

      if (!map.has(code)) {
        map.set(code, {
          subjectCode: code,
          subjectName: lecture.subjectName || "",
          professorName: lecture.professorName || "",
          conducted: 0,
          present: 0,
          absent: 0,
          lectureCodes: new Set(),
        });
      }

      const item = map.get(code);
      const lectureKey = lecture.lectureCode || lecture.id;

      if (!item.lectureCodes.has(lectureKey)) {
        item.lectureCodes.add(lectureKey);
        item.conducted += 1;
      }
    });

    filteredAttendance.forEach((record) => {
      const code = record.subjectCode || "Unknown";

      if (!map.has(code)) {
        map.set(code, {
          subjectCode: code,
          subjectName: record.subjectName || "",
          professorName: record.professorName || "",
          conducted: 0,
          present: 0,
          absent: 0,
          lectureCodes: new Set(),
        });
      }

      const item = map.get(code);

      if (record.present) {
        item.present += 1;
      } else {
        item.absent += 1;
      }
    });

    return Array.from(map.values()).map((item) => {
      const total = item.present + item.absent;
      const percentage =
        total > 0 ? ((item.present / total) * 100).toFixed(1) : "0.0";

      return {
        ...item,
        lectureCodes: undefined,
        percentage,
        status: Number(percentage) >= 75 ? "Eligible" : "Short",
      };
    });
  }, [filteredLectures, filteredAttendance]);

  const missedLectures = useMemo(() => {
    return filteredAttendance
      .filter((record) => !record.present)
      .map((record) => {
        const lecture = filteredLectures.find(
          (item) => item.lectureCode === record.lectureCode,
        );

        return {
          ...record,
          startTime: record.startTime || lecture?.startTime || "",
          endTime: record.endTime || lecture?.endTime || "",
        };
      });
  }, [filteredAttendance, filteredLectures]);

  const getProfessorName = (lecture) => {
    if (lecture.professorName) return lecture.professorName;

    return (
      professors.find(
        (professor) => professor.professorId === lecture.professorId,
      )?.name ||
      lecture.professorId ||
      "-"
    );
  };

  const isLoading = loadingLists || loadingReports;

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-6">
      {/* HEADER */}
      <div className="mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
              Attendance Reports
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Analyze attendance by course, department, semester, subject, and
              professor.
            </p>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="mb-5">
        <ReportFilters
          filters={filters}
          updateFilter={updateFilter}
          resetFilters={resetFilters}
          students={students}
          professors={professors}
          subjects={subjects}
          lectures={lectures}
        />
      </div>

      {reportError && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {reportError}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading && (
        <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700">
          Loading report data from the backend...
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Lectures Conducted"
          value={filteredLectures.length}
          icon={CalendarDays}
          description="Based on lecture records"
        />

        <StatCard
          title="Present"
          value={presentCount}
          icon={CheckCircle2}
          description="Attendance marked present"
        />

        <StatCard
          title="Absent"
          value={absentCount}
          icon={XCircle}
          description="Attendance marked absent"
        />

        <StatCard
          title="Attendance"
          value={`${attendancePercentage}%`}
          icon={Percent}
          description="Present divided by attendance records"
        />
      </div>

      {/* SELECTED FILTERS */}
      <div className="mb-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-indigo-800">
            Selected:
          </span>

          {[
            filters.course,
            filters.department,
            filters.semester ? `Semester ${filters.semester}` : "",
            filters.subjectCode,
            filters.professorId,
            filters.lectureCode,
          ]
            .filter(Boolean)
            .map((value) => (
              <span
                key={value}
                className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700"
              >
                {value}
              </span>
            ))}

          {!Object.values(filters).some(Boolean) && (
            <span className="text-xs text-indigo-600">
              All available records
            </span>
          )}
        </div>
      </div>

      {/* SUBJECT-WISE REPORT */}
      <section className="mb-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 p-5">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          <div>
            <h2 className="font-semibold text-slate-800">
              Subject-wise Report
            </h2>
            <p className="text-xs text-slate-500">
              Attendance performance for the selected scope
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Subject",
                  "Professor",
                  "Conducted",
                  "Present",
                  "Absent",
                  "%",
                  "Status",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3 text-left font-semibold text-slate-600"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {subjectSummary.length === 0 ? (
                <EmptyRow colSpan={7}>
                  No subject data available for the selected filters.
                </EmptyRow>
              ) : (
                subjectSummary.map((subject) => (
                  <tr key={subject.subjectCode} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">
                        {subject.subjectCode}
                      </div>
                      <div className="text-xs text-slate-500">
                        {subject.subjectName}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {subject.professorName || "-"}
                    </td>

                    <td className="px-5 py-4 text-center font-medium">
                      {subject.conducted}
                    </td>

                    <td className="px-5 py-4 text-center font-semibold text-emerald-600">
                      {subject.present}
                    </td>

                    <td className="px-5 py-4 text-center font-semibold text-red-600">
                      {subject.absent}
                    </td>

                    <td className="px-5 py-4 text-center font-bold text-slate-800">
                      {subject.percentage}%
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          subject.status === "Eligible"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {subject.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* LECTURE REPORT */}
      <section className="mb-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 p-5">
          <CalendarDays className="h-5 w-5 text-indigo-600" />
          <div>
            <h2 className="font-semibold text-slate-800">Lecture Report</h2>
            <p className="text-xs text-slate-500">
              Conducted lectures according to selected filters
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Lecture Code",
                  "Date",
                  "Subject",
                  "Professor",
                  "Time",
                  "Status",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3 text-left font-semibold text-slate-600"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredLectures.length === 0 ? (
                <EmptyRow colSpan={6}>No lectures found.</EmptyRow>
              ) : (
                filteredLectures.map((lecture) => (
                  <tr
                    key={lecture.id || lecture.lectureCode}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-semibold text-indigo-600">
                      {lecture.lectureCode || "-"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {lecture.date || "-"}
                      <div className="text-xs text-slate-400">
                        {lecture.day}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800">
                        {lecture.subjectCode || "-"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {lecture.subjectName}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {getProfessorName(lecture)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {lecture.startTime || "--"} - {lecture.endTime || "--"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {lecture.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MISSED LECTURES */}
      <section className="mb-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 p-5">
          <XCircle className="h-5 w-5 text-red-600" />
          <div>
            <h2 className="font-semibold text-slate-800">Missed Lectures</h2>
            <p className="text-xs text-slate-500">
              Attendance records marked absent
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Student",
                  "Date",
                  "Subject",
                  "Professor",
                  "Lecture Code",
                  "Status",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3 text-left font-semibold text-slate-600"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {missedLectures.length === 0 ? (
                <EmptyRow colSpan={6}>No missed lectures.</EmptyRow>
              ) : (
                missedLectures.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">
                        {record.studentName || "-"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {record.registrationNo || "-"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {record.date || "-"}
                      <div className="text-xs text-slate-400">{record.day}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800">
                        {record.subjectCode || "-"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {record.subjectName}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {record.professorName || "-"}
                    </td>

                    <td className="px-5 py-4 font-medium text-indigo-600">
                      {record.lectureCode || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                        Absent
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* STUDENTS */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 p-5">
          <Users className="h-5 w-5 text-indigo-600" />
          <div>
            <h2 className="font-semibold text-slate-800">
              Students in Selected Scope
            </h2>
            <p className="text-xs text-slate-500">
              Students matching the selected academic filters
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full py-8 text-center text-sm text-slate-400">
              No students found.
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student.id}
                className="rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                      <GraduationCap className="h-5 w-5 text-indigo-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-800">
                        {student.name || "-"}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {student.registrationNo || "-"}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                    {student.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-50 p-2">
                    <span className="block text-slate-400">Roll No.</span>
                    <span className="font-semibold text-slate-700">
                      {student.rollNo || "-"}
                    </span>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2">
                    <span className="block text-slate-400">Semester</span>
                    <span className="font-semibold text-slate-700">
                      {student.semester || "-"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
