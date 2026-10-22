# Attendance Management System – Complete Application Flow

## 1. Project Overview

The Attendance Management System is a role-based academic application for managing students, professors, subjects, lectures and lecture-wise attendance.

Core hierarchy:

```text
Course
  ↓
Department
  ↓
Semester
  ↓
Section
  ↓
Subject
  ↓
Professor
  ↓
Lecture Code
  ↓
Date + Day + Time
  ↓
Students
  ↓
Registration No. + Roll No.
  ↓
Present / Absent
  ↓
Attendance Records
  ↓
History / Reports
```

The system must keep data separated by course, department, semester and section.

## 2. Main Modules

```text
Attendance Management System
│
├── Authentication
├── Dashboard
├── Students
├── Professors
├── Subjects
├── Lectures
├── Attendance
│   ├── Take Attendance
│   ├── Attendance List
│   └── Attendance History
├── Reports
├── Users
├── Profile
└── Settings
```

## 3. Authentication Flow

```text
Signup → Phone OTP → Verify OTP → Account Created
Login → Login OTP → Verify → JWT/Token → Dashboard
```

Forgot password:

```text
Forgot Password → Registered Phone/Email → OTP → Reset Password → Login
```

## 4. Role-Based Access

```text
Authentication
      ↓
Logged-in User
      ↓
Role
 ┌────┼─────┐
 ↓    ↓     ↓
Admin Professor Student
```

**Admin:** manages students, professors, subjects, lectures, attendance, reports and users.

**Professor:** sees assigned subjects/lectures, takes attendance, views attendance and reports.

**Student:** sees own profile, subjects, attendance and reports.

## 5. Student Flow

Student fields:

```text
Registration Number
Roll Number
Name
Course
Department
Semester
Section
Email
Phone
Status
```

Important rule:

```text
Registration Number = Primary Academic Identifier
Roll Number         = Separate Field
```

Roll number must not be the only identifier because different departments can contain the same roll number.

Example:

```text
MCA → Registration: MCA2026001 → Roll: 01
MBA → Registration: MBA2026001 → Roll: 01
```

## 6. Professor Flow

```text
Professor ID
Name
Department
Designation
Email
Phone
Status
```

Example: `P001 - Dr. Sharma - Computer Applications`.

## 7. Subject Flow

```text
Subject Code
Subject Name
Course
Department
Semester
Professor ID
Professor Name
Status
```

Subject Code should be unique.

## 8. Lecture Flow

A lecture represents one actual class session.

```text
Course → Department → Semester → Section
        ↓
Subject → Professor → Lecture Code
        ↓
Date → Day → Start Time → End Time
```

Example:

```text
Lecture Code: LEC001
Subject Code: BMC301
Professor: Dr. Sharma
Course: MCA
Department: Computer Applications
Semester: 3
Date: 2026-10-06
Day: Tuesday
Time: 10:00 - 11:00
Status: Completed
```

## 9. Take Attendance Flow

```text
Course
 ↓
Department
 ↓
Semester
 ↓
Subject
 ↓
Professor
 ↓
Lecture Code
 ↓
Date
 ↓
Load Students
 ↓
Present / Absent
 ↓
Save Attendance
```

Attendance is lecture-wise, not simply date-wise.

## 10. Attendance Record

Recommended structure:

```js
{
  lectureCode: "LEC001",
  date: "2026-10-06",
  day: "Tuesday",
  startTime: "10:00",
  endTime: "11:00",
  subjectCode: "BMC301",
  subjectName: "Computer Networks",
  professorId: "P001",
  professorName: "Dr. Sharma",
  course: "MCA",
  department: "Computer Applications",
  semester: 3,
  section: "A",
  registrationNo: "MCA2026001",
  rollNo: "01",
  studentName: "Rahul Kumar",
  present: true
}
```

`present: true` means Present and `present: false` means Absent.

## 11. Duplicate Prevention

Duplicate attendance is prevented with:

```text
Lecture Code + Registration Number
```

Example:

```text
LEC001 + MCA2026001
```

Recommended MongoDB compound unique index:

```text
{ lectureCode: 1, registrationNo: 1 }
```

## 12. Attendance History

Attendance History groups records by lecture:

```text
Lecture Code | Date | Subject | Professor | Present | Absent | %
LEC001       | 06 Oct | BMC301 | Dr. Sharma | 28 | 2 | 93%
```

Selecting a lecture can show its student-level attendance.

## 13. Attendance List

Possible filters:

```text
Registration No.
Roll No.
Course
Department
Semester
Subject Code
Professor
Lecture Code
Date
Status
```

## 14. Reports Flow

Reports do not mark attendance. They read lecture and attendance data and calculate results.

```text
Course
 ↓
Department
 ↓
Semester
 ↓
Section
 ↓
Subject
 ↓
Professor
 ↓
Lecture
 ↓
Student
 ↓
Attendance Data
 ↓
Report
```

## 15. Department Separation Rule

MCA, MBA, BCA and other departments must never be mixed merely because they have the same semester or roll number.

