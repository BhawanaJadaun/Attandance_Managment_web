
import { ArrowLeft, ImagePlus, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  useStudents,
  normalizeStudent,
} from "../../context/StudentContext";
import { apiPut } from "../../services/api";

const COURSE_OPTIONS = [
  { value: "B.Tech", label: "B.Tech" },
  { value: "BCA", label: "BCA" },
  { value: "MCA", label: "MCA" },
  { value: "BBA", label: "BBA" },
  { value: "MBA", label: "MBA" },
  { value: "B.Com", label: "B.Com" },
];

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
  const count = ["MCA", "MBA"].includes(course) ? 4 : 6;

  return Array.from({ length: count }, (_, index) => ({
    value: String(index + 1),
    label: `Semester ${index + 1}`,
  }));
};

const INITIAL_FORM = {
  id: "",
  registrationNo: "",
  rollNo: "",
  name: "",
  course: "MCA",
  department: "Computer Applications",
  semester: "1",
  section: "",
  email: "",
  phone: "",
  status: "Active",
  image: "",
};

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100";

const labelClass =
  "mb-2 block text-sm font-medium text-slate-700";

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { students = [], dispatch } = useStudents();

  const student = students.find(
    (item) =>
      String(item.id) === String(id) ||
      String(item.registrationNo) === String(id)
  );

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (student) {
      setFormData({
        ...INITIAL_FORM,
        ...normalizeStudent(student),
        id: String(student.id ?? ""),
        registrationNo: student.registrationNo ?? "",
        rollNo: student.rollNo ?? "",
        name: student.name ?? "",
        semester: String(student.semester ?? "1"),
        image: student.image ?? "",
      });

      setIsLoading(false);
    } else if (students.length > 0) {
      setIsLoading(false);
    }
  }, [student, students.length]);

  const departments = DEPARTMENT_OPTIONS[formData.course] || [];
  const semesterOptions = getSemesterOptions(formData.course);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleCourseChange = (event) => {
    const course = event.target.value;
    const courseDepartments = DEPARTMENT_OPTIONS[course] || [];

    setFormData((previous) => ({
      ...previous,
      course,
      department: courseDepartments[0] || "",
      semester: "1",
    }));

    setErrors((previous) => ({
      ...previous,
      course: "",
      department: "",
      semester: "",
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setFormData((previous) => ({
        ...previous,
        image: String(reader.result || ""),
      }));
    };

    reader.onerror = () => {
      toast.error("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.registrationNo.trim()) {
      newErrors.registrationNo = "Registration number is required.";
    }

    if (!formData.rollNo.trim()) {
      newErrors.rollNo = "Roll number is required.";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Student name is required.";
    }

    if (!formData.course) {
      newErrors.course = "Course is required.";
    }

    if (!formData.department) {
      newErrors.department = "Department is required.";
    }

    const semester = Number(formData.semester);
    const semesterCount = ["MCA", "MBA"].includes(formData.course) ? 4 : 6;

    if (
      !formData.semester ||
      semester < 1 ||
      semester > semesterCount
    ) {
      newErrors.semester = "Please select a valid semester.";
    }

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (
      formData.phone.trim() &&
      !/^[0-9+\-\s()]{7,20}$/.test(formData.phone.trim())
    ) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please correct the highlighted fields.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting || !validate()) return;

    if (!student?.id) {
      toast.error("Student record not found. Refresh and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      // FastAPI expects snake_case field names.
      const payload = {
        registration_number: formData.registrationNo.trim().toUpperCase(),
        roll_number: formData.rollNo.trim(),
        full_name: formData.name.trim(),
        course: formData.course,
        department: formData.department,
        semester: Number(formData.semester),
        section: formData.section.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        status: formData.status,
      };

      // Update MongoDB through the authenticated FastAPI API.
      const response = await apiPut(
        `/api/students/${encodeURIComponent(student.id)}`,
        payload
      );

      const updatedRecord =
        response?.student ??
        response?.data?.student ??
        response?.data ??
        {};

      // Update the React context only after the backend succeeds.
      dispatch({
        type: "UPDATE_STUDENT",
        payload: normalizeStudent({
          ...student,
          ...payload,
          ...updatedRecord,
          id: String(
            updatedRecord.id ??
              updatedRecord._id ??
              student.id
          ),
          registrationNo:
            updatedRecord.registrationNo ??
            updatedRecord.registration_number ??
            payload.registration_number,
          rollNo:
            updatedRecord.rollNo ??
            updatedRecord.roll_number ??
            payload.roll_number,
          name:
            updatedRecord.name ??
            updatedRecord.full_name ??
            payload.full_name,
          semester:
            updatedRecord.semester ?? payload.semester,
        }),
      });

      toast.success("Student updated successfully!");
      navigate("/students");
    } catch (error) {
      console.error("Failed to update student:", error);

      toast.error(
        error?.message || "Unable to update student. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading student details...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">
            Student not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This student may have been removed or could not be loaded.
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

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/students")}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Edit Student
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Update student information.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Student photo */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Student Photo
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose a new profile image.
            </p>

            <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Student preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImagePlus size={32} className="text-slate-400" />
                )}
              </div>

              <div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                  <ImagePlus size={17} />
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="mt-2 text-xs text-slate-400">
                  Image preview only; uploading it to the backend is not
                  implemented yet.
                </p>
              </div>
            </div>
          </section>

          {/* Academic information */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Academic Information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Update the student's academic details.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="Registration Number *"
                name="registrationNo"
                value={formData.registrationNo}
                onChange={handleChange}
                error={errors.registrationNo}
                placeholder="Enter registration number"
              />

              <Field
                label="Roll Number *"
                name="rollNo"
                value={formData.rollNo}
                onChange={handleChange}
                error={errors.rollNo}
                placeholder="Enter roll number"
              />

              <SelectField
                label="Course *"
                value={formData.course}
                onChange={handleCourseChange}
                error={errors.course}
                options={COURSE_OPTIONS}
              />

              <SelectField
                label="Department *"
                name="department"
                value={formData.department}
                onChange={handleChange}
                error={errors.department}
                options={departments.map((department) => ({
                  value: department,
                  label: department,
                }))}
              />

              <SelectField
                label="Semester *"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                error={errors.semester}
                options={semesterOptions}
              />

              <Field
                label="Section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                placeholder="Example: A"
              />
            </div>
          </section>

          {/* Personal information */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Personal Information
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field
                  label="Student Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="Enter student name"
                />
              </div>

              <Field
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="student@example.com"
              />

              <Field
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="Enter phone number"
              />

              <SelectField
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" },
                ]}
              />
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/students")}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <Save size={17} />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${inputClass} ${
          error ? "border-red-400 focus:ring-red-100" : ""
        }`}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  error,
  options,
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`${inputClass} ${
          error ? "border-red-400 focus:ring-red-100" : ""
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}