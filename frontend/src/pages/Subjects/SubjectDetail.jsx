import {
  ArrowLeft,
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,
  Hash,
  Pencil,
  User,
} from "lucide-react";
import {useState,useEffect} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSubjects } from "../../context/SubjectContext";
import { apiGet } from "../../services/api";
import toast from "react-hot-toast";

const SubjectDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { subjects = [] } = useSubjects();

  const [remoteSubject, setRemoteSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  const contextSubject = subjects.find(
    (item) =>
      String(item.id ?? item._id ?? item.subjectCode ?? item.subject_code) ===
      String(id),
  );

  useEffect(() => {
    if (contextSubject) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadSubject = async () => {
      setLoading(true);

      try {
        // Fetch subjects from your FastAPI backend.
        const response = await apiGet("/api/subjects");

        const list = Array.isArray(response)
          ? response
          : (response?.subjects ??
            response?.data?.subjects ??
            response?.data ??
            []);

        const found = list.find(
          (item) =>
            String(
              item.id ?? item._id ?? item.subjectCode ?? item.subject_code,
            ) === String(id),
        );

        if (!cancelled) {
          if (found) {
            setRemoteSubject({
              ...found,
              id: String(found.id ?? found._id ?? found.subject_code ?? id),
              subjectCode: found.subjectCode ?? found.subject_code ?? "",
              subjectName: found.subjectName ?? found.subject_name ?? "",
              course: found.course ?? "",
              department: found.department ?? "",
              semester: found.semester ?? "",
              teacherId: found.teacherId ?? found.professor_id ?? "",
              teacherName: found.teacherName ?? found.professor_name ?? "",
              status: found.status ?? "Active",
            });
          } else {
            toast.error("Subject not found.");
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Load subject error:", error);
          toast.error(
            error?.detail ||
              error?.message ||
              "Unable to load subject details.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSubject();

    return () => {
      cancelled = true;
    };
  }, [id, contextSubject]);
  const subject = contextSubject || remoteSubject;
  /* =====================================================
     SUBJECT NOT FOUND
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-slate-500">
          Loading subject details...
        </p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <BookOpen size={26} className="text-slate-400" />
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-800">
            Subject not found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            The subject you are looking for does not exist.
          </p>

          <button
            type="button"
            onClick={() => navigate("/subjects")}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Back to Subjects
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-5xl space-y-5">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/subjects")}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Subject Details
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View complete subject information.
            </p>
          </div>
        </div>

        {/* =================================================
            SUBJECT PROFILE CARD
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Soft Header */}
          <div className="h-20 bg-slate-50 sm:h-24" />

          <div className="px-5 pb-6 sm:px-7">
            <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
              {/* Profile */}
              <div className="flex items-end gap-4">
                {/* Subject Icon */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-indigo-50 text-indigo-600 shadow-md sm:h-24 sm:w-24">
                  <BookOpen size={34} strokeWidth={1.8} />
                </div>

                {/* Subject Name */}
                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                      {subject.subjectName}
                    </h2>

                    {/* Status */}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        subject.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {subject.status || "Active"}
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-semibold text-indigo-600">
                    {subject.subjectCode}
                  </p>
                </div>
              </div>

              {/* Edit Button */}
              <button
                type="button"
                onClick={() => navigate(`/subjects/edit/${subject.id}`)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:w-auto"
              >
                <Pencil size={16} />
                Edit Subject
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            SUBJECT INFORMATION
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Subject Information
              </h2>

              <p className="text-sm text-slate-500">
                Basic academic information.
              </p>
            </div>
          </div>

          {/* Information Grid */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              icon={<Hash size={17} />}
              label="Subject Code"
              value={subject.subjectCode}
            />

            <InfoItem
              icon={<BookOpen size={17} />}
              label="Subject Name"
              value={subject.subjectName}
            />

            <InfoItem
              icon={<GraduationCap size={17} />}
              label="Course"
              value={subject.course}
            />

            <InfoItem
              icon={<Building2 size={17} />}
              label="Department"
              value={subject.department}
            />

            <InfoItem
              icon={<CalendarDays size={17} />}
              label="Semester"
              value={subject.semester ? `Semester ${subject.semester}` : "-"}
            />

            <InfoItem
              icon={<User size={17} />}
              label="Professor"
              value={subject.teacherName}
            />
          </div>
        </div>

        {/* =================================================
            PROFESSOR CARD
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <User size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Assigned Professor
              </h2>

              <p className="text-sm text-slate-500">
                Professor assigned to this subject.
              </p>
            </div>
          </div>

          {/* Professor Details */}
          <div className="mt-5 flex items-center gap-4 rounded-xl bg-slate-50 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200">
              <User size={22} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Professor
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {subject.teacherName || "-"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Teacher ID: {subject.teacherId || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            BOTTOM ACTIONS
        ================================================= */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/subjects")}
            className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            Back to Subjects
          </button>

          <button
            type="button"
            onClick={() => navigate(`/subjects/edit/${subject.id}`)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:w-auto"
          >
            <Pencil size={17} />
            Edit Subject
          </button>
        </div>
      </div>
    </div>
  );
};

/* =====================================================
   INFORMATION ITEM
===================================================== */

const InfoItem = ({ icon, label, value }) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
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
};

export default SubjectDetail;