```text
MCA
└── Computer Applications
    └── Semester 3

MBA
└── Management
    └── Semester 3
```

Reports must follow this hierarchy:

```text
Course → Department → Semester → Section → Subject → Professor → Lecture → Student
```

## 16. Report Filters

```text
Course
Department
Semester
Section
Subject
Professor
Lecture Code
Registration No.
Roll No.
Student
From Date
To Date
Attendance Status
```

Dependent filtering should follow:

```text
Course → Department → Semester → Section → Subject → Professor → Lecture → Student
```

## 17. Lectures Conducted vs Attendance

**Lecture records are the source for Lectures Conducted.**

**Attendance records are the source for Present/Absent.**

Do not calculate conducted lectures by counting attendance records only.

If a lecture exists but attendance has not been submitted, the lecture should still appear and can show:

```text
Not Submitted
```

## 18. Student Report

A student report should show:

```text
Student Name
Registration Number
Roll Number
Course
Department
Semester
Section

Lectures Conducted
Attended
Absent
Attendance %
Required %
Eligibility
Lectures Needed
```

## 19. 75% Attendance Rule

Formula:

```text
Attendance % = Present / Conducted × 100
```

Example:

```text
Conducted = 40
Present = 32
Attendance = 80%
```

Since `80% >= 75%`, status is **Eligible**.

If attendance is below 75%, status is **Short Attendance**.

## 20. Future Lectures Needed

When below 75%, calculate the number of consecutive future lectures required:

```text
(Present + x) / (Conducted + x) >= 0.75
```

Example:

```text
Present = 27
Conducted = 40

x = 12

(27 + 12) / (40 + 12)
= 39 / 52
= 75%
```

This assumes the student attends every next lecture.

## 21. Subject-wise Report

The report should show both overall and subject-wise attendance.

| Subject | Professor | Conducted | Present | Absent | % | Status |
|---|---|---:|---:|---:|---:|---|
| Computer Networks | Dr. Sharma | 20 | 17 | 3 | 85% | Eligible |
| DBMS | Dr. Gupta | 15 | 11 | 4 | 73.3% | Short |
| AI | Dr. Khan | 10 | 9 | 1 | 90% | Eligible |

## 22. Missed Lecture Report

For each absence, show:

```text
Date
Day
Start Time
End Time
Subject
Subject Code
Professor
Professor ID
Lecture Code
Status
```

Do not automatically call every absence a "bunk". An absence may later be recorded as approved leave.

## 23. Attendance Status

Current system:

```text
Present
Absent
Not Submitted
```

Future-ready statuses:

```text
Approved Leave
```

## 24. Dashboard Flow

Dashboard reads shared application data and shows:

```text
Total Students
Present Today
Absent Today
Attendance Percentage

Quick Actions:
Add Student
Take Attendance
Reports
```

## 25. Database Collections

```text
attendance_management
│
├── users
├── otp_verifications
├── students
├── professors
├── subjects
├── lectures
└── attendance
```

### users

```text
name, phone, email, role, created_at
```

### otp_verifications

```text
phone, otp, purpose, expires_at, verified, created_at
```

### students

```text
registrationNo, rollNo, name, course, department,
semester, section, email, phone, status
```

### professors

```text
professorId, name, department, designation,
email, phone, status
```

### subjects

```text
subjectCode, subjectName, course, department,
semester, professorId, professorName, status
```

### lectures

```text
lectureCode, subjectCode, subjectName, professorId,
professorName, course, department, semester, section,
date, day, startTime, endTime, status
```

### attendance

```text
lectureCode, date, day, startTime, endTime,
subjectCode, subjectName, professorId, professorName,
course, department, semester, section,
registrationNo, rollNo, studentName, present
```

## 26. Unique Keys

```text
students   → registrationNo
subjects   → subjectCode
lectures   → lectureCode
attendance → lectureCode + registrationNo
```

## 27. React Context Flow

```text
AuthContext
StudentContext
ProfessorContext
SubjectContext
LectureContext
AttendanceContext
```

Reports consumes the relevant contexts and calculates the report without duplicating the source data.

## 28. Routing Flow

```text
AppRoute
   ↓
ProtectedRoute
   ↓
RoleRoute
   ↓
DashboardLayout
   ↓
Page
```

Recommended private routes:

```text
/dashboard
/students
/students/add
/students/:id
/students/:id/edit
/professors
/professors/add
/professors/:id
/professors/:id/edit
/subjects
/subjects/add
/subjects/:id
/subjects/:id/edit
/lectures
/lectures/create
/lectures/:id
/lectures/:id/edit
/attendance
/attendance/take
/attendance/history
/reports
/users
/profile
/settings
```

All dashboard pages should remain inside the same DashboardLayout so the sidebar stays visible.

## 29. Complete End-to-End Flow

