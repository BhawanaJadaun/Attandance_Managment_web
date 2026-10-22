import {
  ArrowLeft,
  Building2,
  Briefcase,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiPost } from "../../services/api";
import { useProfessors } from "../../context/ProfessorsContext";

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
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

const AddProfessor = () => {
  const navigate = useNavigate();
  const { professors = [], dispatch } = useProfessors();

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "professorId" ? value.toUpperCase() : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};
    const professorId = formData.professorId.trim().toUpperCase();
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();

    if (!professorId) {
      newErrors.professorId = "Professor ID is required.";
    } else {
      const duplicate = professors.some((professor) => {
        const existingId = String(
          professor.professorId ?? professor.professor_id ?? professor.id ?? "",
        )
          .trim()
          .toUpperCase();

        return existingId === professorId;
      });

      if (duplicate) {
        newErrors.professorId = "This Professor ID already exists.";
      }
    }

    if (!name) {
      newErrors.name = "Professor name is required.";
    } else if (name.length < 3) {
      newErrors.name = "Professor name must contain at least 3 characters.";
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (phone && !/^[0-9]{10}$/.test(phone)) {
      newErrors.phone = "Phone number must contain exactly 10 digits.";
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

    if (isSaving || !validate()) return;

    setIsSaving(true);

    const professorId = formData.professorId.trim().toUpperCase();

    // Translate frontend camelCase fields to backend snake_case.
    const payload = {
      professor_id: professorId,
      full_name: formData.name.trim(),
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      department: formData.department,
      designation: formData.designation,
      status: formData.status,
    };

    try {
      const response = await apiPost("/api/professors/", payload);

      // Support APIs that return either the professor directly
      // or inside a `professor` / `data` property.
      const saved = response?.professor ?? response?.data ?? response;

      const newProfessor = {
        ...saved,
        id: String(
          saved?._id ?? saved?.id ?? saved?.professor_id ?? professorId,
        ),
        professorId: String(
          saved?.professor_id ?? saved?.professorId ?? professorId,
        ),
        name:
          saved?.full_name ??
          saved?.fullName ??
          saved?.name ??
          formData.name.trim(),
        email: saved?.email ?? payload.email,
        phone: saved?.phone ?? payload.phone,
        department: saved?.department ?? payload.department,
        designation: saved?.designation ?? payload.designation,
        status: saved?.status ?? payload.status,
      };

      dispatch({
        type: "ADD_PROFESSOR",
        payload: newProfessor,
      });

      toast.success("Professor added successfully.");
      navigate("/professors");
    } catch (error) {
      const message = error?.message || "Unable to save professor.";

      setErrors((prev) => ({
        ...prev,
        submit: message,
      }));

      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-5xl space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/professors")}
              aria-label="Back to professors"
              className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <ArrowLeft
                size={20}
                className="transition-transform group-hover:-translate-x-0.5"
              />
            </button>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Add Professor
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Create a professor profile for the attendance system.
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm sm:flex">
            <ShieldCheck size={16} className="text-emerald-500" />
            New Profile
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 via-white to-white px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <UserRound size={21} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">
                  Professor Information
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Enter the basic and professional information.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            {/* Basic information */}
            <section>
              <SectionTitle
                icon={<UserRound size={17} />}
                title="Basic Information"
                description="Personal and contact details"
              />

              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField
                  label="Professor ID"
                  name="professorId"
                  value={formData.professorId}
                  onChange={handleChange}
                  error={errors.professorId}
                  placeholder="e.g. P001"
                  required
                  icon={<UserRound size={17} />}
                />

                <FormField
                  label="Professor Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="e.g. Dr. Sharma"
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
            </section>

            {/* Professional information */}
            <section className="mt-8 border-t border-slate-100 pt-7">
              <SectionTitle
                icon={<Briefcase size={17} />}
                title="Professional Information"
                description="Department, designation and account status"
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
                  required
                  icon={<ShieldCheck size={17} />}
                />
              </div>
            </section>

            {/* Information */}
            <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-900">
                    Professor ID must be unique
                  </p>
                  <p className="mt-1 text-xs leading-5 text-indigo-700">
                    Use an ID such as P001, P002 or P003. This ID can be
                    associated with subjects and lecture records.
                  </p>
                </div>
              </div>
            </div>

            {errors.submit && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {errors.submit}
              </p>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/professors")}
                disabled={isSaving}
                className="w-full rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <Save size={17} />
                {isSaving ? "Saving..." : "Save Professor"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const SectionTitle = ({ icon, title, description }) => (
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

const FormField = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  required,
  inputMode,
  maxLength,
  type = "text",
  icon,
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
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        autoComplete="off"
        required={required}
        aria-invalid={Boolean(error)}
        className={`h-11 w-full rounded-xl border bg-white text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:ring-2 ${
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

const SelectField = ({
  label,
  name,
  value,
  onChange,
  error,
  options,
  required,
  icon,
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
        required={required}
        aria-invalid={Boolean(error)}
        className={`h-11 w-full appearance-none rounded-xl border bg-white text-sm text-slate-700 outline-none transition-all focus:ring-2 ${
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

      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
        ▼
      </span>
    </div>

    {error && (
      <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
    )}
  </div>
);

export default AddProfessor;
