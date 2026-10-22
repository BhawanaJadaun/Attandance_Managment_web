import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  GraduationCap,
  Hash,
  Mail,
  Pencil,
  Phone,
  User,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useStudents } from "../../context/StudentContext";
import reportService from "../../services/reportService.js";
import toast from "react-hot-toast";

const StudentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { students = [], loading: studentsLoading = false } = useStudents();

  const [attendanceSummary, setAttendanceSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
    percentage: 0,
  });
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  // Match by database ID, frontend ID, or registration number.
  const student = useMemo(
    () =>
      students.find(
        (item) =>
          String(item.id) === String(id) ||
          String(item._id ?? "") === String(id) ||
          String(
            item.registrationNo ?? item.registration_number ?? "",
          ).toLowerCase() === String(id).toLowerCase(),
      ),
    [students, id],
  );

  useEffect(() => {
    if (!student) {
      if (!studentsLoading) setAttendanceLoading(false);
      return;
    }

    let active = true;

    async function loadAttendanceSummary() {
      setAttendanceLoading(true);

      try {
        const registrationNumber =
          student.registrationNo ??
          student.registration_number ??
          student.registrationNumber;

        if (!registrationNumber) {
          throw new Error("Student registration number is missing.");
        }

        const response = await reportService.getAttendanceReport({
          registration_number: registrationNumber,
        });

        if (!active) return;

        const report = response?.data ?? response ?? {};

        setAttendanceSummary({
          total: Number(report.total_records ?? 0),
          present: Number(report.present ?? 0),
          absent: Number(report.absent ?? 0),
          percentage: Number(report.attendance_percentage ?? 0),
        });
      } catch (error) {
        if (active) {
          console.error("Unable to load attendance summary:", error);
          setAttendanceSummary({
            total: 0,
            present: 0,
            absent: 0,
            percentage: 0,
          });
          toast.error(error?.message || "Unable to load attendance summary.");
        }
      } finally {
        if (active) setAttendanceLoading(false);
      }
    }

    loadAttendanceSummary();

    return () => {
      active = false;
    };
  }, [student, studentsLoading]);

  const getInitials = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  const handleEdit = () => {
    if (student) navigate(`/students/edit/${student.id}`);
  };

  if (studentsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-slate-500">
          Loading student details...
        </p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <User size={26} className="text-slate-400" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-800">
            Student not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            The student could not be found in the backend records.
          </p>
          <button
            type="button"
            onClick={() => navigate("/students")}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  const name =
    student.name ?? student.full_name ?? student.fullName ?? "Student";
  const registrationNo =
    student.registrationNo ??
    student.registration_number ??
    student.registrationNumber ??
    "-";
  const rollNo =
    student.rollNo ??
    student.roll_number ??
    student.rollNumber ??
    student.roll_no ??
    "-";
  const course = student.course ?? "-";
  const department = student.department ?? "-";
  const semester = student.semester ?? "-";
  const section = student.section ?? "-";
  const status = student.status ?? "Active";

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/students")}
            title="Back to students"
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Student Details
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View complete student information.
            </p>
          </div>
        </div>

        {/* Profile */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-24 bg-gradient-to-r from-indigo-100 to-violet-400 sm:h-32" />
          <div className="px-5 pb-6 sm:px-7">
            <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                {student.image ? (
                  <img
                    src={student.image}
                    alt={name}
                    className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-md sm:h-28 sm:w-28"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-indigo-100 text-2xl font-bold text-indigo-600 shadow-md sm:h-28 sm:w-28">
                    {getInitials(name)}
                  </div>
                )}
                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                      {name}
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {course} {" • "} Semester {semester}
                    {section !== "-" ? ` • Section ${section}` : ""}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:w-auto"
              >
                <Pencil size={16} />
                Edit Student
              </button>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <InfoSection
          icon={<GraduationCap size={20} />}
          heading="Academic Information"
          description="Student academic identification."
          iconStyle="bg-indigo-100 text-indigo-600"
          columns="sm:grid-cols-2 lg:grid-cols-3"
        >
          <InfoItem
            icon={<Hash size={17} />}
            label="Registration Number"
            value={registrationNo}
          />
          <InfoItem
            icon={<Hash size={17} />}
            label="Roll Number"
            value={rollNo}
          />
          <InfoItem
            icon={<GraduationCap size={17} />}
            label="Course"
            value={course}
          />
          <InfoItem
            icon={<Building2 size={17} />}
            label="Department"
            value={department}
          />
          <InfoItem
            icon={<CalendarDays size={17} />}
            label="Semester"
            value={semester === "-" ? "-" : `Semester ${semester}`}
          />
          <InfoItem icon={<User size={17} />} label="Section" value={section} />
        </InfoSection>

        {/* Personal Information */}
        <InfoSection
          icon={<User size={20} />}
          heading="Personal Information"
          description="Student contact information."
          iconStyle="bg-violet-100 text-violet-600"
          columns="sm:grid-cols-2"
        >
          <InfoItem
            icon={<User size={17} />}
            label="Student Name"
            value={name}
          />
          <InfoItem
            icon={<Mail size={17} />}
            label="Email"
            value={student.email}
          />
          <InfoItem
            icon={<Phone size={17} />}
            label="Phone"
            value={student.phone}
          />
        </InfoSection>

        {/* Attendance Summary from the API */}
        <InfoSection
          icon={<CalendarDays size={20} />}
          heading="Attendance Summary"
          description="Lecture-wise attendance records for this student."
          iconStyle="bg-emerald-100 text-emerald-600"
          columns="sm:grid-cols-3"
        >
          <AttendanceCard
            title="Present"
            value={attendanceLoading ? "…" : attendanceSummary.present}
            description="Lectures attended"
          />
          <AttendanceCard
            title="Absent"
            value={attendanceLoading ? "…" : attendanceSummary.absent}
            description="Lectures missed"
          />
          <AttendanceCard
            title="Overall"
            value={
              attendanceLoading
                ? "…"
                : `${attendanceSummary.percentage.toFixed(1)}%`
            }
            description={`${attendanceLoading ? "Loading" : attendanceSummary.total} total attendance records`}
          />
        </InfoSection>

        {/* Bottom Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/students")}
            className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            Back to Students
          </button>
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:w-auto"
          >
            <Pencil size={17} />
            Edit Student
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoSection = ({
  icon,
  heading,
  description,
  iconStyle,
  columns,
  children,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconStyle}`}
      >
        {icon}
      </div>
      <div>
        <h2 className="font-semibold text-slate-900">{heading}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
    <div className={`mt-6 grid grid-cols-1 gap-4 ${columns}`}>{children}</div>
  </div>
);

const InfoItem = ({ icon, label, value }) => (
  <div className="rounded-xl bg-slate-50 p-4">
    <div className="flex items-center gap-2 text-slate-400">
      {icon}
      <span className="text-xs font-medium uppercase tracking-wide">
        {label}
      </span>
    </div>
    <p className="mt-2 break-words font-semibold text-slate-800">
      {value || "-"}
    </p>
  </div>
);

const AttendanceCard = ({ title, value, description }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
    <p className="text-sm font-medium text-slate-500">{title}</p>
    <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    <p className="mt-1 text-xs text-slate-400">{description}</p>
  </div>
);

export default StudentDetail;
