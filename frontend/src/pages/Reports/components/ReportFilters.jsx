import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  Filter,
  GraduationCap,
  BookOpen,
  CalendarDays,
  X,
} from "lucide-react";

/* =========================================================
   COURSE OPTIONS
========================================================= */

const COURSE_OPTIONS = [
  "B.Tech",
  "BCA",
  "MCA",
  "BBA",
  "MBA",
  "B.Com",
];

/* =========================================================
   DEPARTMENT OPTIONS
   MATCHES reportDummyData.js
========================================================= */

const DEPARTMENT_OPTIONS = {
  "B.Tech": [
    "Information Technology",
    "Computer Science & Engineering",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
  ],

  BCA: ["Computer Science"],

  MCA: ["Computer Science"],

  BBA: ["Management"],

  MBA: ["Management"],

  "B.Com": ["Commerce"],
};

/* =========================================================
   SEMESTER OPTIONS
========================================================= */

const getSemesterOptions = (course) => {
  if (!course) return [];

  const fourSemesterCourses = ["MCA", "MBA"];

  const count = fourSemesterCourses.includes(course) ? 4 : 6;

  return Array.from(
    { length: count },
    (_, index) => String(index + 1)
  );
};

/* =========================================================
   HELPERS
========================================================= */

const getValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const sameValue = (a, b) =>
  getValue(a).toLowerCase() === getValue(b).toLowerCase();

const getCourse = (item) =>
  getValue(item?.course || item?.program);

const getDepartment = (item) =>
  getValue(item?.department || item?.dept);

const getSemester = (item) =>
  getValue(item?.semester || item?.sem);

const getSubjectCode = (item) =>
  getValue(
    item?.subjectCode ||
      item?.subject_code ||
      item?.code
  );

const getSubjectName = (item) =>
  getValue(
    item?.subjectName ||
      item?.subject ||
      item?.name
  );

const getProfessorId = (item) =>
  getValue(
    item?.professorId ||
      item?.professorID ||
      item?.teacherId ||
      item?.teacherID ||
      item?.facultyId ||
      item?.id
  );

const getProfessorName = (item) =>
  getValue(
    item?.professorName ||
      item?.professor ||
      item?.teacherName ||
      item?.name
  );

const getLectureCode = (item) =>
  getValue(
    item?.lectureCode ||
      item?.lecture_code
  );

/* =========================================================
   CUSTOM DROPDOWN
   ALWAYS OPENS BELOW
========================================================= */

