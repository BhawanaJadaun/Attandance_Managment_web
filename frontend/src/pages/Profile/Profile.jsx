import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Edit3,
  Save,
  X,
  GraduationCap,
  BriefcaseBusiness,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { apiGet, apiPut } from "../../services/api.js";

const DEFAULT_PROFILE = {
  name: "",
  email: "",
  phone: "",
  role: "User",
  department: "",
  designation: "",
  employeeId: "",
  status: "Active",
};

// Convert backend fields to the format used by this React page.
function normalizeProfile(data = {}) {
  const role = String(data.role || "user");

  return {
    name: data.full_name || data.name || "",
    email: data.email || "",
    phone: data.phone || "",
    role:
      role.toLowerCase() === "admin"
        ? "Administrator"
        : role.charAt(0).toUpperCase() + role.slice(1),
    department: data.department || "",
    designation: data.designation || "",
    employeeId: String(
      data.employee_id ||
        data.employeeId ||
        data.user_id ||
        data._id ||
        data.id ||
        "",
    ),
    status: data.status || "Active",
  };
}

export default function Profile() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [draft, setDraft] = useState(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load the logged-in user's profile from FastAPI.
  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await apiGet("/api/profile/me");

        const data = normalizeProfile(
          response?.profile || response?.user || response,
        );

        if (active) {
          setProfile(data);
          setDraft(data);
        }
      } catch (error) {
        if (active) {
          toast.error(error?.message || "Could not load your profile.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (key, value) => {
    setDraft((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSaved(false);
  };

  const handleEdit = () => {
    setDraft({ ...profile });
    setEditing(true);
    setSaved(false);
  };

  const handleCancel = () => {
    setDraft({ ...profile });
    setEditing(false);
    setSaved(false);
  };

  // Save changes to MongoDB through the FastAPI backend.
  const handleSave = async () => {
    if (!draft.name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!draft.phone.trim()) {
      toast.error("Please enter your phone number.");
      return;
    }

    setSaving(true);
    setSaved(false);

    try {
      const response = await apiPut("/api/profile/me", {
        full_name: draft.name.trim(),
        phone: draft.phone.trim(),
      });

      // The current backend returns a message rather than a profile.
      // Merge the saved values with the existing profile.
      const updated = normalizeProfile({
        ...profile,
        ...(response?.profile || {}),
        full_name: draft.name.trim(),
        phone: draft.phone.trim(),
      });

      setProfile(updated);
      setDraft(updated);
      setEditing(false);
      setSaved(true);

      toast.success(response?.message || "Profile updated successfully.");
    } catch (error) {
      toast.error(error?.message || "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center bg-slate-50">
        <div className="text-sm font-medium text-slate-500">
          Loading your profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full bg-slate-50">
      <div className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-5 lg:p-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Profile
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your personal and account information.
            </p>
          </div>

          {!editing ? (
            <button
              type="button"
              onClick={handleEdit}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto"
            >
              <Edit3 size={17} />
              Edit Profile
            </button>
          ) : (
            <div className="flex w-full gap-2 sm:w-auto">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
              >
                <X size={17} />
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
              >
                <Save size={17} />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        {/* SUCCESS MESSAGE */}
        {saved && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            Profile updated successfully.
          </div>
        )}

        {/* PROFILE TOP CARD */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-28 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 sm:h-36" />

          <div className="px-4 pb-5 sm:px-6">
            <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-indigo-100 text-indigo-700 shadow-md sm:h-24 sm:w-24">
                  <User size={42} />
                </div>

                <div className="pb-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    {profile.name || "Your Name"}
                  </h2>

                  <p className="text-sm text-slate-500">
                    {profile.designation || profile.role}
                  </p>
                </div>
              </div>

              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {profile.status}
              </span>
            </div>
          </div>
        </section>

        {/* PERSONAL INFORMATION */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <h2 className="font-semibold text-slate-900">
              Personal Information
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Your basic account and contact information.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
            <ProfileField
              label="Full Name"
              value={editing ? draft.name : profile.name}
              icon={User}
              editing={editing}
              onChange={(value) => handleChange("name", value)}
            />

            <ProfileField
              label="Email Address"
              value={profile.email}
              icon={Mail}
              editing={false}
            />

            <ProfileField
              label="Phone Number"
              value={editing ? draft.phone : profile.phone}
              icon={Phone}
              editing={editing}
              onChange={(value) => handleChange("phone", value)}
            />

            <ProfileField
              label="Role"
              value={profile.role}
              icon={ShieldCheck}
              editing={false}
            />

            <ProfileField
              label="Department"
              value={profile.department}
              icon={GraduationCap}
              editing={false}
            />

            <ProfileField
              label="Employee / User ID"
              value={profile.employeeId}
              icon={BriefcaseBusiness}
              editing={false}
            />
          </div>
        </section>

        {/* ACCOUNT INFORMATION */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <h2 className="font-semibold text-slate-900">
              Account Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <InfoBox label="Account Role" value={profile.role} />

            <InfoBox label="Account Status" value={profile.status} />

            <InfoBox label="Department" value={profile.department} />

            <InfoBox label="User ID" value={profile.employeeId} />
          </div>
        </section>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
  icon: Icon,
  editing,
  onChange,
  type = "text",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <Icon
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        {editing && onChange ? (
          <input
            type={type}
            value={value || ""}
            onChange={(event) => onChange(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        ) : (
          <div className="flex min-h-11 items-center break-words rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700">
            {value || "-"}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value || "-"}
      </p>
    </div>
  );
}
