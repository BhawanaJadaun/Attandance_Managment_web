import {
  ArrowLeft,
  Save,
  UserRound,
  Mail,
  Phone,
  Building2,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useProfessors } from "../../context/ProfessorsContext";
import { apiGet, apiPut } from "../../services/api.js";

const DEPARTMENT_OPTIONS = [
  "Computer Applications",
  "Computer Science & Engineering",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Management",
  "Commerce",
];

const DESIGNATION_OPTIONS = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
  "Visiting Faculty",
];

const STATUS_OPTIONS = [
  {
    value: "Active",
    label: "Active",
  },
  {
    value: "Inactive",
    label: "Inactive",
  },
];

const EditProfessor = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { professors = [], dispatch } = useProfessors();

  const [professor, setProfessor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadProfessor = async () => {
      setLoading(true);

      try {
        const cached = professors.find(
          (item) =>
            String(
              item._id ?? item.id ?? item.professor_id ?? item.professorId,
            ) === String(id),
        );

        let record = cached;

        try {
          const response = await apiGet(
            `/api/professors/${encodeURIComponent(id)}`,
          );

          record = response?.professor ?? response?.data ?? response;
        } catch (error) {
          // Use cached data only if the detail API request fails.
          if (!cached) throw error;
        }

        if (!record || typeof record !== "object") {
          throw new Error("Professor details were not returned.");
        }

        if (!cancelled) {
          setProfessor({
            ...record,
            _id: String(record._id ?? record.id ?? cached?._id ?? id),
            professorId:
              record.professor_id ??
              record.professorId ??
              cached?.professorId ??
              cached?.professor_id ??
              "",
            name: record.full_name ?? record.name ?? cached?.name ?? "",
            email: record.email ?? "",
            phone: record.phone ?? "",
            department: record.department ?? "",
            designation: record.designation ?? "",
            status: record.status ?? "Active",
          });
        }
      } catch (error) {
        console.error("Failed to load professor:", error);
        if (!cancelled) {
          setProfessor(null);
          toast.error(
            "Unable to load professor. Check the ID and backend API.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfessor();

    return () => {
      cancelled = true;
    };
  }, [id, professors]);

  const [formData, setFormData] = useState({
    professorId: "",
    name: "",
    email: "",
    phone: "",
    department: "Computer Applications",
    designation: "Assistant Professor",
    status: "Active",
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
useEffect(() => {
  if (!professor) return;

  setFormData({
    professorId:
      professor.professorId ?? professor.professor_id ?? "",
    name: professor.name ?? professor.full_name ?? "",
    email: professor.email ?? "",
    phone: professor.phone ?? "",
    department: professor.department ?? "Computer Applications",
    designation: professor.designation ?? "Assistant Professor",
    status: professor.status ?? "Active",
  });
}, [professor]);
  if (loading) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      Loading professor details...
    </div>
  );
}
  if (!professor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <UserRound className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Professor Not Found
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            The professor you are trying to edit does not exist or may have
            already been removed.
          </p>

          <button
            type="button"
            onClick={() => navigate("/professors")}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Back to Professors
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

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

    if (!formData.professorId.trim()) {
      newErrors.professorId = "Professor ID is required.";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Professor name is required.";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must contain at least 3 characters.";
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Enter a valid email address.";
      }
    }

    if (formData.phone.trim()) {
      const phoneRegex = /^[0-9]{10}$/;

      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = "Phone number must contain exactly 10 digits.";
      }
    }

    if (!formData.department) {
      newErrors.department = "Department is required.";
    }

    if (!formData.designation) {
      newErrors.designation = "Designation is required.";
    }

    if (!formData.status) {
      newErrors.status = "Status is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    if (!professor) {
      toast.error("Professor details could not be found.");
      return;
    }

    setIsSaving(true);

    try {
      const professorId = formData.professorId.trim().toUpperCase();

      // Fields expected by the FastAPI backend (snake_case).
      const payload = {
        professor_id: professorId,
        full_name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department: formData.department,
        designation: formData.designation,
        status: formData.status,
      };

      // Use the existing professor ID in the URL.
      // The backend must support PUT /api/professors/{id}.
      const recordId =
        professor._id ||
        professor.id ||
        professor.professorId ||
        professor.professor_id ||
        id;

      const response = await apiPut(
        `/api/professors/${encodeURIComponent(recordId)}`,
        payload,
      );

      // Update the React context only after the API succeeds.
      const saved = response?.professor ?? response?.data ?? response ?? {};

      const updatedProfessor = {
        ...professor,
        id: professor.id ?? professor._id ?? recordId,
        _id: professor._id,
        professorId: saved.professor_id ?? saved.professorId ?? professorId,
        name: saved.full_name ?? saved.name ?? formData.name.trim(),
        email: saved.email ?? formData.email.trim(),
        phone: saved.phone ?? formData.phone.trim(),
        department: saved.department ?? formData.department,
        designation: saved.designation ?? formData.designation,
        status: saved.status ?? formData.status,
      };

      dispatch({
        type: "UPDATE_PROFESSOR",
        payload: updatedProfessor,
      });

      toast.success("Professor updated successfully!");

      navigate("/professors");
    } catch (error) {
      console.error("Update professor error:", error);

      toast.error(
        error?.message || "Failed to update professor. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-5xl space-y-5">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/professors")}
              className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
              aria-label="Back to professors"
            >
              <ArrowLeft
                size={20}
                className="transition-transform group-hover:-translate-x-0.5"
              />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Edit Professor
                </h1>

                <span className="hidden rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 sm:inline-flex">
                  {formData.professorId}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Update professor information and account status.
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm sm:flex">
            <ShieldCheck size={16} className="text-emerald-500" />
            Profile Editor
          </div>
        </div>

        {/* ================= FORM ================= */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          {/* Form Header */}
          <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 via-white to-white px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <UserRound size={21} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Professor Information
                </h2>
                <p className="text-xs text-slate-500">
                  Make changes to the professor profile below.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            {/* ================= BASIC INFORMATION ================= */}
            <div>
              <SectionTitle
                icon={<UserRound size={17} />}
                title="Basic Information"
                description="Personal and identification details"
              />

              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField
                  label="Professor ID"
                  name="professorId"
                  value={formData.professorId}
                  onChange={handleChange}
                  error={errors.professorId}
                  placeholder="e.g. PRF001"
                  required
                  icon={<UserRound size={17} />}
                />

                <FormField
                  label="Professor Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="Enter professor name"
                  required
                  icon={<UserRound size={17} />}
                />

                <FormField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="professor@example.com"
                  icon={<Mail size={17} />}
                />

                <FormField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="10 digit phone number"
                  inputMode="numeric"
                  maxLength={10}
                  icon={<Phone size={17} />}
                />
              </div>
            </div>

            {/* ================= PROFESSIONAL INFORMATION ================= */}
            <div className="mt-8 border-t border-slate-100 pt-7">
              <SectionTitle
                icon={<Briefcase size={17} />}
                title="Professional Information"
                description="Department and academic designation"
              />

              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <SelectField
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  error={errors.department}
                  options={DEPARTMENT_OPTIONS.map((department) => ({
                    value: department,
                    label: department,
                  }))}
                  required
                  icon={<Building2 size={17} />}
                />

                <SelectField
                  label="Designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  error={errors.designation}
                  options={DESIGNATION_OPTIONS.map((designation) => ({
                    value: designation,
                    label: designation,
                  }))}
                  required
                  icon={<Briefcase size={17} />}
                />

                <SelectField
                  label="Account Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  error={errors.status}
                  options={STATUS_OPTIONS}
                  icon={<ShieldCheck size={17} />}
                />
              </div>
            </div>

            {/* ================= STATUS PREVIEW ================= */}
            <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Account Status
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Current professor account availability.
                  </p>
                </div>

                <StatusBadge status={formData.status} />
              </div>
            </div>

            {/* ================= BUTTONS ================= */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/professors")}
                className="w-full rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <Save size={17} />

                {isSaving ? "Updating..." : "Update Professor"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================
   SECTION TITLE
========================================================= */

const SectionTitle = ({ icon, title, description }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>

        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
};

/* =========================================================
   FORM FIELD
========================================================= */

const FormField = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  inputMode,
  maxLength,
  placeholder,
  type = "text",
  icon,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-semibold text-slate-700"
      >
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}

        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          inputMode={inputMode}
          maxLength={maxLength}
          placeholder={placeholder}
          autoComplete="off"
          className={`h-11 w-full rounded-xl border bg-white text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
            icon ? "pl-10 pr-3" : "px-3"
          } ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-100"
              : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
          }`}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
};

/* =========================================================
   SELECT FIELD
========================================================= */

const SelectField = ({
  label,
  name,
  value,
  onChange,
  error,
  options,
  required,
  icon,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-semibold text-slate-700"
      >
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}

        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`h-11 w-full appearance-none rounded-xl border bg-white text-sm text-slate-700 outline-none transition focus:ring-2 ${
            icon ? "pl-10 pr-10" : "px-3 pr-10"
          } ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-100"
              : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
          }`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom arrow */}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          ▼
        </span>
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
};

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({ status }) => {
  const active = status === "Active";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />

      {status}
    </span>
  );
};

export default EditProfessor;