const Dropdown = ({
  label,
  value,
  options = [],
  onChange,
  placeholder = "Select",
  disabled = false,
  icon: Icon,
  getOptionLabel,
  getOptionValue,
}) => {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((option) => {
    const optionValue = getOptionValue
      ? getOptionValue(option)
      : option;

    return sameValue(optionValue, value);
  });

  const displayValue = selectedOption
    ? getOptionLabel
      ? getOptionLabel(selectedOption)
      : selectedOption
    : "";

  return (
    <div className="relative w-full min-w-0">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
          }
        }}
        className={`flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-white px-3 text-left text-sm transition ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
            : open
            ? "border-indigo-500 ring-2 ring-indigo-100"
            : "border-slate-300 hover:border-indigo-400"
        }`}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {Icon && (
            <Icon className="h-4 w-4 shrink-0 text-slate-400" />
          )}

          <span
            className={`truncate ${
              displayValue
                ? "text-slate-700"
                : "text-slate-400"
            }`}
          >
            {displayValue || placeholder}
          </span>
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full z-[999] mt-2">
          <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
            {options.length === 0 ? (
              <div className="px-3 py-3 text-sm text-slate-400">
                No options available
              </div>
            ) : (
              options.map((option, index) => {
                const optionValue = getOptionValue
                  ? getOptionValue(option)
                  : option;

                const optionLabel = getOptionLabel
                  ? getOptionLabel(option)
                  : option;

                const selected = sameValue(
                  optionValue,
                  value
                );

                return (
                  <button
                    key={`${optionValue}-${index}`}
                    type="button"
                    onClick={() => {
                      onChange(optionValue);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${
                      selected
                        ? "bg-indigo-50 font-semibold text-indigo-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="min-w-0 truncate">
                      {optionLabel}
                    </span>

                    {selected && (
                      <span className="ml-2 shrink-0 text-indigo-600">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   REPORT FILTERS
========================================================= */

const ReportFilters = ({
  filters,
  updateFilter,
  resetFilters,
  students = [],
  professors = [],
  subjects = [],
  lectures = [],
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const selectedCourse = filters?.course || "";

  /* =======================================================
     DEPARTMENT
  ======================================================= */

  const departmentOptions = useMemo(() => {
    if (!selectedCourse) {
      return [];
    }

    const staticDepartments =
      DEPARTMENT_OPTIONS[selectedCourse] || [];

    const contextDepartments = [
      ...students,
      ...professors,
      ...subjects,
      ...lectures,
    ]
      .filter((item) =>
        sameValue(
          getCourse(item),
          selectedCourse
        )
      )
      .map((item) =>
        getDepartment(item)
      )
      .filter(Boolean);

    return [
      ...new Set([
        ...staticDepartments,
        ...contextDepartments,
      ]),
    ];
  }, [
    selectedCourse,
    students,
    professors,
    subjects,
    lectures,
  ]);

  /* =======================================================
     SEMESTER
  ======================================================= */

  const semesterOptions = useMemo(() => {
    if (!selectedCourse) {
      return [];
    }

    const staticSemesters =
      getSemesterOptions(selectedCourse);

    const contextSemesters = [
      ...students,
      ...professors,
      ...subjects,
      ...lectures,
    ]
      .filter((item) =>
        sameValue(
          getCourse(item),
          selectedCourse
        )
      )
      .filter((item) => {
        if (!filters?.department) {
          return true;
        }

        return sameValue(
          getDepartment(item),
          filters.department
        );
      })
      .map((item) =>
        getSemester(item)
      )
      .filter(Boolean);

    return [
      ...new Set([
        ...staticSemesters,
        ...contextSemesters,
      ]),
    ].sort(
      (a, b) =>
        Number(a) - Number(b)
    );
  }, [
    selectedCourse,
    filters?.department,
    students,
    professors,
    subjects,
    lectures,
  ]);

  /* =======================================================
     SUBJECT LIST

     COURSE
       ↓
     DEPARTMENT
       ↓
     SEMESTER
       ↓
     SUBJECT
  ======================================================= */

  const subjectOptions = useMemo(() => {
    if (!selectedCourse) {
      return [];
    }

    const map = new Map();

    /*
     * SUBJECTS FROM CONTEXT
     */

    subjects.forEach((subject) => {
      if (
        !sameValue(
          getCourse(subject),
          selectedCourse
        )
      ) {
        return;
      }

      if (
        filters?.department &&
        !sameValue(
          getDepartment(subject),
          filters.department
        )
      ) {
        return;
      }

      if (
        filters?.semester &&
        !sameValue(
          getSemester(subject),
          filters.semester
        )
      ) {
        return;
      }

      const code =
        getSubjectCode(subject);

      if (!code) {
        return;
      }

      map.set(code, {
        subjectCode: code,
        subjectName:
          getSubjectName(subject),
      });
    });

    /*
     * SUBJECTS FROM LECTURES
     */

    lectures.forEach((lecture) => {
      if (
        !sameValue(
          getCourse(lecture),
          selectedCourse
        )
      ) {
        return;
      }

      if (
        filters?.department &&
        !sameValue(
          getDepartment(lecture),
          filters.department
        )
      ) {
        return;
      }

      if (
        filters?.semester &&
        !sameValue(
          getSemester(lecture),
          filters.semester
        )
      ) {
        return;
      }

      const code =
        getSubjectCode(lecture);

      if (!code) {
        return;
      }

      if (!map.has(code)) {
        map.set(code, {
          subjectCode: code,
          subjectName:
            getSubjectName(lecture),
        });
      }
    });

    return Array.from(
      map.values()
    ).sort((a, b) =>
      String(
        a.subjectCode
      ).localeCompare(
        String(
          b.subjectCode
        )
      )
    );
  }, [
    selectedCourse,
    filters?.department,
    filters?.semester,
    subjects,
    lectures,
  ]);

  /* =======================================================
     PROFESSOR LIST

     COURSE
       ↓
     DEPARTMENT
       ↓
     SEMESTER
       ↓
     SUBJECT
       ↓
     PROFESSOR
  ======================================================= */

  const professorOptions = useMemo(() => {
    if (
      !selectedCourse ||
      !filters?.subjectCode
    ) {
      return [];
    }

    const map = new Map();

    /*
     * PROFESSORS FROM SUBJECTS
     */

    subjects.forEach((subject) => {
      if (
        !sameValue(
          getCourse(subject),
          selectedCourse
        )
      ) {
        return;
      }

      if (
        filters?.department &&
        !sameValue(
          getDepartment(subject),
          filters.department
        )
      ) {
        return;
      }

      if (
        filters?.semester &&
        !sameValue(
          getSemester(subject),
          filters.semester
        )
      ) {
        return;
      }

      if (
        !sameValue(
          getSubjectCode(subject),
          filters.subjectCode
        )
      ) {
        return;
      }

      const professorId =
        getProfessorId(subject);

      const professorName =
        getProfessorName(subject);

      if (
        professorId ||
        professorName
      ) {
        const id =
          professorId ||
          professorName;

        map.set(id, {
          professorId:
            professorId ||
            professorName,

          professorName:
            professorName ||
            professorId,
        });
      }
    });

    /*
     * PROFESSORS FROM LECTURES
     */

    lectures.forEach((lecture) => {
      if (
        !sameValue(
          getCourse(lecture),
          selectedCourse
        )
      ) {
        return;
      }

      if (
        filters?.department &&
        !sameValue(
          getDepartment(lecture),
          filters.department
        )
      ) {
        return;
      }

      if (
        filters?.semester &&
        !sameValue(
          getSemester(lecture),
          filters.semester
        )
      ) {
        return;
      }

      if (
        !sameValue(
          getSubjectCode(lecture),
          filters.subjectCode
        )
      ) {
        return;
      }

      const professorId =
        getProfessorId(lecture);

      const professorName =
        getProfessorName(lecture);

      if (
        professorId ||
        professorName
      ) {
        const id =
          professorId ||
          professorName;

        map.set(id, {
          professorId:
            professorId ||
            professorName,

          professorName:
            professorName ||
            professorId,
        });
      }
    });

    /*
     * ENRICH WITH PROFESSOR CONTEXT
     */

    professors.forEach((professor) => {
      const professorId =
        getProfessorId(professor);

      if (!professorId) {
        return;
      }

      if (
        map.has(professorId)
      ) {
        const current =
          map.get(professorId);

        map.set(
          professorId,
          {
            ...current,

            professorName:
              getProfessorName(
                professor
              ) ||
              current.professorName,
          }
        );
      }
    });

    return Array.from(
      map.values()
    ).sort((a, b) =>
      String(
        a.professorName
      ).localeCompare(
        String(
          b.professorName
        )
      )
    );
  }, [
    selectedCourse,
    filters?.department,
    filters?.semester,
    filters?.subjectCode,
    subjects,
    lectures,
    professors,
  ]);

  /* =======================================================
     LECTURE LIST
  ======================================================= */

  const lectureOptions = useMemo(() => {
    if (
      !selectedCourse ||
      !filters?.professorId
    ) {
      return [];
    }

    return lectures
      .filter((lecture) => {
        if (
          !sameValue(
            getCourse(lecture),
            selectedCourse
          )
        ) {
          return false;
        }

        if (
          filters?.department &&
          !sameValue(
            getDepartment(lecture),
            filters.department
          )
        ) {
          return false;
        }

        if (
          filters?.semester &&
          !sameValue(
            getSemester(lecture),
            filters.semester
          )
        ) {
          return false;
        }

        if (
          filters?.subjectCode &&
          !sameValue(
            getSubjectCode(lecture),
            filters.subjectCode
          )
        ) {
          return false;
        }

        if (
          !sameValue(
            getProfessorId(lecture),
            filters.professorId
          )
        ) {
          return false;
        }

        return true;
      })
      .filter(
        (lecture, index, array) =>
          array.findIndex(
            (item) =>
              sameValue(
                getLectureCode(item),
                getLectureCode(
                  lecture
                )
              )
          ) === index
      )
      .sort((a, b) =>
        String(
          getLectureCode(a)
        ).localeCompare(
          String(
            getLectureCode(b)
          )
        )
      );
  }, [
    selectedCourse,
    filters?.department,
    filters?.semester,
    filters?.subjectCode,
    filters?.professorId,
    lectures,
  ]);

  /* =======================================================
     CHANGE HANDLERS
  ======================================================= */

  const handleCourseChange = (value) => {
    updateFilter("course", value);
    updateFilter("department", "");
    updateFilter("semester", "");
    updateFilter("subjectCode", "");
    updateFilter("professorId", "");
    updateFilter("lectureCode", "");
  };

  const handleDepartmentChange = (value) => {
    updateFilter(
      "department",
      value
    );

    updateFilter("semester", "");
    updateFilter("subjectCode", "");
    updateFilter("professorId", "");
    updateFilter("lectureCode", "");
  };

  const handleSemesterChange = (value) => {
    updateFilter(
      "semester",
      value
    );

    updateFilter("subjectCode", "");
    updateFilter("professorId", "");
    updateFilter("lectureCode", "");
  };

  const handleSubjectChange = (value) => {
    updateFilter(
      "subjectCode",
      value
    );

    updateFilter("professorId", "");
    updateFilter("lectureCode", "");
  };

  const handleProfessorChange = (value) => {
    updateFilter(
      "professorId",
      value
    );

    updateFilter("lectureCode", "");
  };

  /* =======================================================
     ACTIVE FILTER COUNT
  ======================================================= */

  const activeFilterCount =
    Object.values(
      filters || {}
    ).filter(Boolean).length;

  /* =======================================================
     FILTER CONTENT
  ======================================================= */

  const filterContent = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

      {/* COURSE */}

      <Dropdown
        label="Course"
        value={
          filters?.course || ""
        }
        options={COURSE_OPTIONS}
        onChange={
          handleCourseChange
        }
        placeholder="Select course"
        icon={GraduationCap}
      />

      {/* DEPARTMENT */}

      <Dropdown
        label="Department"
        value={
          filters?.department || ""
        }
        options={departmentOptions}
        onChange={
          handleDepartmentChange
        }
        placeholder={
          selectedCourse
            ? "Select department"
            : "Select course first"
        }
        disabled={!selectedCourse}
        icon={BookOpen}
      />

      {/* SEMESTER */}

      <Dropdown
        label="Semester"
        value={
          filters?.semester || ""
        }
        options={semesterOptions}
        onChange={
          handleSemesterChange
        }
        placeholder={
          filters?.department
            ? "Select semester"
            : "Select department first"
        }
        disabled={
          !filters?.department
        }
        icon={CalendarDays}
        getOptionLabel={(item) =>
          `Semester ${item}`
        }
      />

      {/* SUBJECT */}

      <Dropdown
        label="Subject"
        value={
          filters?.subjectCode || ""
        }
        options={subjectOptions}
        onChange={
          handleSubjectChange
        }
        placeholder={
          filters?.semester
            ? "Select subject"
            : "Select semester first"
        }
        disabled={
          !filters?.semester
        }
        icon={BookOpen}
        getOptionValue={(item) =>
          item.subjectCode
        }
        getOptionLabel={(item) =>
          `${item.subjectCode} — ${
            item.subjectName ||
            "Subject"
          }`
        }
      />

      {/* PROFESSOR */}

      <Dropdown
        label="Professor"
        value={
          filters?.professorId || ""
        }
        options={professorOptions}
        onChange={
          handleProfessorChange
        }
        placeholder={
          filters?.subjectCode
            ? "Select professor"
            : "Select subject first"
        }
        disabled={
          !filters?.subjectCode
        }
        icon={GraduationCap}
        getOptionValue={(item) =>
          item.professorId
        }
        getOptionLabel={(item) =>
          `${item.professorName || "Professor"}${
            item.professorId
              ? ` (${item.professorId})`
              : ""
          }`
        }
      />

      {/* LECTURE */}

      <Dropdown
        label="Lecture"
        value={
          filters?.lectureCode || ""
        }
        options={lectureOptions}
        onChange={(value) =>
          updateFilter(
            "lectureCode",
            value
          )
        }
        placeholder={
          filters?.professorId
            ? "Select lecture"
            : "Select professor first"
        }
        disabled={
          !filters?.professorId
        }
        icon={CalendarDays}
        getOptionValue={(item) =>
          getLectureCode(item)
        }
        getOptionLabel={(item) =>
          `${getLectureCode(item)} — ${
            getSubjectName(item) ||
            "Lecture"
          }`
        }
      />

      {/* ATTENDANCE STATUS */}

      <Dropdown
        label="Attendance Status"
        value={
          filters?.attendanceStatus ||
          ""
        }
        options={[
          "Present",
          "Absent",
        ]}
        onChange={(value) =>
          updateFilter(
            "attendanceStatus",
            value
          )
        }
        placeholder="All statuses"
      />

      {/* REGISTRATION NUMBER */}

      <div className="min-w-0">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Registration Number
        </label>

        <input
          type="text"
          value={
            filters?.registrationNo ||
            ""
          }
          onChange={(event) =>
            updateFilter(
              "registrationNo",
              event.target.value
            )
          }
          placeholder="Enter registration no."
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* ROLL NUMBER */}

      <div className="min-w-0">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Roll Number
        </label>

        <input
          type="text"
          value={
            filters?.rollNo || ""
          }
          onChange={(event) =>
            updateFilter(
              "rollNo",
              event.target.value
            )
          }
          placeholder="Enter roll no."
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* STUDENT NAME */}

      <div className="min-w-0">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Student Name
        </label>

        <input
          type="text"
          value={
            filters?.studentName ||
            ""
          }
          onChange={(event) =>
            updateFilter(
              "studentName",
              event.target.value
            )
          }
          placeholder="Enter student name"
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* FROM DATE */}

      <div className="min-w-0">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          From Date
        </label>

        <input
          type="date"
          value={
            filters?.fromDate || ""
          }
          onChange={(event) =>
            updateFilter(
              "fromDate",
              event.target.value
            )
          }
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* TO DATE */}

      <div className="min-w-0">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          To Date
        </label>

        <input
          type="date"
          value={
            filters?.toDate || ""
          }
          onChange={(event) =>
            updateFilter(
              "toDate",
              event.target.value
            )
          }
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
    </div>
  );

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <section className="relative z-20 w-full overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* HEADER */}

      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
            <Filter className="h-5 w-5 text-indigo-600" />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
              Report Filters
            </h2>

            <p className="text-xs text-slate-500 sm:text-sm">
              Select course, department,
              semester, subject and professor.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {activeFilterCount} active
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              resetFilters();
              setMobileOpen(false);
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>

          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                (prev) => !prev
              )
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700 lg:hidden"
          >
            <Filter className="h-3.5 w-3.5" />

            {mobileOpen
              ? "Hide Filters"
              : "Filters"}
          </button>
        </div>
      </div>

      {/* DESKTOP */}

      <div className="hidden overflow-visible p-4 sm:p-5 lg:block">
        {filterContent}
      </div>

      {/* MOBILE */}

      {mobileOpen && (
        <div className="overflow-visible p-4 sm:p-5 lg:hidden">
          {filterContent}
        </div>
      )}

      {/* CURRENT FILTER SCOPE */}

      <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">

          <span className="font-semibold text-slate-600">
            Current Scope:
          </span>

          {filters?.course ? (
            <span className="rounded-full bg-white px-3 py-1 font-medium text-indigo-700 ring-1 ring-indigo-100">
              {filters.course}
            </span>
          ) : (
            <span className="text-slate-400">
              Select Course
            </span>
          )}

          {filters?.department && (
            <>
              <span className="text-slate-300">
                →
              </span>

              <span className="max-w-[220px] truncate rounded-full bg-white px-3 py-1 font-medium text-indigo-700 ring-1 ring-indigo-100">
                {filters.department}
              </span>
            </>
          )}

          {filters?.semester && (
            <>
              <span className="text-slate-300">
                →
              </span>

              <span className="rounded-full bg-white px-3 py-1 font-medium text-indigo-700 ring-1 ring-indigo-100">
                Semester{" "}
                {filters.semester}
              </span>
            </>
          )}

          {filters?.subjectCode && (
            <>
              <span className="text-slate-300">
                →
              </span>

              <span className="rounded-full bg-white px-3 py-1 font-medium text-indigo-700 ring-1 ring-indigo-100">
                {filters.subjectCode}
              </span>
            </>
          )}

          {filters?.professorId && (
            <>
              <span className="text-slate-300">
                →
              </span>

              <span className="rounded-full bg-white px-3 py-1 font-medium text-indigo-700 ring-1 ring-indigo-100">
                {filters.professorId}
              </span>
            </>
          )}

          {filters?.lectureCode && (
            <>
              <span className="text-slate-300">
                →
              </span>

              <span className="rounded-full bg-white px-3 py-1 font-medium text-indigo-700 ring-1 ring-indigo-100">
                {filters.lectureCode}
              </span>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReportFilters;