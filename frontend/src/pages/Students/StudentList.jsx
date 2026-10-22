import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UserRound,
  GraduationCap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudents } from "../../context/StudentContext";
import * as studentServiceModule from "../../services/studentService";
import { getSubjects } from "../../services/subjectService";
const studentService =
  studentServiceModule.studentService ?? studentServiceModule.default;

const COURSE_OPTIONS = [
  { value: "", label: "All Courses" },
  { value: "B.Tech", label: "B.Tech" },
  { value: "BCA", label: "BCA" },
  { value: "MCA", label: "MCA" },
  { value: "BBA", label: "BBA" },
  { value: "MBA", label: "MBA" },
  { value: "B.Com", label: "B.Com" },
];

const SEMESTER_OPTIONS = [
  { value: "", label: "All Semesters" },
  { value: "1", label: "Semester 1" },
  { value: "2", label: "Semester 2" },
  { value: "3", label: "Semester 3" },
  { value: "4", label: "Semester 4" },
  { value: "5", label: "Semester 5" },
  { value: "6", label: "Semester 6" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];
const DEPARTMENTS_BY_COURSE = {
  "B.Tech": [
    "Computer Science & Engineering",
    "CSE - AI & ML",
    "CSE - Data Science",
    "CSE - Cyber Security",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
  ],
  BCA: [
    "General",
    "AI & ML",
    "Data Science",
    "Cloud Computing",
    "Cyber Security",
  ],
  MCA: [
    "General",
    "AI & ML",
    "Data Science",
    "Cloud Computing",
    "Cyber Security",
  ],
  BBA: [
    "General",
    "Finance",
    "Marketing",
    "Human Resource Management",
    "Business Analytics",
  ],
  MBA: [
    "General",
    "Finance",
    "Marketing",
    "Human Resource Management",
    "Business Analytics",
  ],
  "B.Com": [
    "General",
    "Accounting & Finance",
    "Banking & Insurance",
    "Taxation",
    "Computer Applications",
  ],
};
const StudentList = () => {
  const navigate = useNavigate();
  const { students = [], dispatch, loading = false } = useStudents();

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [subjectFilter, setSubjectFilter] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  const studentsPerPage = 8;

  const getStudentSubjectNames = (student) => {
    const subjects = [
      student?.subject_name,
      student?.subjectName,
      student?.subject,
      student?.subject_code,
      student?.subjectCode,
    ];

    const studentSubjects = Array.isArray(student?.subjects)
      ? student.subjects.map((subject) =>
          typeof subject === "string"
            ? subject
            : subject?.subject_name ||
              subject?.subjectName ||
              subject?.subject_code ||
              subject?.subjectCode ||
              subject?.name ||
              "",
        )
      : [];

    return [...subjects, ...studentSubjects].filter(
      (subject) => typeof subject === "string" && subject.trim(),
    );
  };
  const getStudentDepartment = (student) =>
    student?.department || student?.branch || "";

  const availableSubjects = useMemo(() => {
    const filteredSubjects = subjects.filter((subject) => {
      const matchesCourse =
        !courseFilter ||
        String(subject.course || "")
          .trim()
          .toLowerCase() === courseFilter.trim().toLowerCase();

      const matchesDepartment =
        !departmentFilter ||
        String(subject.department || "")
          .trim()
          .toLowerCase() === departmentFilter.trim().toLowerCase();

      const matchesSemester =
        !semesterFilter ||
        String(subject.semester ?? "") === String(semesterFilter);

      return matchesCourse && matchesDepartment && matchesSemester;
    });

    const uniqueSubjects = new Map();

    filteredSubjects.forEach((subject) => {
      const code = subject.subject_code || subject.subjectCode || "";
      const name =
        subject.subject_name || subject.subjectName || subject.name || code;

      if (name || code) {
        const value = name;

        uniqueSubjects.set(value, {
          value,
          label: code && code !== name ? `${name} (${code})` : name,
        });
      }
    });

    return [
      { value: "", label: "All Subjects" },
      ...Array.from(uniqueSubjects.values()).sort((a, b) =>
        a.label.localeCompare(b.label),
      ),
    ];
  }, [subjects, courseFilter, departmentFilter, semesterFilter]);

  // Read lecture information when it is included in a student record.
  const getLectureInfo = (student) => {
    const lecture = student?.lecture || {};

    const lectureCode =
      student?.lectureCode ||
      student?.lecture_code ||
      lecture?.lectureCode ||
      lecture?.lecture_code ||
      "-";

    const date =
      student?.date ||
      student?.lectureDate ||
      student?.attendance_date ||
      lecture?.date ||
      lecture?.lecture_date ||
      "-";

    let day = student?.day || lecture?.day || "";

    if (!day && date !== "-") {
      const parsedDate = new Date(`${date}T00:00:00`);

      if (!Number.isNaN(parsedDate.getTime())) {
        day = parsedDate.toLocaleDateString("en-US", {
          weekday: "short",
        });
      }
    }

    const startTime =
      student?.startTime ||
      student?.start_time ||
      lecture?.startTime ||
      lecture?.start_time ||
      "";

    const endTime =
      student?.endTime ||
      student?.end_time ||
      lecture?.endTime ||
      lecture?.end_time ||
      "";

    let time = "-";

    if (startTime && endTime) {
      time = `${startTime} - ${endTime}`;
    } else if (startTime) {
      time = startTime;
    } else if (student?.time) {
      time = student.time;
    } else if (lecture?.time) {
      time = lecture.time;
    }

    const professor =
      student?.teacherName ||
      student?.teacher_name ||
      student?.professorName ||
      student?.professor_name ||
      student?.teacher?.name ||
      lecture?.teacherName ||
      lecture?.teacher_name ||
      lecture?.professorName ||
      lecture?.professor_name ||
      "-";

    return {
      lectureCode,
      date,
      day: day || "-",
      time,
      professor,
    };
  };

  // Format date for display.
  const formatDate = (date) => {
    if (!date || date === "-") return "-";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    let cancelled = false;

    const loadSubjects = async () => {
      try {
        const response = await getSubjects();

        console.log("Full subjects response:", response);

        // Handle common API response formats.
        const subjectList = Array.isArray(response)
          ? response
          : Array.isArray(response?.subjects)
            ? response.subjects
            : Array.isArray(response?.data)
              ? response.data
              : Array.isArray(response?.items)
                ? response.items
                : [];

        console.log("Loaded subject list:", subjectList);

        if (!cancelled) {
          setSubjects(subjectList);
        }
      } catch (error) {
        console.error("Failed to load subjects:", error);
        if (!cancelled) {
          setSubjects([]);
        }
      }
    };

    loadSubjects();

    return () => {
      cancelled = true;
    };
  }, []);

  // Filter backend-loaded students.
  const filteredStudents = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return students.filter((student) => {
      const lecture = getLectureInfo(student);

      const searchText = [
        student?.registrationNo,
        student?.registration_number,
        student?.rollNo,
        student?.roll_number,
        student?.name,
        student?.full_name,
        student?.course,
        student?.department,
        student?.section,
        student?.email,
        student?.phone,
        lecture.lectureCode,
        lecture.date,
        lecture.day,
        lecture.time,
        lecture.professor,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !searchValue || searchText.includes(searchValue);

      const matchesCourse = !courseFilter || student?.course === courseFilter;

      const matchesSemester =
        !semesterFilter || String(student?.semester ?? "") === semesterFilter;

      const matchesStatus =
        !statusFilter || (student?.status || "Active") === statusFilter;
      const matchesSubject =
        !subjectFilter ||
        getStudentSubjectNames(student).includes(subjectFilter) ||
        getStudentSubjectNames(student).includes(
          subjects.find(
            (subject) =>
              (subject.subject_name || subject.subject_code) === subjectFilter,
          )?.subject_code,
        );

      return (
        matchesSearch &&
        matchesCourse &&
        matchesSemester &&
        matchesSubject &&
        matchesStatus
      );
    });
  }, [
    students,
    search,
    courseFilter,
    departmentFilter,
    semesterFilter,
    subjectFilter,
    statusFilter,
    subjects,
  ]);

  // Pagination.
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const safeCurrentPage =
    totalPages > 0 ? Math.min(currentPage, totalPages) : 1;

  const startIndex = (safeCurrentPage - 1) * studentsPerPage;

  const currentStudents = filteredStudents.slice(
    startIndex,
    startIndex + studentsPerPage,
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }

    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);
  useEffect(() => {
    setSubjectFilter("");
    setCurrentPage(1);
  }, [courseFilter, departmentFilter, semesterFilter]);
  // Resolve a consistent identifier for API requests and React state.
  const getStudentId = (student) =>
    String(
      student?.id ??
        student?._id ??
        student?.registrationNo ??
        student?.registration_number ??
        "",
    );

  // Delete student from the backend first.
  const handleDelete = async (student) => {
    const id = getStudentId(student);

    if (!id) {
      toast.error("Student ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${
        student?.name || student?.full_name || "this student"
      }?`,
    );

    if (!confirmed) return;

    if (typeof studentService?.delete !== "function") {
      toast.error("Student delete service is not configured correctly.");
      console.error(
        "Expected studentService.delete(studentId) in studentService.js",
      );
      return;
    }

    setOpenMenu(null);
    setDeletingId(id);

    try {
      await studentService.delete(id);

      dispatch({
        type: "DELETE_STUDENT",
        payload: id,
      });

      toast.success("Student deleted successfully!");
    } catch (error) {
      console.error("Delete student error:", error);

      toast.error(
        error?.message || "Unable to delete student. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Student initials.
  const getInitials = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "ST";

  // Clear filters.
  const clearFilters = () => {
    setSearch("");
    setCourseFilter("");
    setDepartmentFilter("");
    setSemesterFilter("");
    setStatusFilter("");
    setSubjectFilter("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search ||
    courseFilter ||
    departmentFilter ||
    semesterFilter ||
    statusFilter ||
    subjectFilter;

  // Student fields can be normalized by StudentContext or read directly.
  const getRegistrationNo = (student) =>
    student?.registrationNo ||
    student?.registration_number ||
    student?.registrationNumber ||
    "-";

  const getRollNo = (student) =>
    student?.rollNo ||
    student?.roll_number ||
    student?.rollNumber ||
    student?.roll_no ||
    "-";

  const getStudentName = (student) =>
    student?.name || student?.full_name || student?.fullName || "-";

  const openStudent = (student) => {
    const id = getStudentId(student);

    if (!id) {
      toast.error("Student ID is missing.");
      return;
    }

    navigate(`/students/${encodeURIComponent(id)}`);
  };

  const editStudent = (student) => {
    const id = getStudentId(student);

    if (!id) {
      toast.error("Student ID is missing.");
      return;
    }

    navigate(`/students/edit/${encodeURIComponent(id)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap size={26} className="text-indigo-600" />
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Students
              </h1>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Manage students and view lecture-wise attendance information.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/students/add")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto"
          >
            <Plus size={18} />
            Add Student
          </button>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Registration no, roll no, name..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            {/* Course */}
            <div className="relative">
              <select
                value={courseFilter}
                onChange={(event) => {
                  setCourseFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              >
                {COURSE_OPTIONS.map((course) => (
                  <option key={course.value} value={course.value}>
                    {course.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
            {/* Semester */}
            <div className="relative">
              <select
                value={semesterFilter}
                onChange={(event) => {
                  setSemesterFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              >
                {SEMESTER_OPTIONS.map((semester) => (
                  <option key={semester.value} value={semester.value}>
                    {semester.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
            {/* Status */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {/* Subject Filter */}
            <div className="relative z-50">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Subject Filter
              </label>

              <button
                type="button"
                onClick={() => setSubjectDropdownOpen((open) => !open)}
                className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 text-left text-sm text-slate-700 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                aria-expanded={subjectDropdownOpen}
              >
                <span className="truncate">
                  {availableSubjects.find(
                    (subject) => subject.value === subjectFilter,
                  )?.label || "All Subjects"}
                </span>

                <ChevronDown
                  size={17}
                  className={`shrink-0 transition-transform ${
                    subjectDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {subjectDropdownOpen && (
                <div className="absolute left-0 top-full z-[100] mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                  {availableSubjects.length > 0 ? (
                    availableSubjects.map((subject) => (
                      <button
                        key={subject.value}
                        type="button"
                        onClick={() => {
                          setSubjectFilter(subject.value);
                          setCurrentPage(1);
                          setSubjectDropdownOpen(false);
                        }}
                        className={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-indigo-50 ${
                          subjectFilter === subject.value
                            ? "bg-indigo-50 font-semibold text-indigo-700"
                            : "text-slate-700"
                        }`}
                      >
                        {subject.label}
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-3 text-sm text-slate-500">
                      No subjects available
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                {filteredStudents.length} student
                {filteredStudents.length !== 1 ? "s" : ""} found
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="text-left text-sm font-semibold text-indigo-600 hover:text-indigo-700 sm:text-right"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
          <table className="w-full table-fixed text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="w-[12%] px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Registration
                </th>
                <th className="w-[6%] px-2 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Roll
                </th>
                <th className="w-[17%] px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Student
                </th>
                <th className="w-[7%] px-2 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Course
                </th>
                <th className="w-[8%] px-2 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Semester
                </th>
                <th className="w-[10%] px-2 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Lecture
                </th>
                <th className="w-[12%] px-2 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Date / Day
                </th>
                <th className="w-[9%] px-2 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Time
                </th>
                <th className="w-[11%] px-2 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Professor
                </th>
                <th className="w-[6%] px-2 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="w-[5%] px-2 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-5 py-16 text-center text-sm text-slate-500"
                  >
                    Loading students...
                  </td>
                </tr>
              ) : currentStudents.length > 0 ? (
                currentStudents.map((student) => {
                  const lecture = getLectureInfo(student);
                  const id = getStudentId(student);
                  const name = getStudentName(student);
                  const status = student.status || "Active";

                  return (
                    <tr key={id} className="transition hover:bg-slate-50">
                      <td className="px-3 py-3">
                        <span className="break-all text-[11px] font-semibold text-indigo-700">
                          {getRegistrationNo(student)}
                        </span>
                      </td>

                      <td className="px-2 py-3 text-[11px] font-medium text-slate-700">
                        {getRollNo(student)}
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex min-w-0 items-center gap-2">
                          {student.image ? (
                            <img
                              src={student.image}
                              alt={name}
                              className="h-8 w-8 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600">
                              {getInitials(name)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-800">
                              {name}
                            </p>
                            <p className="truncate text-[9px] text-slate-400">
                              {student.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-3 text-[11px] font-medium text-slate-700">
                        {student.course || "-"}
                      </td>

                      <td className="px-2 py-3 text-[11px] text-slate-700">
                        {student.semester ? `Sem ${student.semester}` : "-"}
                      </td>

                      <td className="px-2 py-3">
                        <span className="block truncate text-[10px] font-semibold text-indigo-600">
                          {lecture.lectureCode}
                        </span>
                      </td>

                      <td className="px-2 py-3">
                        <p className="text-[10px] font-medium text-slate-700">
                          {formatDate(lecture.date)}
                        </p>
                        <p className="text-[9px] text-slate-400">
                          {lecture.day}
                        </p>
                      </td>

                      <td className="px-2 py-3">
                        <span className="block truncate text-[9px] text-slate-600">
                          {lecture.time}
                        </span>
                      </td>

                      <td className="px-2 py-3">
                        <span
                          title={lecture.professor}
                          className="block truncate text-[10px] font-medium text-slate-700"
                        >
                          {lecture.professor}
                        </span>
                      </td>

                      <td className="px-2 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-[9px] font-semibold ${
                            status === "Active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="relative px-2 py-3">
                        <button
                          type="button"
                          disabled={deletingId === id}
                          onClick={() =>
                            setOpenMenu(openMenu === id ? null : id)
                          }
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
                          aria-label={`Actions for ${name}`}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {openMenu === id && (
                          <div className="absolute right-2 top-10 z-30 w-36 rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenu(null);
                                openStudent(student);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                            >
                              <Eye size={15} />
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenu(null);
                                editStudent(student);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                            >
                              <Pencil size={15} />
                              Edit
                            </button>

                            <button
                              type="button"
                              disabled={deletingId === id}
                              onClick={() => handleDelete(student)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 size={15} />
                              {deletingId === id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="px-5 py-16 text-center">
                    <UserRound size={40} className="mx-auto text-slate-300" />
                    <p className="mt-3 font-semibold text-slate-700">
                      No students found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center text-sm text-slate-500 shadow-sm">
              Loading students...
            </div>
          ) : currentStudents.length > 0 ? (
            currentStudents.map((student) => {
              const lecture = getLectureInfo(student);
              const id = getStudentId(student);
              const name = getStudentName(student);
              const status = student.status || "Active";

              return (
                <div
                  key={id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {student.image ? (
                        <img
                          src={student.image}
                          alt={name}
                          className="h-11 w-11 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                          {getInitials(name)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-800">
                          {name}
                        </h3>
                        <p className="truncate text-[10px] text-slate-400">
                          {student.email || "No email"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={deletingId === id}
                      onClick={() => setOpenMenu(openMenu === id ? null : id)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                      aria-label={`Actions for ${name}`}
                    >
                      <MoreVertical size={17} />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                    <Info
                      label="Registration No"
                      value={getRegistrationNo(student)}
                      highlight
                    />
                    <Info label="Roll No" value={getRollNo(student)} />
                    <Info label="Course" value={student.course} />
                    <Info label="Department" value={student.department} />
                    <Info
                      label="Semester"
                      value={
                        student.semester ? `Semester ${student.semester}` : "-"
                      }
                    />
                    <Info
                      label="Lecture Code"
                      value={lecture.lectureCode}
                      highlight
                    />
                    <Info label="Date" value={formatDate(lecture.date)} />
                    <Info label="Day" value={lecture.day} />
                    <Info label="Time" value={lecture.time} />
                    <div className="col-span-2">
                      <Info label="Professor" value={lecture.professor} />
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400">Status</p>
                      <span
                        className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>

                  {openMenu === id && (
                    <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          openStudent(student);
                        }}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700"
                      >
                        <Eye size={15} />
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          editStudent(student);
                        }}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-600"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === id}
                        onClick={() => handleDelete(student)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                        {deletingId === id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
              <UserRound size={40} className="mx-auto text-slate-300" />
              <p className="mt-3 font-semibold text-slate-700">
                No students found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredStudents.length > 0 && !loading && (
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-700">
                {Math.min(
                  startIndex + studentsPerPage,
                  filteredStudents.length,
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {filteredStudents.length}
              </span>{" "}
              students
            </p>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="min-w-24 text-center text-sm font-medium text-slate-700">
                Page {safeCurrentPage} of {totalPages || 1}
              </span>

              <button
                type="button"
                disabled={safeCurrentPage === totalPages || totalPages === 0}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Small information component used in mobile cards.
const Info = ({ label, value, highlight = false }) => (
  <div className="min-w-0">
    <p className="text-[10px] text-slate-400">{label}</p>
    <p
      className={`mt-1 break-words text-xs font-medium ${
        highlight ? "text-indigo-700" : "text-slate-700"
      }`}
    >
      {value || "-"}
    </p>
  </div>
);

export default StudentList;
