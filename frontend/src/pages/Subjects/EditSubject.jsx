import { ArrowLeft, ChevronDown, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useSubjects } from "../../context/SubjectContext";
import { useProfessors } from "../../context/ProfessorsContext";
import { apiGet, apiPut } from "../../services/api";
import toast from "react-hot-toast";

/* =====================================================
   COURSE OPTIONS
===================================================== */

const COURSE_OPTIONS = ["B.Tech", "BCA", "MCA", "BBA", "MBA", "B.Com"];

/* =====================================================
   DEPARTMENT OPTIONS
===================================================== */

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

/* =====================================================
   NORMALIZE SUBJECT DATA
===================================================== */

const normalizeSubject = (item) => ({
  ...item,
  id: String(
    item._id ?? item.id ?? item.subjectCode ?? item.subject_code ?? "",
  ),
  subjectCode: item.subjectCode ?? item.subject_code ?? "",
  subjectName: item.subjectName ?? item.subject_name ?? "",
  course: item.course ?? "MCA",
  department: item.department ?? "",
  semester: String(item.semester ?? "1"),
  teacherId: String(
    item.teacherId ?? item.professor_id ?? item.professorId ?? "",
  ),
  teacherName:
    item.teacherName ?? item.professor_name ?? item.professorName ?? "",
  status: item.status ?? "Active",
});

/* =====================================================
   EDIT SUBJECT
===================================================== */

