import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useStudents, normalizeStudent } from "../../context/StudentContext";
import * as studentServiceModule from "../../services/studentService";

const studentService =
  studentServiceModule.studentService ?? studentServiceModule.default;

const INITIAL_FORM = {
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

const COURSES = ["B.Tech", "BCA", "MCA", "BBA", "MBA", "B.Com"];

const DEPARTMENTS = {
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

const SEMESTERS = {
  MCA: 4,
  MBA: 4,
  "B.Tech": 6,
  BCA: 6,
  BBA: 6,
  "B.Com": 6,
};

export default function AddStudent() {
  const navigate = useNavigate();
  const { dispatch } = useStudents();

  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const departments = DEPARTMENTS[form.course] || [];
  const semesterCount = SEMESTERS[form.course] || 6;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => {
      if (name === "course") {
        const nextDepartments = DEPARTMENTS[value] || [];

        return {
          ...previous,
          course: value,
          department: nextDepartments[0] || "",
          semester: "1",
        };
      }

      return { ...previous, [name]: value };
    });
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
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
      const image = String(reader.result || "");
      setImagePreview(image);
      setForm((previous) => ({ ...previous, image }));
    };

    reader.onerror = () => {
      toast.error("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    const registrationNo = form.registrationNo.trim().toUpperCase();
    const rollNo = form.rollNo.trim();
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (
      !registrationNo ||
      !rollNo ||
      !name ||
      !form.course ||
      !form.department ||
      !form.semester
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    if (Number(form.semester) > semesterCount || Number(form.semester) < 1) {
      toast.error("Please select a valid semester.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!studentService || typeof studentService.create !== "function") {
        throw new Error(
          "Student service is not configured. Check src/services/studentService.js.",
        );
      }

      const studentData = {
        registration_number: registrationNo,
        roll_number: rollNo,
        name,
        course: form.course,
        department: form.department,
        semester: Number(form.semester),
        section: form.section.trim(),
        email,
        phone,
        status: form.status,
      };

      // Save the student in MongoDB through the FastAPI backend.
      const response = await studentService.create(studentData);

      // Support APIs that return either the student directly or inside a wrapper.
      const savedStudent =
        response?.student ??
        response?.data?.student ??
        response?.data ??
        response;

      if (!savedStudent || typeof savedStudent !== "object") {
        throw new Error("The backend did not return the saved student.");
      }

      dispatch({
        type: "ADD_STUDENT",
        payload: normalizeStudent({
          ...studentData,
          ...savedStudent,
          registrationNo:
            savedStudent.registrationNo ??
            savedStudent.registration_number ??
            registrationNo,
          rollNo: savedStudent.rollNo ?? savedStudent.roll_number ?? rollNo,
          name: savedStudent.name ?? savedStudent.full_name ?? name,
          id:
            savedStudent.id ??
            savedStudent._id ??
            savedStudent.registration_number ??
            registrationNo,
        }),
      });

      toast.success("Student added successfully!");
      navigate("/students");
    } catch (error) {
      console.error("Unable to add student:", error);

      const message =
        error?.message || "Unable to add student. Please try again.";

      if (error?.status === 409) {
        toast.error("This registration number already exists.");
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700">
          <UserPlus size={25} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-800">Add Student</h1>
          <p className="mt-1 text-sm text-slate-500">
            Register a student in the attendance management system.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
      >
        <div className="flex flex-col items-center gap-3 border-b border-slate-100 pb-6">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-400">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Student preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImagePlus size={32} />
            )}
          </div>

          <label className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Choose Student Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          <p className="text-xs text-slate-500">Optional · Maximum 5 MB</p>
        </div>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Student Information
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label="Registration Number"
              name="registrationNo"
              value={form.registrationNo}
              onChange={handleChange}
              placeholder="Enter unique registration number"
              required
            />

            <Field
              label="Roll Number"
              name="rollNo"
              value={form.rollNo}
              onChange={handleChange}
              placeholder="Enter roll number"
              required
            />

            <Field
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter student's full name"
              required
            />

            <Field
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="student@example.com"
            />

            <Field
              label="Phone Number"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />

            <div>
              <Label>Course *</Label>
              <select
                name="course"
                value={form.course}
                onChange={handleChange}
                required
                className={inputClass}
              >
                {COURSES.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Department *</Label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                required
                className={inputClass}
              >
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Semester *</Label>
              <select
                name="semester"
                value={form.semester}
                onChange={handleChange}
                required
                className={inputClass}
              >
                {Array.from({ length: semesterCount }, (_, index) =>
                  String(index + 1),
                ).map((semester) => (
                  <option key={semester} value={semester}>
                    Semester {semester}
                  </option>
                ))}
              </select>
            </div>

            <Field
              label="Section"
              name="section"
              value={form.section}
              onChange={handleChange}
              placeholder="e.g. A"
            />

            <div>
              <Label>Status</Label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </section>

        <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/students")}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Add Student"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

function Label({ children }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <Label>
        {label}
        {required ? " *" : ""}
      </Label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={inputClass}
      />
    </div>
  );
}
