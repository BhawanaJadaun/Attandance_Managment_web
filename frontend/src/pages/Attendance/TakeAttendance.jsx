import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Search,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useStudents } from "../../context/StudentContext";
import { apiGet, apiPost } from "../../services/api";
import * as attendanceServiceModule from "../../services/attendanceService";

// The global Toaster is already configured in main.jsx.
// This file imports toast only to trigger notifications.

const getItems = (response) => {
  if (Array.isArray(response)) return response;

  return (
    response?.items ??
    response?.data?.items ??
    response?.data ??
    response?.students ??
    response?.subjects ??
    response?.professors ??
    []
  );
};

const getSemesterCount = (course) => {
  const value = String(course || "")
    .toLowerCase()
    .trim();

  if (
    value.includes("b.tech") ||
    value.includes("btech") ||
    value.includes("bachelor of technology") ||
    value.includes("b.e.")
  ) {
    return 8;
  }

  if (
    ["mca", "mba", "m.tech", "m.com", "m.sc"].some(
      (item) => value === item || value.includes(item),
    ) ||
    value.includes("master")
  ) {
    return 4;
  }

  return 6;
};

const normalizeStudent = (student = {}) => ({
  ...student,
  id: String(student.id ?? student._id ?? ""),
  registrationNo: String(
    student.registrationNo ??
      student.registration_number ??
      student.registrationNumber ??
      "",
  ),
  rollNo: String(
    student.rollNo ??
      student.roll_number ??
      student.rollNumber ??
      student.roll_no ??
      "",
  ),
  name: String(student.name ?? student.full_name ?? student.fullName ?? ""),
  course: String(student.course ?? ""),
  department: String(student.department ?? ""),
  semester: String(student.semester ?? ""),
});

const normalizeSubject = (subject = {}) => ({
  ...subject,
  subjectCode: String(
    subject.subjectCode ?? subject.subject_code ?? subject.code ?? "",
  ),
  subjectName: String(
    subject.subjectName ?? subject.subject_name ?? subject.name ?? "",
  ),
  course: String(subject.course ?? ""),
  department: String(subject.department ?? ""),
  semester: String(subject.semester ?? ""),
});

const normalizeProfessor = (professor = {}) => ({
  ...professor,
  professorId: String(
    professor.professorId ??
      professor.professor_id ??
      professor.professor_code ??
      professor.id ??
      professor._id ??
      "",
  ),
  name: String(
    professor.name ?? professor.full_name ?? professor.fullName ?? "",
  ),
  department: String(professor.department ?? ""),
});

const getAttendanceService = () =>
  attendanceServiceModule.attendanceService ??
  attendanceServiceModule.default ??
  attendanceServiceModule;

const getErrorMessage = (error) =>
  error?.message ||
  error?.detail ||
  error?.response?.data?.detail ||
  "Something went wrong. Please try again.";

const isDuplicateError = (error) => {
  const message = getErrorMessage(error).toLowerCase();

  return (
    error?.status === 409 ||
    error?.response?.status === 409 ||
    message.includes("duplicate") ||
    message.includes("already exists") ||
    message.includes("already marked")
  );
};