```text
START
  ↓
Signup / Login
  ↓
OTP Verification
  ↓
Authentication Token
  ↓
Role Detection
  ↓
Dashboard
  ↓
Course
  ↓
Department
  ↓
Semester
  ↓
Section
  ↓
Student / Professor / Subject Setup
  ↓
Create Lecture
  ↓
Lecture Code
  ↓
Professor Opens Take Attendance
  ↓
Students Loaded
  ↓
Present / Absent
  ↓
Save Attendance
  ↓
Duplicate Check
  ↓
Attendance History
  ↓
Reports
  ↓
Attendance Percentage
  ↓
75% Eligibility
  ↓
Subject-wise Analysis
  ↓
Missed Lecture List
  ↓
Low Attendance Warning
  ↓
END
```

## 30. Technology Flow

```text
React + Vite
     ↓
Tailwind CSS
     ↓
React Context API
     ↓
Frontend Modules
     ↓
Python / FastAPI Backend
     ↓
MongoDB Atlas
```

Current development endpoints:

```text
Frontend: http://localhost:5173/
Backend:  http://127.0.0.1:8000/
Database: MongoDB Atlas
Database Name: attendance_management
```

## 31. Future Scope

```text
PDF Export
CSV Export
QR Code Attendance
Biometric Attendance
SMS OTP
Email Notifications
Approved Leave
Attendance Approval
Advanced RBAC
Monthly/Semester Reports
Attendance Trend Charts
Cloud Backend Synchronization
```

## 32. Final Design Rules

