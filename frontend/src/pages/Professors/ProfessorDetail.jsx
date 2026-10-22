import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Mail,
  Pencil,
  Phone,
  User,
  UserRound,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProfessors } from "../../context/ProfessorsContext";
import { apiGet } from "../../services/api";
import { toast } from "react-hot-toast";

const ProfessorDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { professors = [] } = useProfessors();

  const [professor, setProfessor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadProfessor = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        // First try the professor already available in context.
        const cached = professors.find(
          (item) =>
            String(
              item.id ?? item._id ?? item.professor_id ?? item.professorId,
            ) === String(id),
        );

        // Always request the latest record from the backend.
        const response = await apiGet(
          `/api/professors/${encodeURIComponent(id)}`,
        );

        const record = response?.professor ?? response?.data ?? response;

        if (!record || typeof record !== "object") {
          throw new Error("Invalid professor response from server.");
        }

        const normalized = {
          ...record,
          _id: String(record._id ?? record.id ?? record.id_ ?? id),
          professorId: record.professor_id ?? record.professorId ?? "",
          name: record.full_name ?? record.name ?? "",
          email: record.email ?? "",
          phone: record.phone ?? "",
          department: record.department ?? "",
          designation: record.designation ?? "",
          status: record.status ?? "Active",
        };

        if (!cancelled) {
          setProfessor(normalized);
        }
        if (!cancelled) {
          setProfessor(normalized);
        }
      } catch (error) {
        console.error("Failed to load professor:", error);

        if (!cancelled) {
          // If the API fails, show cached data if available.
          const cached = professors.find(
            (item) =>
              String(
                item.id ?? item._id ?? item.professor_id ?? item.professorId,
              ) === String(id),
          );

          if (cached) {
            setProfessor({
              ...cached,
              id: String(cached.id ?? cached._id ?? id),
              professorId: cached.professorId ?? cached.professor_id ?? "",
              name: cached.name ?? cached.full_name ?? "",
            });

            toast.error(
              "Could not refresh professor details. Showing saved page data.",
            );
          } else {
            setProfessor(null);
            setNotFound(
              error?.status === 404 ||
                /not found|404/i.test(error?.message ?? ""),
            );

            toast.error(error?.message || "Unable to load professor details.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfessor();

    return () => {
      cancelled = true;
    };
  }, [id]); // Reload when the route ID changes.

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading professor details...
          </p>
        </div>
      </div>
    );
  }

  if (!professor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
            <UserRound size={30} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            {notFound ? "Professor Not Found" : "Unable to Load Professor"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {notFound
              ? "The professor does not exist or may have been removed."
              : "Check your backend connection and try again."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/professors")}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <ArrowLeft size={17} />
            Back to Professors
          </button>
        </div>
      </div>
    );
  }

  const isActive = professor.status === "Active";

  return (
    <div className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/professors")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
            Back to Professors
          </button>

          <button
            type="button"
            onClick={() => navigate(`/professors/edit/${professor._id || id}`)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Pencil size={17} />
            Edit Professor
          </button>
        </div>

        {/* Professor profile */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 bg-gradient-to-r from-indigo-700 to-indigo-500 p-6 text-white sm:flex-row sm:items-center sm:p-8">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <UserRound size={42} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-100">
                Professor Profile
              </p>
              <h1 className="break-words text-2xl font-bold sm:text-3xl">
                {professor.name || "Professor Name"}
              </h1>
              <p className="mt-2 break-words text-sm text-indigo-100">
                {professor.professorId || "Professor ID not available"}
              </p>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
                isActive
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-white/20 text-white"
              }`}
            >
              <CheckCircle2 size={16} />
              {professor.status || "Active"}
            </span>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              icon={<User size={17} />}
              label="Professor ID"
              value={professor.professorId}
              highlight
            />
            <InfoItem
              icon={<UserRound size={17} />}
              label="Full Name"
              value={professor.name}
            />
            <InfoItem
              icon={<Mail size={17} />}
              label="Email Address"
              value={professor.email}
            />
            <InfoItem
              icon={<Phone size={17} />}
              label="Phone Number"
              value={professor.phone}
            />
            <InfoItem
              icon={<Building2 size={17} />}
              label="Department"
              value={professor.department}
              highlight
            />
            <InfoItem
              icon={<CheckCircle2 size={17} />}
              label="Designation"
              value={professor.designation}
            />
          </div>
        </div>

        {/* Additional information */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            icon={<Building2 size={20} />}
            title="Professional Information"
            description="Department, designation and account status"
          />

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoItem
              icon={<Building2 size={17} />}
              label="Department"
              value={professor.department}
            />
            <InfoItem
              icon={<CheckCircle2 size={17} />}
              label="Account Status"
              value={professor.status}
              highlight
            />
          </div>
        </div>
      </div>
    </div>
  );

  /* ==================================================
   SECTION HEADER
================================================== */
};
const SectionHeader = ({ icon, title, description }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
        {icon}
      </div>

      <div>
        <h2 className="font-bold text-slate-900">{title}</h2>

        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
};

/* ==================================================
   INFO ITEM
================================================== */

const InfoItem = ({ icon, label, value, highlight = false }) => {
  return (
    <div
      className={`group rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
        highlight
          ? "border-indigo-100 bg-indigo-50/60 hover:border-indigo-200"
          : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            highlight ? "bg-white text-indigo-600" : "bg-white text-slate-400"
          }`}
        >
          {icon}
        </span>

        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>

      <p
        className={`mt-3 break-words text-sm font-bold ${
          highlight ? "text-indigo-700" : "text-slate-800"
        }`}
      >
        {value || "-"}
      </p>
    </div>
  );
};

export default ProfessorDetail;