const TakeAttendance = () => {
  const navigate = useNavigate();
  const { students: contextStudents = [], loading: studentsLoading = false } =
    useStudents();

  const [subjects, setSubjects] = useState([]);
  const [professors, setProfessors] = useState([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  const [course, setCourse] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [lectureCode, setLectureCode] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [search, setSearch] = useState("");
  const [attendance, setAttendance] = useState({});
  const [error, setError] = useState("");

  const students = useMemo(
    () => contextStudents.map(normalizeStudent),
    [contextStudents],
  );

  // Load subjects and professors from the backend.
  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      setLoadingOptions(true);

      try {
        const [subjectResponse, professorResponse] = await Promise.all([
          apiGet("/api/subjects/"),
          apiGet("/api/professors/"),
        ]);

        if (!active) return;

        setSubjects(getItems(subjectResponse).map(normalizeSubject));
        setProfessors(getItems(professorResponse).map(normalizeProfessor));
      } catch (err) {
        console.error("Unable to load subjects and professors:", err);

        if (active) {
          toast.error(
            "Unable to load subjects or professors. Check the backend and try again.",
          );
        }
      } finally {
        if (active) setLoadingOptions(false);
      }
    };

    loadOptions();

    return () => {
      active = false;
    };
  }, []);

  const semesters = useMemo(() => {
    if (!course) return [];

    return Array.from({ length: getSemesterCount(course) }, (_, index) =>
      String(index + 1),
    );
  }, [course]);

  // Registration number is the primary student identifier.
  const getStudentKey = useCallback((student) => {
    return String(
      student?.registrationNo ||
        student?.registration_number ||
        student?._id ||
        student?.id ||
        "",
    ).trim();
  }, []);

  const uniqueCourses = useMemo(
    () => [
      ...new Set(students.map((student) => student.course).filter(Boolean)),
    ],
    [students],
  );

  const departments = useMemo(
    () => [
      ...new Set(
        students
          .filter((student) => !course || student.course === course)
          .map((student) => student.department)
          .filter(Boolean),
      ),
    ],
    [students, course],
  );

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.subjectCode === subjectCode),
    [subjects, subjectCode],
  );

  const selectedProfessor = useMemo(
    () => professors.find((professor) => professor.professorId === professorId),
    [professors, professorId],
  );

  const subjectOptions = useMemo(() => {
    if (!course || !department || !semester) return [];

    return subjects
      .filter(
        (subject) =>
          subject.course === course &&
          subject.department === department &&
          String(subject.semester) === String(semester),
      )
      .map((subject) => subject.subjectCode)
      .filter(Boolean);
  }, [subjects, course, department, semester]);

  const professorOptions = useMemo(() => {
    if (!department) return [];

    return professors
      .filter((professor) => professor.department === department)
      .map((professor) => professor.professorId)
      .filter(Boolean);
  }, [professors, department]);

  const filteredStudents = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return students.filter((student) => {
      const matchesCourse = !course || student.course === course;
      const matchesDepartment =
        !department || student.department === department;
      const matchesSemester =
        !semester || String(student.semester) === String(semester);

      const matchesSearch =
        !searchText ||
        student.registrationNo.toLowerCase().includes(searchText) ||
        student.rollNo.toLowerCase().includes(searchText) ||
        student.name.toLowerCase().includes(searchText);

      return (
        matchesCourse && matchesDepartment && matchesSemester && matchesSearch
      );
    });
  }, [students, course, department, semester, search]);

  const presentCount = filteredStudents.filter(
    (student) => attendance[getStudentKey(student)] === true,
  ).length;

  const absentCount = filteredStudents.filter(
    (student) => attendance[getStudentKey(student)] === false,
  ).length;

  const unmarkedCount = filteredStudents.length - presentCount - absentCount;

  const attendancePercentage =
    filteredStudents.length > 0
      ? Math.round((presentCount / filteredStudents.length) * 100)
      : 0;

  const resetAttendance = () => setAttendance({});

  const handleCourseChange = (value) => {
    setCourse(value);
    setDepartment("");
    setSemester("");
    setSubjectCode("");
    setProfessorId("");
    resetAttendance();
    setError("");
  };

  const handleDepartmentChange = (value) => {
    setDepartment(value);
    setSemester("");
    setSubjectCode("");
    setProfessorId("");
    resetAttendance();
    setError("");
  };

  const handleSemesterChange = (value) => {
    setSemester(value);
    setSubjectCode("");
    setProfessorId("");
    resetAttendance();
    setError("");
  };

  const markStudent = (student, status) => {
    const key = getStudentKey(student);

    if (!key) {
      toast.error("This student has no registration number.");
      return;
    }

    setAttendance((previous) => ({
      ...previous,
      [key]: status,
    }));

    setError("");
  };

  const markAll = (status) => {
    setAttendance((previous) => {
      const updated = { ...previous };

      filteredStudents.forEach((student) => {
        const key = getStudentKey(student);
        if (key) updated[key] = status;
      });

      return updated;
    });

    setError("");
  };

  const validateForm = () => {
    if (!course) return "Please select a course.";
    if (!department) return "Please select a department.";
    if (!semester) return "Please select a semester.";
    if (!subjectCode) return "Please select a subject.";
    if (!professorId) return "Please select a professor.";
    if (!lectureCode.trim()) return "Please enter the lecture code.";
    if (!date) return "Please select the lecture date.";
    if (!startTime || !endTime) {
      return "Please select lecture start and end time.";
    }
    if (startTime >= endTime) {
      return "End time must be later than start time.";
    }
    if (filteredStudents.length === 0) {
      return "No students found for the selected class.";
    }
    if (unmarkedCount > 0) {
      return `Please mark attendance for all students. ${unmarkedCount} student(s) are still unmarked.`;
    }

    const missingRegistration = filteredStudents.some(
      (student) => !getStudentKey(student),
    );

    if (missingRegistration) {
      return "One or more students do not have a registration number.";
    }

    return "";
  };

  const handleSave = async () => {
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    const cleanLectureCode = lectureCode.trim().toUpperCase();

    const records = filteredStudents.map((student) => ({
      lectureCode: cleanLectureCode,
      date,
      startTime,
      endTime,
      subjectCode: selectedSubject?.subjectCode || subjectCode,
      subjectName: selectedSubject?.subjectName || "",
      professorId: selectedProfessor?.professorId || professorId,
      professorName: selectedProfessor?.name || "",
      course,
      department,
      semester,
      registrationNo: getStudentKey(student),
      rollNo: student.rollNo,
      studentName: student.name,
      present: attendance[getStudentKey(student)] === true,
    }));

    setSaving(true);
    const attendanceService = getAttendanceService();

    try {
      // Create the lecture first, because the attendance endpoint checks
      // that its lecture code exists in the backend.
      const lecturePayload = {
        lecture_code: cleanLectureCode,
        date,
        lecture_date: date,
        day: new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
          weekday: "long",
        }),
        start_time: startTime,
        end_time: endTime,
        subject_code: selectedSubject?.subjectCode || subjectCode,
        subject_name: selectedSubject?.subjectName || "",
        professor_id: selectedProfessor?.professorId || professorId,
        professor_name: selectedProfessor?.name || "",
        course,
        department,
        semester: Number(semester),
      };

      try {
        await apiPost("/api/lectures/", lecturePayload);
      } catch (lectureError) {
        // A lecture may already exist. In that case, try marking attendance
        // against the existing lecture code. Other errors must be shown.
        if (!isDuplicateError(lectureError)) {
          throw lectureError;
        }
      }

      if (typeof attendanceService.mark !== "function") {
        throw new Error(
          "attendanceService.mark() was not found. Check src/services/attendanceService.js.",
        );
      }

      let savedCount = 0;
      const failedRecords = [];

      // Sequential requests make it easier to identify duplicate records
      // and avoid overwhelming the backend.
      for (const record of records) {
        try {
          await attendanceService.mark({
            lecture_code: record.lectureCode,
            registration_number: record.registrationNo,
            present: record.present,
          });

          savedCount += 1;
        } catch (recordError) {
          failedRecords.push({
            registrationNo: record.registrationNo,
            error: getErrorMessage(recordError),
            duplicate: isDuplicateError(recordError),
          });
        }
      }

      if (failedRecords.length > 0) {
        console.error("Attendance records not saved:", failedRecords);

        const duplicates = failedRecords.filter(
          (record) => record.duplicate,
        ).length;

        const otherFailures = failedRecords.length - duplicates;

        if (savedCount > 0) {
          toast.error(
            `${savedCount} record(s) saved; ${failedRecords.length} failed. ${
              duplicates ? `${duplicates} already existed. ` : ""
            }${otherFailures ? `${otherFailures} had other errors.` : ""}`,
            { duration: 6000 },
          );
        } else if (duplicates === failedRecords.length) {
          toast.error(
            "Attendance already exists for this lecture and student registration number.",
            { duration: 5000 },
          );
        } else {
          toast.error(
            `Attendance could not be saved. ${getErrorMessage(
              failedRecords[0] && { message: failedRecords[0].error },
            )}`,
            { duration: 5000 },
          );
        }

        return;
      }

      toast.success(`Attendance saved for ${savedCount} student(s)!`);
      navigate("/attendance");
    } catch (err) {
      console.error("Unable to save attendance:", err);
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message, { duration: 5000 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/attendance")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Take Attendance
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Record attendance for a selected lecture.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <XCircle size={19} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {(studentsLoading || loadingOptions) && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Loading students, subjects and professors from the backend...
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ClipboardCheck size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">
                Lecture Information
              </h2>
              <p className="text-xs text-slate-500">
                Select the class, subject, professor and lecture schedule.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SelectField
              label="Course"
              value={course}
              onChange={handleCourseChange}
              options={uniqueCourses}
              placeholder="Select course"
            />

            <SelectField
              label="Department"
              value={department}
              onChange={handleDepartmentChange}
              options={departments}
              placeholder={course ? "Select department" : "Select course first"}
              disabled={!course}
            />

            <SelectField
              label="Semester"
              value={semester}
              onChange={handleSemesterChange}
              options={semesters}
              placeholder={
                !course
                  ? "Select course first"
                  : !department
                    ? "Select department first"
                    : "Select semester"
              }
              disabled={!course || !department}
              formatOption={(option) => `Semester ${option}`}
            />

            <SelectField
              label="Subject"
              value={subjectCode}
              onChange={(value) => {
                setSubjectCode(value);
                setError("");
              }}
              options={subjectOptions}
              placeholder="Select subject"
              disabled={!course || !department || !semester}
              formatOption={(option) => {
                const subject = subjects.find(
                  (item) => item.subjectCode === option,
                );

                return subject
                  ? `${subject.subjectCode} - ${subject.subjectName}`
                  : option;
              }}
            />

            <SelectField
              label="Professor"
              value={professorId}
              onChange={(value) => {
                setProfessorId(value);
                setError("");
              }}
              options={professorOptions}
              placeholder={
                department ? "Select professor" : "Select department first"
              }
              disabled={!department}
              formatOption={(option) => {
                const professor = professors.find(
                  (item) => item.professorId === option,
                );

                return professor
                  ? `${professor.name} (${professor.professorId})`
                  : option;
              }}
            />

            <InputField
              label="Lecture Code"
              value={lectureCode}
              onChange={(value) => setLectureCode(value)}
              placeholder="e.g. LEC001"
            />

            <InputField
              label="Date"
              type="date"
              value={date}
              onChange={setDate}
              icon={CalendarDays}
            />

            <InputField
              label="Start Time"
              type="time"
              value={startTime}
              onChange={setStartTime}
              icon={Clock3}
            />

            <InputField
              label="End Time"
              type="time"
              value={endTime}
              onChange={setEndTime}
              icon={Clock3}
            />
          </div>

          {(course || department || semester || subjectCode) && (
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
                Selected Class
              </p>
              <div className="flex flex-wrap gap-2">
                {course && <Badge>{course}</Badge>}
                {department && <Badge>{department}</Badge>}
                {semester && <Badge>Semester {semester}</Badge>}
                {selectedSubject && (
                  <Badge>
                    {selectedSubject.subjectCode} -{" "}
                    {selectedSubject.subjectName}
                  </Badge>
                )}
                {selectedProfessor && <Badge>{selectedProfessor.name}</Badge>}
              </div>
            </div>
          )}
        </section>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            icon={Users}
            label="Total Students"
            value={filteredStudents.length}
            iconClass="bg-blue-50 text-blue-600"
          />
          <SummaryCard
            icon={CheckCircle2}
            label="Present"
            value={presentCount}
            iconClass="bg-emerald-50 text-emerald-600"
          />
          <SummaryCard
            icon={XCircle}
            label="Absent"
            value={absentCount}
            iconClass="bg-red-50 text-red-600"
          />
          <SummaryCard
            icon={ClipboardCheck}
            label="Attendance"
            value={`${attendancePercentage}%`}
            iconClass="bg-slate-100 text-slate-700"
          />
        </div>

        <section className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Students</h2>
              <p className="mt-1 text-xs text-slate-500">
                Mark each student as present or absent.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search student..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-56"
                />
              </div>

              <button
                type="button"
                onClick={() => markAll(true)}
                disabled={filteredStudents.length === 0 || saving}
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check size={16} />
                All Present
              </button>

              <button
                type="button"
                onClick={() => markAll(false)}
                disabled={filteredStudents.length === 0 || saving}
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={16} />
                All Absent
              </button>
            </div>
          </div>

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
                    Attendance
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      {studentsLoading
                        ? "Loading students..."
                        : course && department && semester
                          ? "No students found for this class."
                          : "Select course, department and semester to view students."}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const key = getStudentKey(student);
                    const status = attendance[key];

                    return (
                      <tr
                        key={key || student.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-5 py-4 text-sm font-medium text-slate-800">
                          {student.registrationNo || "-"}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {student.rollNo || "-"}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-800">
                          {student.name || "-"}
                        </td>
                        <td className="px-5 py-4">
                          <AttendanceButtons
                            status={status}
                            disabled={saving}
                            onPresent={() => markStudent(student, true)}
                            onAbsent={() => markStudent(student, false)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {filteredStudents.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                {studentsLoading
                  ? "Loading students..."
                  : course && department && semester
                    ? "No students found for this class."
                    : "Select course, department and semester."}
              </div>
            ) : (
              filteredStudents.map((student) => {
                const key = getStudentKey(student);

                return (
                  <div
                    key={key || student.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="mb-3">
                      <p className="font-semibold text-slate-900">
                        {student.name || "-"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {student.registrationNo || "-"} {" • "} Roll No.{" "}
                        {student.rollNo || "-"}
                      </p>
                    </div>

                    <AttendanceButtons
                      status={attendance[key]}
                      disabled={saving}
                      onPresent={() => markStudent(student, true)}
                      onAbsent={() => markStudent(student, false)}
                      mobile
                    />
                  </div>
                );
              })
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              {filteredStudents.length === 0
                ? "No students selected."
                : unmarkedCount > 0
                  ? `${unmarkedCount} student(s) still unmarked`
                  : "All students have been marked."}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate("/attendance")}
                disabled={saving}
                className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || studentsLoading || loadingOptions}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check size={17} />
                {saving ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
}) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      )}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`h-11 w-full rounded-xl border border-slate-200 bg-white ${
          Icon ? "pl-10" : "px-3"
        } pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
      />
    </div>
  </div>
);

const SelectField = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select",
  formatOption,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const selectedOption = options.find(
    (option) => String(option) === String(value),
  );

  const selectedLabel = selectedOption
    ? formatOption
      ? formatOption(selectedOption)
      : selectedOption
    : placeholder;

  const handleSelect = (option) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((previous) => !previous)}
        className={`flex h-11 w-full items-center justify-between rounded-xl border bg-white px-3 text-left text-sm outline-none transition ${
          disabled
            ? "cursor-not-allowed bg-slate-50 text-slate-400"
            : open
              ? "border-blue-500 ring-2 ring-blue-100"
              : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <span
          className={`truncate ${
            selectedOption ? "text-slate-700" : "text-slate-400"
          }`}
        >
          {selectedLabel}
        </span>
        <ChevronDown
          size={17}
          className={`ml-2 shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full z-[9999] mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
          <button
            type="button"
            onClick={() => handleSelect("")}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-slate-50 ${
              !value ? "bg-blue-50 text-blue-700" : "text-slate-500"
            }`}
          >
            <span>{placeholder}</span>
            {!value && <Check size={16} className="text-blue-600" />}
          </button>

          {options.length === 0 ? (
            <div className="px-3 py-3 text-sm text-slate-400">
              No options available
            </div>
          ) : (
            options.map((option) => {
              const isSelected = String(option) === String(value);
              const displayText = formatOption ? formatOption(option) : option;

              return (
                <button
                  type="button"
                  key={String(option)}
                  onClick={() => handleSelect(option)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    isSelected
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{displayText}</span>
                  {isSelected && (
                    <Check size={16} className="ml-2 shrink-0 text-blue-600" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const AttendanceButtons = ({
  status,
  disabled,
  onPresent,
  onAbsent,
  mobile = false,
}) => (
  <div className={mobile ? "grid grid-cols-2 gap-2" : "flex justify-end gap-2"}>
    <button
      type="button"
      disabled={disabled}
      onClick={onPresent}
      className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
        status === true
          ? "bg-emerald-600 text-white shadow-sm"
          : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      }`}
    >
      <Check size={14} />
      Present
    </button>

    <button
      type="button"
      disabled={disabled}
      onClick={onAbsent}
      className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
        status === false
          ? "bg-red-600 text-white shadow-sm"
          : "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
      }`}
    >
      <X size={14} />
      Absent
    </button>
  </div>
);

const SummaryCard = ({ icon: Icon, label, value, iconClass }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
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

const Badge = ({ children }) => (
  <span className="rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700">
    {children}
  </span>
);

export default TakeAttendance;