1. Registration Number is the main student academic identifier.
2. Roll Number is stored separately.
3. Attendance is lecture-wise.
4. Lecture Code identifies a lecture session.
5. Lecture records determine lectures conducted.
6. Attendance records determine Present/Absent.
7. Course and Department must remain separated.
8. Semester and Section must be respected.
9. Duplicate attendance uses Lecture Code + Registration Number.
10. 75% is the mandatory attendance threshold.
11. Reports show overall and subject-wise attendance.
12. Reports show exact missed lectures.
13. Do not label an absence as a bunk unless unexcused absence is explicitly tracked.
14. Professor identity should come from the authenticated professor account where possible.
15. Admin, Professor and Student access should be role-controlled.
16. Dashboard, Attendance History and Reports should use the same underlying attendance data.
'''

cat > /mnt/data/attendance_management_files/Reports.jsx <<'EOF'
import React, { useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileText,
  GraduationCap,
  RotateCcw,
  Search,
  User,
  Users,
  XCircle,
} from "lucide-react";

import { useAttendance } from "../../context/AttendanceContext";
import { useStudents } from "../../context/StudentContext";
import { useProfessors } from "../../context/ProfessorContext";
import { useSubjects } from "../../context/SubjectContext";
import { useLectures } from "../../context/LectureContext";

const COURSE_OPTIONS = ["B.Tech", "BCA", "MCA", "BBA", "MBA", "B.Com"];

const DEPARTMENT_OPTIONS = {
  "B.Tech": [
    "Computer Science & Engineering",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
  ],
  BCA: ["Computer Applications"],
  MCA: ["Computer Applications"],
  BBA: ["Management"],
  MBA: ["Management"],
  "B.Com": ["Commerce"],
};

const getSemesterOptions = (course) => {
  if (!course) return [];
  const fourSemesterCourses = ["MCA", "MBA"];
  const count = fourSemesterCourses.includes(course) ? 4 : 6;

  return Array.from({ length: count }, (_, index) => String(index + 1));
};

const getKey = (value) => String(value ?? "").trim().toLowerCase();
const same = (a, b) => getKey(a) === getKey(b);
const normalizeSemester = (value) =>
  String(value ?? "").replace(/^semester\s*/i, "");

const dateLabel = (date) => {
  if (!date) return "-";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const dayLabel = (date, fallback = "") => {
  if (fallback) return fallback;
  if (!date) return "-";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-IN", { weekday: "long" });
};

const formatTime = (startTime, endTime) => {
  if (!startTime && !endTime) return "-";
  if (startTime && endTime) return `${startTime} - ${endTime}`;
  return startTime || endTime || "-";
};

const calculateRequiredLectures = (present, conducted, target = 75) => {
  if (conducted <= 0) return 0;
  if ((present / conducted) * 100 >= target) return 0;

  let needed = 0;
  while ((present + needed) / (conducted + needed) < target / 100) {
    needed += 1;
    if (needed > 10000) return 0;
  }
  return needed;
};

const emptyFilters = {
  course: "",
  department: "",
  semester: "",
  section: "",
  subject: "",
  professor: "",
  lectureCode: "",
  registrationNo: "",
  rollNo: "",
  student: "",
  fromDate: "",
  toDate: "",
  status: "All",
};

function FilterSelect({ label, value, onChange, options, disabled = false }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        >
          <option value="">All {label}</option>
          {options.map((option) => {
            const item =
              typeof option === "object"
                ? option
                : { value: option, label: option };
            return (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            );
          })}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </label>
  );
}

function FilterInput({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  );
}

function SummaryCard({ icon: Icon, title, value, subtitle, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Present: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Absent: "bg-rose-50 text-rose-700 border-rose-200",
    "Not Submitted": "bg-amber-50 text-amber-700 border-amber-200",
    Submitted: "bg-blue-50 text-blue-700 border-blue-200",
    Eligible: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Short Attendance": "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

function Reports() {
  const { attendance = [] } = useAttendance();
  const { students = [] } = useStudents();
  const { professors = [] } = useProfessors();
  const { subjects = [] } = useSubjects();
  const { lectures = [] } = useLectures();

  const [filters, setFilters] = useState(emptyFilters);

  const setFilter = (key, value) => {
    setFilters((previous) => {
      const next = { ...previous, [key]: value };

      if (key === "course") {
        next.department = "";
        next.semester = "";
        next.section = "";
        next.subject = "";
        next.professor = "";
        next.lectureCode = "";
        next.registrationNo = "";
        next.rollNo = "";
        next.student = "";
      }

      if (key === "department") {
        next.semester = "";
        next.section = "";
        next.subject = "";
        next.professor = "";
        next.lectureCode = "";
        next.registrationNo = "";
        next.rollNo = "";
        next.student = "";
      }

      if (key === "semester") {
        next.subject = "";
        next.professor = "";
        next.lectureCode = "";
        next.registrationNo = "";
        next.rollNo = "";
        next.student = "";
      }

      if (key === "subject") {
        next.professor = "";
        next.lectureCode = "";
      }

      return next;
    });
  };

  const departmentOptions = useMemo(() => {
    if (filters.course) return DEPARTMENT_OPTIONS[filters.course] || [];

    const values = [
      ...Object.values(DEPARTMENT_OPTIONS).flat(),
      ...students.map((student) => student.department),
      ...subjects.map((subject) => subject.department),
      ...lectures.map((lecture) => lecture.department),
    ];

    return [...new Set(values.filter(Boolean))].sort();
  }, [filters.course, students, subjects, lectures]);

  const semesterOptions = useMemo(() => {
    if (filters.course) return getSemesterOptions(filters.course);

    const values = [
      ...students.map((student) => normalizeSemester(student.semester)),
      ...subjects.map((subject) => normalizeSemester(subject.semester)),
      ...lectures.map((lecture) => normalizeSemester(lecture.semester)),
    ];

    return [...new Set(values.filter(Boolean))].sort(
      (a, b) => Number(a) - Number(b)
    );
  }, [filters.course, students, subjects, lectures]);

  const scopedStudents = useMemo(() => {
    return students.filter((student) => {
      if (filters.course && !same(student.course, filters.course)) return false;
      if (filters.department && !same(student.department, filters.department)) return false;
      if (
        filters.semester &&
        normalizeSemester(student.semester) !== normalizeSemester(filters.semester)
      ) return false;
      if (filters.section && !same(student.section, filters.section)) return false;
      return true;
    });
  }, [students, filters.course, filters.department, filters.semester, filters.section]);

  const sectionOptions = useMemo(
    () => [...new Set(scopedStudents.map((student) => student.section).filter(Boolean))].sort(),
    [scopedStudents]
  );

  const subjectOptions = useMemo(() => {
    const values = subjects
      .filter((subject) => {
        if (filters.course && !same(subject.course, filters.course)) return false;
        if (filters.department && !same(subject.department, filters.department)) return false;
        if (
          filters.semester &&
          normalizeSemester(subject.semester) !== normalizeSemester(filters.semester)
        ) return false;
        return true;
      })
      .map((subject) => ({
        value: subject.subjectCode || subject.id || "",
        label: `${subject.subjectCode || subject.id || ""} - ${subject.subjectName || "Unnamed Subject"}`,
      }))
      .filter((item) => item.value);

    return [...new Map(values.map((item) => [item.value, item])).values()];
  }, [subjects, filters.course, filters.department, filters.semester]);

  const professorOptions = useMemo(() => {
    const values = professors
      .filter((professor) => {
        if (filters.department && !same(professor.department, filters.department)) return false;
        return true;
      })
      .map((professor) => ({
        value: professor.professorId || professor.id || "",
        label: `${professor.professorId || professor.id || ""} - ${professor.name || "Unnamed Professor"}`,
      }))
      .filter((item) => item.value);

    return [...new Map(values.map((item) => [item.value, item])).values()];
  }, [professors, filters.department]);

  const lectureOptions = useMemo(() => {
    const values = lectures
      .filter((lecture) => {
        if (filters.course && !same(lecture.course, filters.course)) return false;
        if (filters.department && !same(lecture.department, filters.department)) return false;
        if (
          filters.semester &&
          normalizeSemester(lecture.semester) !== normalizeSemester(filters.semester)
        ) return false;
        if (filters.subject && !same(lecture.subjectCode, filters.subject)) return false;
        if (
          filters.professor &&
          !same(lecture.professorId || lecture.professor, filters.professor)
        ) return false;
        return true;
      })
      .map((lecture) => lecture.lectureCode)
      .filter(Boolean);

    return [...new Set(values)].sort();
  }, [lectures, filters.course, filters.department, filters.semester, filters.subject, filters.professor]);

  const studentOptions = useMemo(
    () =>
      scopedStudents
        .map((student) => ({
          value: student.registrationNo || student.id || "",
          label: `${student.registrationNo || student.id || ""} - ${student.name || "Unnamed Student"}`,
        }))
        .filter((item) => item.value),
    [scopedStudents]
  );

  const allLectureRecords = useMemo(() => {
    return lectures
      .filter((lecture) => {
        if (filters.course && !same(lecture.course, filters.course)) return false;
        if (filters.department && !same(lecture.department, filters.department)) return false;
        if (
          filters.semester &&
          normalizeSemester(lecture.semester) !== normalizeSemester(filters.semester)
        ) return false;
        if (filters.section && !same(lecture.section, filters.section)) return false;
        if (filters.subject && !same(lecture.subjectCode, filters.subject)) return false;
        if (
          filters.professor &&
          !same(lecture.professorId || lecture.professor, filters.professor)
        ) return false;
        if (filters.lectureCode && !same(lecture.lectureCode, filters.lectureCode)) return false;
        if (filters.fromDate && lecture.date < filters.fromDate) return false;
        if (filters.toDate && lecture.date > filters.toDate) return false;
        return true;
      })
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  }, [lectures, filters]);

  const filteredAttendance = useMemo(() => {
    return attendance.filter((record) => {
      if (filters.course && !same(record.course, filters.course)) return false;
      if (filters.department && !same(record.department, filters.department)) return false;
      if (
        filters.semester &&
        normalizeSemester(record.semester) !== normalizeSemester(filters.semester)
      ) return false;
      if (filters.section && !same(record.section, filters.section)) return false;
      if (filters.subject && !same(record.subjectCode, filters.subject)) return false;
      if (
        filters.professor &&
        !same(record.professorId || record.professor, filters.professor)
      ) return false;
      if (filters.lectureCode && !same(record.lectureCode, filters.lectureCode)) return false;
      if (filters.registrationNo && !same(record.registrationNo, filters.registrationNo)) return false;
      if (filters.rollNo && !same(record.rollNo, filters.rollNo)) return false;
      if (filters.student && !same(record.registrationNo, filters.student)) return false;
      if (filters.fromDate && record.date < filters.fromDate) return false;
      if (filters.toDate && record.date > filters.toDate) return false;
      if (filters.status === "Present" && record.present !== true) return false;
      if (filters.status === "Absent" && record.present !== false) return false;
      return true;
    });
  }, [attendance, filters]);

  const selectedStudent = useMemo(() => {
    const registrationNo = filters.registrationNo || filters.student || "";
    if (!registrationNo) return null;

    return (
      students.find((student) =>
        same(student.registrationNo || student.id, registrationNo)
      ) || null
    );
  }, [students, filters.registrationNo, filters.student]);

  const reportStudent = selectedStudent ||
    (filters.registrationNo
      ? scopedStudents.find((student) => same(student.registrationNo, filters.registrationNo))
      : null);

  const reportRows = useMemo(() => {
    if (!allLectureRecords.length) return [];

    return allLectureRecords
      .map((lecture) => {
        const records = attendance.filter(
          (record) =>
            same(record.lectureCode, lecture.lectureCode) &&
            same(record.date, lecture.date)
        );

        let matchingRecord = null;

        if (filters.registrationNo || filters.student) {
          const registrationNo = filters.registrationNo || filters.student;
          matchingRecord = records.find((record) => same(record.registrationNo, registrationNo)) || null;
        } else if (filters.rollNo) {
          matchingRecord = records.find((record) => same(record.rollNo, filters.rollNo)) || null;
        }

        const submitted = records.length > 0;
        let status = "Not Submitted";

        if (matchingRecord) {
          status = matchingRecord.present === true ? "Present" : "Absent";
        } else if (!filters.registrationNo && !filters.student && !filters.rollNo) {
          status = submitted ? "Submitted" : "Not Submitted";
        }

        return { ...lecture, attendanceRecords: records, status, submitted };
      })
      .filter((row) => {
        if (filters.registrationNo || filters.student || filters.rollNo) return true;
        return filters.status === "All" || row.status === filters.status;
      });
  }, [allLectureRecords, attendance, filters.registrationNo, filters.student, filters.rollNo, filters.status]);

  const summary = useMemo(() => {
    const studentMode = Boolean(filters.registrationNo || filters.student || filters.rollNo);

    if (studentMode) {
      const submittedRows = reportRows.filter(
        (row) => row.status === "Present" || row.status === "Absent"
      );
      const conducted = submittedRows.length;
      const present = submittedRows.filter((row) => row.status === "Present").length;
      const absent = submittedRows.filter((row) => row.status === "Absent").length;
      const percentage = conducted ? (present / conducted) * 100 : 0;

      return {
        conducted,
        present,
        absent,
        percentage,
        required: 75,
        eligible: percentage >= 75,
        needed: calculateRequiredLectures(present, conducted),
      };
    }

    const present = filteredAttendance.filter((record) => record.present === true).length;
    const absent = filteredAttendance.filter((record) => record.present === false).length;
    const uniqueLectureKeys = new Set(
      filteredAttendance.map((record) => `${record.lectureCode || ""}|${record.date || ""}`)
    );
    const conducted = allLectureRecords.length || uniqueLectureKeys.size;
    const percentage = conducted ? (present / conducted) * 100 : 0;

    return {
      conducted,
      present,
      absent,
      percentage,
      required: 75,
      eligible: percentage >= 75,
      needed: calculateRequiredLectures(present, conducted),
    };
  }, [reportRows, filteredAttendance, allLectureRecords, filters.registrationNo, filters.student, filters.rollNo]);

  const subjectSummary = useMemo(() => {
    const studentMode = Boolean(filters.registrationNo || filters.student || filters.rollNo);
    const map = new Map();

    reportRows.forEach((row) => {
      const key = row.subjectCode || "Unknown";
      if (!map.has(key)) {
        map.set(key, {
          subjectCode: row.subjectCode || "-",
          subjectName: row.subjectName || "-",
          professorName: row.professorName || row.professor || "-",
          conducted: 0,
          present: 0,
          absent: 0,
        });
      }

      const item = map.get(key);
      item.conducted += 1;

      if (studentMode) {
        if (row.status === "Present") item.present += 1;
        if (row.status === "Absent") item.absent += 1;
      } else {
        item.present += (row.attendanceRecords || []).filter((record) => record.present === true).length;
        item.absent += (row.attendanceRecords || []).filter((record) => record.present === false).length;
      }
    });

    return [...map.values()].map((item) => {
      const denominator = studentMode ? item.conducted : item.present + item.absent;
      const percentage = denominator ? (item.present / denominator) * 100 : 0;
      return {
        ...item,
        percentage,
        status: percentage >= 75 ? "Eligible" : "Short Attendance",
      };
    });
  }, [reportRows, filters.registrationNo, filters.student, filters.rollNo]);

  const missedLectures = useMemo(
    () => reportRows.filter((row) => row.status === "Absent"),
    [reportRows]
  );

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => key !== "status" && value
  ).length;

  const clearFilters = () => setFilters(emptyFilters);

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <BarChart3 size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Attendance Reports</h1>
              <p className="text-sm text-slate-500">
                Analyze attendance by course, department, subject, professor and student.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RotateCcw size={16} />
            Reset Filters
          </button>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Search size={18} className="text-indigo-600" /> Report Filters
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Filters follow the academic hierarchy so departments do not mix.
              </p>
            </div>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <FilterSelect label="Course" value={filters.course} onChange={(value) => setFilter("course", value)} options={COURSE_OPTIONS} />
            <FilterSelect label="Department" value={filters.department} onChange={(value) => setFilter("department", value)} options={departmentOptions} disabled={!filters.course && departmentOptions.length === 0} />
            <FilterSelect label="Semester" value={filters.semester} onChange={(value) => setFilter("semester", value)} options={semesterOptions} disabled={semesterOptions.length === 0} />
            <FilterSelect label="Section" value={filters.section} onChange={(value) => setFilter("section", value)} options={sectionOptions} disabled={sectionOptions.length === 0} />
            <FilterSelect label="Subject" value={filters.subject} onChange={(value) => setFilter("subject", value)} options={subjectOptions} disabled={subjectOptions.length === 0} />
            <FilterSelect label="Professor" value={filters.professor} onChange={(value) => setFilter("professor", value)} options={professorOptions} disabled={professorOptions.length === 0} />
            <FilterSelect label="Lecture Code" value={filters.lectureCode} onChange={(value) => setFilter("lectureCode", value)} options={lectureOptions} disabled={lectureOptions.length === 0} />
            <FilterInput label="Registration No." value={filters.registrationNo} onChange={(value) => setFilter("registrationNo", value)} placeholder="e.g. MCA2026001" />
            <FilterInput label="Roll No." value={filters.rollNo} onChange={(value) => setFilter("rollNo", value)} placeholder="e.g. 01" />
            <FilterSelect label="Student" value={filters.student} onChange={(value) => setFilter("student", value)} options={studentOptions} disabled={studentOptions.length === 0} />
            <FilterInput label="From Date" type="date" value={filters.fromDate} onChange={(value) => setFilter("fromDate", value)} />
            <FilterInput label="To Date" type="date" value={filters.toDate} onChange={(value) => setFilter("toDate", value)} />
            <FilterSelect label="Attendance Status" value={filters.status} onChange={(value) => setFilter("status", value)} options={["All", "Present", "Absent"]} />
          </div>
        </section>

        {reportStudent && (
          <section className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Student Report</p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">{reportStudent.name || "Student"}</h2>
                <p className="text-sm text-slate-600">
                  Registration No. {reportStudent.registrationNo || "-"} · Roll No. {reportStudent.rollNo || "-"} · {reportStudent.course || "-"} · {reportStudent.department || "-"} · Semester {reportStudent.semester || "-"}
                </p>
              </div>
              <div className="rounded-xl border border-indigo-100 bg-white px-4 py-3">
                <p className="text-xs text-slate-500">Mandatory Attendance</p>
                <p className="text-lg font-bold text-indigo-700">75%</p>
              </div>
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <SummaryCard icon={CalendarDays} title="Lectures Conducted" value={summary.conducted} subtitle="From lecture records" iconClass="bg-indigo-50 text-indigo-600" />
          <SummaryCard icon={CheckCircle2} title="Present" value={summary.present} subtitle="Attendance submitted" iconClass="bg-emerald-50 text-emerald-600" />
          <SummaryCard icon={XCircle} title="Absent" value={summary.absent} subtitle="Missed lectures" iconClass="bg-rose-50 text-rose-600" />
          <SummaryCard icon={BarChart3} title="Attendance %" value={`${summary.percentage.toFixed(1)}%`} subtitle={`Required ${summary.required}%`} iconClass="bg-blue-50 text-blue-600" />
          <SummaryCard icon={ClipboardCheck} title="Eligibility" value={summary.eligible ? "Eligible" : "Short"} subtitle={summary.eligible ? "Meets 75% rule" : "Below 75%"} iconClass={summary.eligible ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"} />
          <SummaryCard icon={GraduationCap} title="Lectures Needed" value={summary.needed} subtitle="Consecutive future lectures" iconClass="bg-amber-50 text-amber-600" />
        </section>

        {!summary.eligible && summary.conducted > 0 && (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 shrink-0 text-rose-600" size={20} />
              <div>
                <h3 className="font-bold text-rose-800">Low Attendance Warning</h3>
                <p className="mt-1 text-sm text-rose-700">
                  Current attendance is {summary.percentage.toFixed(1)}%. The mandatory attendance requirement is 75%. The student needs to attend the next <strong>{summary.needed}</strong> consecutive lectures to reach 75%, based on the current record.
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-600" />
              <div>
                <h2 className="font-bold text-slate-900">Subject-wise Summary</h2>
                <p className="text-xs text-slate-500">Attendance is calculated separately for each subject.</p>
              </div>
            </div>
          </div>

          {subjectSummary.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">No subject report data found for the selected filters.</div>
          ) : (
            <>
              <div className="hidden overflow-hidden md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Subject</th><th className="px-5 py-3">Professor</th><th className="px-5 py-3">Conducted</th><th className="px-5 py-3">Present</th><th className="px-5 py-3">Absent</th><th className="px-5 py-3">Attendance</th><th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subjectSummary.map((item) => (
                      <tr key={item.subjectCode} className="hover:bg-slate-50/70">
                        <td className="px-5 py-4"><p className="font-semibold text-slate-900">{item.subjectName}</p><p className="text-xs text-slate-500">{item.subjectCode}</p></td>
                        <td className="px-5 py-4 text-slate-600">{item.professorName}</td>
                        <td className="px-5 py-4 font-semibold text-slate-700">{item.conducted}</td>
                        <td className="px-5 py-4 font-semibold text-emerald-700">{item.present}</td>
                        <td className="px-5 py-4 font-semibold text-rose-700">{item.absent}</td>
                        <td className="px-5 py-4 font-semibold text-slate-800">{item.percentage.toFixed(1)}%</td>
                        <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid gap-3 p-4 md:hidden">
                {subjectSummary.map((item) => (
                  <div key={item.subjectCode} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3"><div><p className="font-bold text-slate-900">{item.subjectName}</p><p className="text-xs text-slate-500">{item.subjectCode}</p></div><StatusBadge status={item.status} /></div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-xs text-slate-500">Professor</p><p className="mt-1 font-semibold text-slate-700">{item.professorName}</p></div>
                      <div><p className="text-xs text-slate-500">Attendance</p><p className="mt-1 font-semibold text-slate-900">{item.percentage.toFixed(1)}%</p></div>
                      <div><p className="text-xs text-slate-500">Present</p><p className="mt-1 font-semibold text-emerald-700">{item.present}</p></div>
                      <div><p className="text-xs text-slate-500">Absent</p><p className="mt-1 font-semibold text-rose-700">{item.absent}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <div className="flex items-center gap-2"><XCircle size={18} className="text-rose-600" /><div><h2 className="font-bold text-slate-900">Missed Lectures</h2><p className="text-xs text-slate-500">Exact lectures marked absent for the selected student.</p></div></div>
          </div>
          {missedLectures.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">No missed lectures found.</div>
          ) : (
            <>
              <div className="hidden overflow-hidden md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Day</th><th className="px-5 py-3">Time</th><th className="px-5 py-3">Subject</th><th className="px-5 py-3">Professor</th><th className="px-5 py-3">Lecture Code</th><th className="px-5 py-3">Status</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {missedLectures.map((lecture) => (
                      <tr key={`${lecture.lectureCode}-${lecture.date}`} className="hover:bg-slate-50/70">
                        <td className="px-5 py-4 font-medium text-slate-700">{dateLabel(lecture.date)}</td>
                        <td className="px-5 py-4 text-slate-600">{dayLabel(lecture.date, lecture.day)}</td>
                        <td className="px-5 py-4 text-slate-600">{formatTime(lecture.startTime, lecture.endTime)}</td>
                        <td className="px-5 py-4"><p className="font-semibold text-slate-900">{lecture.subjectName || "-"}</p><p className="text-xs text-slate-500">{lecture.subjectCode || "-"}</p></td>
                        <td className="px-5 py-4 text-slate-600">{lecture.professorName || lecture.professor || "-"}</td>
                        <td className="px-5 py-4 font-semibold text-slate-700">{lecture.lectureCode || "-"}</td>
                        <td className="px-5 py-4"><StatusBadge status="Absent" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid gap-3 p-4 md:hidden">
                {missedLectures.map((lecture) => (
                  <div key={`${lecture.lectureCode}-${lecture.date}`} className="rounded-xl border border-rose-100 bg-rose-50/40 p-4">
                    <div className="flex items-start justify-between gap-3"><div><p className="font-bold text-slate-900">{lecture.subjectName || "-"}</p><p className="text-xs text-slate-500">{lecture.subjectCode || "-"} · {lecture.lectureCode || "-"}</p></div><StatusBadge status="Absent" /></div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600"><p><strong>Date:</strong> {dateLabel(lecture.date)} ({dayLabel(lecture.date, lecture.day)})</p><p><strong>Time:</strong> {formatTime(lecture.startTime, lecture.endTime)}</p><p><strong>Professor:</strong> {lecture.professorName || lecture.professor || "-"}</p></div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <div className="flex items-center gap-2"><FileText size={18} className="text-indigo-600" /><div><h2 className="font-bold text-slate-900">Detailed Lecture Report</h2><p className="text-xs text-slate-500">Lecture records are the source for conducted lectures.</p></div></div>
          </div>
          {reportRows.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">No lecture records found for the selected filters.</div>
          ) : (
            <>
              <div className="hidden overflow-hidden md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Subject</th><th className="px-5 py-3">Professor</th><th className="px-5 py-3">Lecture Code</th><th className="px-5 py-3">Time</th><th className="px-5 py-3">Status</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportRows.map((row) => (
                      <tr key={`${row.lectureCode}-${row.date}`} className="hover:bg-slate-50/70">
                        <td className="px-5 py-4"><p className="font-semibold text-slate-800">{dateLabel(row.date)}</p><p className="text-xs text-slate-500">{dayLabel(row.date, row.day)}</p></td>
                        <td className="px-5 py-4"><p className="font-semibold text-slate-900">{row.subjectName || "-"}</p><p className="text-xs text-slate-500">{row.subjectCode || "-"}</p></td>
                        <td className="px-5 py-4 text-slate-600">{row.professorName || row.professor || "-"}</td>
                        <td className="px-5 py-4 font-semibold text-slate-700">{row.lectureCode || "-"}</td>
                        <td className="px-5 py-4 text-slate-600">{formatTime(row.startTime, row.endTime)}</td>
                        <td className="px-5 py-4"><StatusBadge status={row.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid gap-3 p-4 md:hidden">
                {reportRows.map((row) => (
                  <div key={`${row.lectureCode}-${row.date}`} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3"><div><p className="font-bold text-slate-900">{row.subjectName || "-"}</p><p className="text-xs text-slate-500">{row.subjectCode || "-"} · {row.lectureCode || "-"}</p></div><StatusBadge status={row.status} /></div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-slate-500">Date</p><p className="mt-1 font-medium text-slate-700">{dateLabel(row.date)}</p></div><div><p className="text-xs text-slate-500">Day</p><p className="mt-1 font-medium text-slate-700">{dayLabel(row.date, row.day)}</p></div><div><p className="text-xs text-slate-500">Time</p><p className="mt-1 font-medium text-slate-700">{formatTime(row.startTime, row.endTime)}</p></div><div><p className="text-xs text-slate-500">Professor</p><p className="mt-1 font-medium text-slate-700">{row.professorName || row.professor || "-"}</p></div></div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><Users size={18} className="text-indigo-600" /><h3 className="font-bold text-slate-900">Academic Scope</h3></div><p className="mt-3 text-sm leading-6 text-slate-600">Reports are separated by Course → Department → Semester → Section. This prevents MCA, MBA, BCA or other department data from being mixed.</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><User size={18} className="text-indigo-600" /><h3 className="font-bold text-slate-900">Student Identity</h3></div><p className="mt-3 text-sm leading-6 text-slate-600">Registration Number is used as the primary academic identifier. Roll Number remains a separate student field.</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><ClipboardCheck size={18} className="text-indigo-600" /><h3 className="font-bold text-slate-900">Attendance Rule</h3></div><p className="mt-3 text-sm leading-6 text-slate-600">Attendance percentage uses Present ÷ Conducted × 100, with 75% as the mandatory requirement.</p></div>
        </section>
      </div>
    </div>
  );
}

export default Reports;