const EditSubject = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { subjects = [], dispatch } = useSubjects();
  const { professors = [] } = useProfessors();

  const [loadedSubject, setLoadedSubject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

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

  /* =====================================================
     FIND SUBJECT IN CONTEXT
  ===================================================== */

  const contextSubject = subjects.find(
    (item) =>
      String(
        item._id ?? item.id ?? item.subjectCode ?? item.subject_code ?? "",
      ) === String(id),
  );

  const subject = contextSubject ?? loadedSubject;

  /* =====================================================
     LOAD SUBJECT FROM API WHEN NEEDED
  ===================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadSubject = async () => {
      setIsLoading(true);

      try {
        // First use the subject already available in context.
        if (contextSubject) {
          setLoadedSubject(normalizeSubject(contextSubject));
          return;
        }

        // Otherwise fetch the subject list from the backend.
        const response = await apiGet("/api/subjects");

        const list = Array.isArray(response)
          ? response
          : (response?.subjects ?? response?.data ?? []);

        const found = list.find(
          (item) =>
            String(
              item._id ??
                item.id ??
                item.subjectCode ??
                item.subject_code ??
                "",
            ) === String(id),
        );

        if (cancelled) return;

        if (!found) {
          setLoadedSubject(null);
          toast.error("Subject not found.");
          return;
        }

        setLoadedSubject(normalizeSubject(found));
      } catch (error) {
        if (!cancelled) {
          console.error("Load subject error:", error);
          toast.error(error?.message || "Unable to load subject.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadSubject();

    return () => {
      cancelled = true;
    };
  }, [id, contextSubject]);

  /* =====================================================
     POPULATE FORM WITH EXISTING SUBJECT DATA
  ===================================================== */

  useEffect(() => {
    if (!subject) return;

    const normalized = normalizeSubject(subject);

    const course = COURSE_OPTIONS.includes(normalized.course)
      ? normalized.course
      : "MCA";

    const departments = DEPARTMENT_OPTIONS[course] ?? [];

    // Preserve the existing department even if it is not in
    // the predefined options.
    const department = normalized.department || departments[0] || "";

    const professorId = normalized.teacherId;

    const selectedProfessor = professors.find(
      (professor) =>
        String(
          professor.teacherId ??
            professor.professorId ??
            professor.professor_id ??
            professor.id ??
            professor._id ??
            "",
        ) === professorId,
    );

    setFormData({
      subjectCode: normalized.subjectCode,
      subjectName: normalized.subjectName,
      course,
      department,
      semester: normalized.semester,
      teacherId: professorId,
      teacherName:
        normalized.teacherName ||
        selectedProfessor?.name ||
        selectedProfessor?.full_name ||
        selectedProfessor?.professor_name ||
        "",
      status: normalized.status,
    });

    setErrors({});
  }, [subject, professors]);

  /* =====================================================
     LOADING / NOT FOUND
  ===================================================== */

  if (isLoading && !subject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-slate-500">
          Loading subject information...
        </p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">
            Subject not found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            The subject you are trying to edit could not be loaded.
          </p>

          <button
            type="button"
            onClick={() => navigate("/subjects")}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Back to Subjects
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     DEPARTMENT OPTIONS
  ===================================================== */

  const departments = DEPARTMENT_OPTIONS[formData.course] ?? [];

  // Ensure an existing department remains selectable even if
  // it is absent from the predefined list.
  const departmentOptions = formData.department
    ? Array.from(new Set([...departments, formData.department]))
    : departments;

  /* =====================================================
     PROFESSOR OPTIONS
  ===================================================== */

  const professorOptions = professors
    .filter(
      (professor) =>
        professor.status !== "Inactive" ||
        String(
          professor.teacherId ??
            professor.professorId ??
            professor.professor_id ??
            professor.id ??
            professor._id ??
            "",
        ) === formData.teacherId,
    )
    .map((professor) => {
      const professorId = String(
        professor.teacherId ??
          professor.professorId ??
          professor.professor_id ??
          professor.id ??
          professor._id ??
          "",
      );

      const professorName =
        professor.name ?? professor.full_name ?? professor.professor_name ?? "";

      return {
        value: professorId,
        label: `${professorName || "Professor"} (${professorId})`,
      };
    })
    .filter((professor) => professor.value);

  // Preserve the existing professor in the select if the
  // professor list has not loaded or does not include them.
  if (
    formData.teacherId &&
    !professorOptions.some((option) => option.value === formData.teacherId)
  ) {
    professorOptions.push({
      value: formData.teacherId,
      label: formData.teacherName
        ? `${formData.teacherName} (${formData.teacherId})`
        : formData.teacherId,
    });
  }

  /* =====================================================
     HANDLE FIELD CHANGES
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "course") {
      const nextDepartments = DEPARTMENT_OPTIONS[value] ?? [];

      setFormData((prev) => ({
        ...prev,
        course: value,
        department: nextDepartments[0] ?? "",
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
        (professor) =>
          String(
            professor.teacherId ??
              professor.professorId ??
              professor.professor_id ??
              professor.id ??
              professor._id ??
              "",
          ) === value,
      );

      setFormData((prev) => ({
        ...prev,
        teacherId: value,
        teacherName:
          selectedProfessor?.name ??
          selectedProfessor?.full_name ??
          selectedProfessor?.professor_name ??
          "",
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

  /* =====================================================
     VALIDATION
  ===================================================== */

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

    if (!formData.teacherId) {
      newErrors.teacherId = "Professor is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* =====================================================
     SUBMIT / UPDATE SUBJECT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSaving) return;

    if (!validate()) {
      toast.error("Please correct the required fields.");
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
      const response = await apiPut(`/api/subjects/${id}`, payload);

      const saved = response?.subject ?? response?.data ?? {};

      const updatedSubject = {
        ...subject,
        ...normalizeSubject(subject),
        ...saved,
        id: String(saved.id ?? saved._id ?? subject.id ?? subject._id ?? id),
        subjectCode: saved.subjectCode ?? saved.subject_code ?? subjectCode,
        subjectName:
          saved.subjectName ??
          saved.subject_name ??
          formData.subjectName.trim(),
        course: saved.course ?? formData.course,
        department: saved.department ?? formData.department,
        semester: String(saved.semester ?? formData.semester),
        teacherId: String(
          saved.teacherId ?? saved.professor_id ?? formData.teacherId,
        ),
        teacherName:
          saved.teacherName ?? saved.professor_name ?? formData.teacherName,
        status: saved.status ?? formData.status,
      };

      dispatch({
        type: "UPDATE_SUBJECT",
        payload: updatedSubject,
      });

      toast.success("Subject updated successfully!");
      navigate("/subjects");
    } catch (error) {
      console.error("Update subject error:", error);

      toast.error(
        error?.message || "Failed to update subject. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* =====================================================
     SEMESTER OPTIONS
  ===================================================== */

  const semesterCount =
    formData.course === "MCA" || formData.course === "MBA" ? 4 : 6;

  const semesterOptions = Array.from({ length: semesterCount }, (_, index) => ({
    value: String(index + 1),
    label: `Semester ${index + 1}`,
  }));

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-4xl space-y-5">
        {/* Header */}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/subjects")}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50"
            aria-label="Back to subjects"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Edit Subject
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Update subject information.
            </p>
          </div>
        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
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
              options={departmentOptions.map((department) => ({
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
              required
            />

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

          {/* Buttons */}

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/subjects")}
              className="w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <Save size={17} />
              {isSaving ? "Updating..." : "Update Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =====================================================
   TEXT INPUT COMPONENT
===================================================== */

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
    <label
      htmlFor={name}
      className="mb-1.5 block text-sm font-semibold text-slate-700"
    >
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>

    <input
      id={name}
      type="text"
      name={name}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 ${
        error
          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
          : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
      }`}
    />

    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

/* =====================================================
   SELECT COMPONENT
===================================================== */

const SelectField = ({
  label,
  name,
  value,
  onChange,
  error,
  options,
  required,
}) => (
  <div>
    <label
      htmlFor={name}
      className="mb-1.5 block text-sm font-semibold text-slate-700"
    >
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>

    <div className="relative">
      <select
        id={name}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        className={`h-11 w-full appearance-none rounded-xl border bg-white px-3 pr-10 text-sm text-slate-700 outline-none focus:ring-2 ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
            : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
        }`}
      >
        {!options.some((option) => String(option.value) === String(value)) &&
          value !== "" &&
          value != null && <option value={value}>{value}</option>}

        {options.length > 0 ? (
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        ) : (
          <option value="">No options available</option>
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

export default EditSubject;
