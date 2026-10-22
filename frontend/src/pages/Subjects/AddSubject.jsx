
import { ArrowLeft, BookOpen, ChevronDown, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../../services/api";
import toast from "react-hot-toast";
import { useSubjects } from "../../context/SubjectContext";
import { useProfessors } from "../../context/ProfessorsContext";

const COURSE_OPTIONS = ["B.Tech", "BCA", "MCA", "BBA", "MBA", "B.Com"];

const DEPARTMENT_OPTIONS = {
  "B.Tech": [
    "Computer Science & Engineering",
    "Information Technology",
    "Artificial Intelligence & Machine Learning",
    "Artificial Intelligence & Data Science",
    "Electronics & Communication Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Biotechnology",
    "Aerospace Engineering",
    "Automobile Engineering",
    "Production Engineering",
  ],
  BCA: [
    "Computer Applications",
    "Computer Science",
    "Information Technology",
    "Data Science",
    "Artificial Intelligence",
    "Cyber Security",
    "Cloud Computing",
    "Software Development",
  ],
  MCA: [
    "Computer Applications",
    "Computer Science",
    "Information Technology",
    "Artificial Intelligence & Machine Learning",
    "Data Science",
    "Cyber Security",
    "Cloud Computing",
    "Software Engineering",
    "Data Analytics",
  ],
  BBA: [
    "Management",
    "Human Resource Management",
    "Marketing",
    "Finance",
    "International Business",
    "Business Analytics",
    "Entrepreneurship",
    "Operations Management",
  ],
  MBA: [
    "Management",
    "Finance",
    "Marketing",
    "Human Resource Management",
    "International Business",
    "Business Analytics",
    "Operations Management",
    "Information Technology",
    "Entrepreneurship",
    "Healthcare Management",
  ],
  "B.Com": [
    "Commerce",
    "Accounting & Finance",
    "Banking & Insurance",
    "Taxation",
    "Business Economics",
    "Financial Management",
    "Computer Applications",
  ],
};

const getProfessorId = (professor) =>
  String(
    professor.professor_id ??
      professor.professorId ??
      professor.teacherId ??
      professor.id ??
      professor._id ??
      ""
  ).trim();

const getProfessorName = (professor) =>
  String(
    professor.full_name ??
      professor.name ??
      professor.professor_name ??
      professor.professorName ??
      ""
  ).trim();

const AddSubject = () => {
  const navigate = useNavigate();
  const { dispatch } = useSubjects();
  const { professors = [], loading: professorsLoading = false } =
    useProfessors();

  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    subjectCode: "",
    subjectName: "",
    course: "MCA",
    department: "Computer Applications",
    semester: "1",
    teacherId: "",
    teacherName: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});

  const departments = DEPARTMENT_OPTIONS[formData.course] || [];

  const semesterCount =
    formData.course === "MCA" || formData.course === "MBA" ? 4 : 6;

  const semesterOptions = Array.from(
    { length: semesterCount },
    (_, index) => ({
      value: String(index + 1),
      label: `Semester ${index + 1}`,
    })
  );

  // Only professors returned by the database API are displayed.
  const professorOptions = professors
    .map((professor) => {
      const professorId = getProfessorId(professor);
      const professorName = getProfessorName(professor);

      return {
        value: professorId,
        label: `${professorName} (${professorId})`,
      };
    })
    .filter(
      (professor) => professor.value && professor.label.trim()
    );

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "course") {
      const nextDepartments = DEPARTMENT_OPTIONS[value] || [];

      setFormData((prev) => ({
        ...prev,
        course: value,
        department: nextDepartments[0] || "",
        semester: "1",
      }));

      setErrors((prev) => ({
        ...prev,
        course: "",
        department: "",
        semester: "",
      }));

      return;
    }

    if (name === "teacherId") {
      const selectedProfessor = professors.find(
        (professor) => getProfessorId(professor) === value
      );

      setFormData((prev) => ({
        ...prev,
        teacherId: value,
        teacherName: selectedProfessor
          ? getProfessorName(selectedProfessor)
          : "",
      }));

      setErrors((prev) => ({
        ...prev,
        teacherId: "",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.subjectCode.trim()) {
      newErrors.subjectCode = "Subject code is required.";
    }

    if (!formData.subjectName.trim()) {
      newErrors.subjectName = "Subject name is required.";
    }

    if (!formData.course) {
      newErrors.course = "Course is required.";
    }

    if (!formData.department) {
      newErrors.department = "Department is required.";
    }

    if (!formData.semester) {
      newErrors.semester = "Semester is required.";
    }

    // Ensure the selected professor still exists in the loaded list.
    const professorExists = professors.some(
      (professor) => getProfessorId(professor) === formData.teacherId
    );

    if (!formData.teacherId || !professorExists) {
      newErrors.teacherId = "Please select a saved professor.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSaving) return;

    if (professorsLoading) {
      toast.error("Please wait while professors are loading.");
      return;
    }

    if (!validate()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const subjectCode = formData.subjectCode.trim().toUpperCase();

    const payload = {
      subject_code: subjectCode,
      subject_name: formData.subjectName.trim(),
      course: formData.course,
      department: formData.department,
      semester: Number(formData.semester),
      professor_id: formData.teacherId,
      professor_name: formData.teacherName,
      status: formData.status,
    };

    setIsSaving(true);

    try {
      const response = await apiPost("/api/subjects", payload);
      const saved = response?.subject ?? response?.data ?? response;

      const newSubject = {
        id: String(
          saved?._id ?? saved?.id ?? saved?.subject_code ?? subjectCode
        ),
        subjectCode: saved?.subject_code ?? subjectCode,
        subjectName:
          saved?.subject_name ?? formData.subjectName.trim(),
        course: saved?.course ?? formData.course,
        department: saved?.department ?? formData.department,
        semester: String(saved?.semester ?? formData.semester),
        teacherId: saved?.professor_id ?? formData.teacherId,
        teacherName: saved?.professor_name ?? formData.teacherName,
        status: saved?.status ?? formData.status,
      };

      dispatch({
        type: "ADD_SUBJECT",
        payload: newSubject,
      });

      toast.success("Subject added successfully!");
      navigate("/subjects");
    } catch (error) {
      console.error("Add subject error:", error);

      const message =
        error?.detail ??
        error?.message ??
        "Unable to save subject. Please check the backend connection.";

      toast.error(
        typeof message === "string"
          ? message
          : "Unable to save subject. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/subjects")}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Add Subject
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create a new subject and assign a professor.
            </p>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Subject Information
              </h2>
              <p className="text-sm text-slate-500">
                Enter the basic subject details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label="Subject Code"
              name="subjectCode"
              value={formData.subjectCode}
              onChange={handleChange}
              error={errors.subjectCode}
              placeholder="e.g. BMC301"
              required
            />

            <FormField
              label="Subject Name"
              name="subjectName"
              value={formData.subjectName}
              onChange={handleChange}
              error={errors.subjectName}
              placeholder="e.g. Computer Networks"
              required
            />

            <SelectField
              label="Course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              error={errors.course}
              options={COURSE_OPTIONS.map((course) => ({
                value: course,
                label: course,
              }))}
              required
            />

            <SelectField
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              error={errors.department}
              options={departments.map((department) => ({
                value: department,
                label: department,
              }))}
              required
            />

            <SelectField
              label="Semester"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              error={errors.semester}
              options={semesterOptions}
              required
            />

            <SelectField
              label="Professor"
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
              error={errors.teacherId}
              options={professorOptions}
              placeholder={
                professorsLoading
                  ? "Loading professors..."
                  : "Select professor"
              }
              required
              disabled={professorsLoading}
            />

            {!professorsLoading && professorOptions.length === 0 && (
              <p className="text-sm text-amber-700 md:col-span-2">
                No professors were returned by the database API. Check the
                ProfessorsContext and /api/professors endpoint.
              </p>
            )}

            <SelectField
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              error={errors.status}
              options={[
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
              ]}
            />
          </div>

          <footer className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/subjects")}
              className="w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving || professorsLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <Save size={17} />
              {isSaving ? "Saving..." : "Save Subject"}
            </button>
          </footer>
        </form>
      </div>
    </main>
  );
};

const FormField = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  required,
}) => (
  <div>
    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>

    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
        error
          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
          : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
      }`}
    />

    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  onChange,
  error,
  options,
  placeholder,
  required,
  disabled = false,
}) => (
  <div>
    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>

    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`h-11 w-full appearance-none rounded-xl border bg-white px-3 pr-10 text-sm text-slate-700 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
            : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
        }`}
      >
        {placeholder && <option value="">{placeholder}</option>}

        {options.length > 0 ? (
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        ) : (
          <option value="" disabled>
            No options available
          </option>
        )}
      </select>

      <ChevronDown
        size={17}
        strokeWidth={2}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>

    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

export default AddSubject;
