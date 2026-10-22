import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { useState, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useSubjects } from "../../context/SubjectContext";
import { apiGet, apiDelete } from "../../services/api";
import toast from "react-hot-toast";

const MENU_WIDTH = 160;
const MENU_HEIGHT = 144;
const VIEWPORT_GAP = 8;

const normalizeSubject = (item) => ({
  ...item,
  id: String(
    item.id ?? item._id ?? item.subject_code ?? item.subjectCode ?? "",
  ),
  subjectCode: item.subjectCode ?? item.subject_code ?? "",
  subjectName: item.subjectName ?? item.subject_name ?? "",
  course: item.course ?? "",
  department: item.department ?? "",
  semester: item.semester ?? "",
  teacherId: String(
    item.professor_id ??
      item.professorId ??
      item.teacher_id ??
      item.teacherId ??
      "",
  ).trim(),
  teacherName: String(
    item.professor_name ??
      item.professorName ??
      item.teacher_name ??
      item.teacherName ??
      item.full_name ??
      "",
  ).trim(),
  status: item.status ?? "Active",
});

const normalizeProfessor = (item) => ({
  ...item,
  id: String(item.id ?? item._id ?? "").trim(),
  professorId: String(
    item.professor_id ?? item.professorId ?? item.id ?? item._id ?? "",
  ).trim(),
  name: String(
    item.full_name ??
      item.professor_name ??
      item.professorName ??
      item.name ??
      "",
  ).trim(),
});

const unwrapList = (response, keys) => {
  if (Array.isArray(response)) return response;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) {
      return response[key];
    }

    if (Array.isArray(response?.data?.[key])) {
      return response.data[key];
    }
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

// Supports IDs such as PRF003 and P003.
const normalizeProfessorId = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/^PRF(?=\d+$)/, "P");

const findProfessor = (professors, professorId) => {
  const originalId = String(professorId ?? "")
    .trim()
    .toUpperCase();
  const targetId = normalizeProfessorId(professorId);

  if (!originalId) return null;

  return (
    professors.find((professor) => {
      const candidates = [
        professor.professorId,
        professor.id,
        professor._id,
        professor.mongoId,
      ];

      return candidates.some((value) => {
        if (!value) return false;

        const candidateId = String(value).trim().toUpperCase();

        return (
          candidateId === originalId ||
          normalizeProfessorId(candidateId) === targetId
        );
      });
    }) ?? null
  );
};

const SubjectList = () => {
  const navigate = useNavigate();
  const { dispatch } = useSubjects();

  const [remoteSubjects, setRemoteSubjects] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [openMenu, setOpenMenu] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    direction: "down",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const subjectsPerPage = 8;

  // Load subjects and professors from the backend.
  const loadSubjects = useCallback(async () => {
    setLoading(true);

    try {
      const [subjectResponse, professorResponse] = await Promise.all([
        apiGet("/api/subjects"),
        apiGet("/api/professors"),
      ]);
      console.log("FULL PROFESSOR API RESPONSE:", professorResponse);
      console.log("FULL SUBJECT API RESPONSE:", subjectResponse);
      const subjectList = unwrapList(subjectResponse, ["subjects"]);
      const professorList = unwrapList(professorResponse, ["professors"]);

      const normalizedProfessors = professorList.map(normalizeProfessor);

      const normalizedSubjects = subjectList.map((item) => {
        const subject = normalizeSubject(item);

        const professorId =
          item.professor_id ??
          item.professorId ??
          item.teacher_id ??
          item.teacherId ??
          subject.teacherId;

        const assignedProfessor = findProfessor(
          normalizedProfessors,
          professorId,
        );

        const directName = String(
          item.professor_name ??
            item.professorName ??
            item.teacher_name ??
            item.teacherName ??
            item.full_name ??
            "",
        ).trim();

        return {
          ...subject,
          teacherId: String(professorId ?? "").trim(),
          teacherName: directName || assignedProfessor?.name || "",
        };
      });

      console.log("Loaded subjects:", normalizedSubjects.length);
      console.table(
        normalizedProfessors.map((professor) => ({
          mongoId: professor.id,
          professorId: professor.professorId,
          name: professor.name,
        })),
      );

      console.table(
        normalizedSubjects.map((subject) => ({
          subjectCode: subject.subjectCode,
          subjectName: subject.subjectName,
          professorId: subject.teacherId,
          professorName: subject.teacherName || "NOT MATCHED",
        })),
      );

      setProfessors(normalizedProfessors);
      setRemoteSubjects(normalizedSubjects);
    } catch (error) {
      console.error("Load subjects error:", error);

      toast.error(error?.message || "Unable to load subjects and professors.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  // Close the action menu when scrolling or resizing.
  useEffect(() => {
    if (openMenu === null) return;

    const closeMenu = () => setOpenMenu(null);

    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);

    return () => {
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, [openMenu]);

  // Allow Escape to close the delete popup.
  useEffect(() => {
    if (!subjectToDelete) return;

    const handleEscape = (event) => {
      if (event.key === "Escape" && deletingId === null) {
        setSubjectToDelete(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [subjectToDelete, deletingId]);

  // Position the action menu within the viewport.
  const toggleMenu = (event, subjectId) => {
    event.stopPropagation();

    if (openMenu === subjectId) {
      setOpenMenu(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const openUpward =
      spaceBelow < MENU_HEIGHT + VIEWPORT_GAP && spaceAbove > spaceBelow;

    let top = openUpward ? rect.top - MENU_HEIGHT - 4 : rect.bottom + 4;

    top = Math.max(
      VIEWPORT_GAP,
      Math.min(top, viewportHeight - MENU_HEIGHT - VIEWPORT_GAP),
    );

    let left = rect.right - MENU_WIDTH;

    left = Math.max(
      VIEWPORT_GAP,
      Math.min(left, viewportWidth - MENU_WIDTH - VIEWPORT_GAP),
    );

    setMenuPosition({
      top,
      left,
      direction: openUpward ? "up" : "down",
    });

    setOpenMenu(subjectId);
  };

  // Search and filter subjects.
  const filteredSubjects = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return remoteSubjects.filter((subject) => {
      const matchesSearch =
        !searchText ||
        String(subject.subjectCode).toLowerCase().includes(searchText) ||
        String(subject.subjectName).toLowerCase().includes(searchText) ||
        String(subject.teacherName).toLowerCase().includes(searchText) ||
        String(subject.course).toLowerCase().includes(searchText) ||
        String(subject.department).toLowerCase().includes(searchText);

      const matchesCourse =
        courseFilter === "All" || subject.course === courseFilter;

      const matchesSemester =
        semesterFilter === "All" ||
        String(subject.semester) === String(semesterFilter);

      const matchesStatus =
        statusFilter === "All" || subject.status === statusFilter;

      return matchesSearch && matchesCourse && matchesSemester && matchesStatus;
    });
  }, [remoteSubjects, search, courseFilter, semesterFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSubjects.length / subjectsPerPage),
  );

  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * subjectsPerPage;

  const currentSubjects = filteredSubjects.slice(
    startIndex,
    startIndex + subjectsPerPage,
  );

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
    setOpenMenu(null);
  };

  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
    setOpenMenu(null);
  };

  // Open the custom delete confirmation.
  const handleDelete = (id) => {
    setOpenMenu(null);

    const subject = remoteSubjects.find(
      (item) => String(item.id) === String(id),
    );

    if (subject) {
      setSubjectToDelete(subject);
    }
  };

  // Delete only after confirmation.
  const confirmDelete = async () => {
    if (!subjectToDelete || deletingId !== null) return;

    const id = subjectToDelete.id;
    setDeletingId(id);

    try {
      await apiDelete(`/api/subjects/${encodeURIComponent(id)}`);

      setRemoteSubjects((previous) =>
        previous.filter((subject) => String(subject.id) !== String(id)),
      );

      dispatch({
        type: "DELETE_SUBJECT",
        payload: id,
      });

      setSubjectToDelete(null);
      setCurrentPage(1);

      toast.success("Subject deleted successfully.");
    } catch (error) {
      console.error("Delete subject error:", error);

      toast.error(error?.message || "Unable to delete subject.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (subject) => {
    setOpenMenu(null);
    navigate(`/subjects/${encodeURIComponent(subject.id)}`);
  };

  const handleEdit = (subject) => {
    setOpenMenu(null);
    navigate(`/subjects/edit/${encodeURIComponent(subject.id)}`);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-slate-500" role="status">
          Loading subjects...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Page header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Subjects
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage subjects and their assigned professors.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/subjects/add")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto"
          >
            <Plus size={18} />
            Add Subject
          </button>
        </header>

        {/* Search and filters */}
        <section
          aria-label="Subject search and filters"
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search
                size={18}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                aria-label="Search subjects"
                value={search}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Search subject..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <FilterSelect
              id="course-filter"
              label="Filter by course"
              value={courseFilter}
              onChange={(value) => handleFilterChange(setCourseFilter, value)}
              options={[
                ["All", "All Courses"],
                ["B.Tech", "B.Tech"],
                ["BCA", "BCA"],
                ["MCA", "MCA"],
                ["BBA", "BBA"],
                ["MBA", "MBA"],
                ["B.Com", "B.Com"],
              ]}
            />

            <FilterSelect
              id="semester-filter"
              label="Filter by semester"
              value={semesterFilter}
              onChange={(value) => handleFilterChange(setSemesterFilter, value)}
              options={[
                ["All", "All Semesters"],
                ...Array.from({ length: 6 }, (_, index) => [
                  String(index + 1),
                  `Semester ${index + 1}`,
                ]),
              ]}
            />

            <FilterSelect
              id="status-filter"
              label="Filter by status"
              value={statusFilter}
              onChange={(value) => handleFilterChange(setStatusFilter, value)}
              options={[
                ["All", "All Status"],
                ["Active", "Active"],
                ["Inactive", "Inactive"],
              ]}
            />
          </div>
        </section>

        {/* Desktop table */}
        <section
          aria-label="Subject list"
          className="hidden overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm lg:block"
        >
          <div className="overflow-x-auto rounded-2xl">
            <table className="w-full table-fixed">
              <caption className="sr-only">
                Subjects, courses, assigned professors, semesters, status, and
                actions
              </caption>

              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-left">
                  <th
                    scope="col"
                    className="w-[13%] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Code
                  </th>
                  <th
                    scope="col"
                    className="w-[23%] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Subject
                  </th>
                  <th
                    scope="col"
                    className="w-[15%] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Course
                  </th>
                  <th
                    scope="col"
                    className="w-[17%] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Professor
                  </th>
                  <th
                    scope="col"
                    className="w-[12%] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Semester
                  </th>
                  <th
                    scope="col"
                    className="w-[10%] px-2 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="w-[10%] px-2 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {currentSubjects.length > 0 ? (
                  currentSubjects.map((subject) => (
                    <tr
                      key={subject.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-indigo-600">
                          {subject.subjectCode || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {subject.subjectName || "-"}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-400">
                          {subject.department || "-"}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-700">
                        {subject.course || "-"}
                      </td>

                      <td className="px-4 py-3">
                        <p className="truncate text-sm text-slate-700">
                          {getSubjectProfessorName(subject, professors)}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-700">
                        Sem {subject.semester || "-"}
                      </td>

                      <td className="px-2 py-3 text-right">
                        <StatusBadge status={subject.status} />
                      </td>

                      <td className="px-2 py-3 text-right">
                        <button
                          type="button"
                          disabled={deletingId === subject.id}
                          onClick={(event) => toggleMenu(event, subject.id)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
                          aria-label={`Actions for ${subject.subjectName || subject.subjectCode}`}
                          aria-haspopup="menu"
                          aria-expanded={openMenu === subject.id}
                        >
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <BookOpen
                        size={36}
                        aria-hidden="true"
                        className="mx-auto text-slate-300"
                      />
                      <p className="mt-3 font-semibold text-slate-700">
                        No subjects found
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Mobile and tablet cards */}
        <section
          aria-label="Subject cards"
          className="grid grid-cols-1 gap-3 lg:hidden"
        >
          {currentSubjects.length > 0 ? (
            currentSubjects.map((subject) => (
              <article
                key={subject.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <header className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600"
                    >
                      <BookOpen size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-indigo-600">
                        {subject.subjectCode || "-"}
                      </p>
                      <h2 className="truncate text-sm font-bold text-slate-800">
                        {subject.subjectName || "-"}
                      </h2>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={deletingId === subject.id}
                    onClick={(event) => toggleMenu(event, subject.id)}
                    className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
                    aria-label={`Actions for ${subject.subjectName || subject.subjectCode}`}
                    aria-haspopup="menu"
                    aria-expanded={openMenu === subject.id}
                  >
                    <MoreVertical size={18} />
                  </button>
                </header>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <Info label="Course" value={subject.course} />
                  <Info
                    label="Semester"
                    value={`Sem ${subject.semester || "-"}`}
                  />
                  <Info
                    label="Professor"
                    value={getSubjectProfessorName(subject, professors)}
                  />
                  <Info
                    label="Status"
                    value={<StatusBadge status={subject.status} />}
                  />
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <BookOpen
                size={36}
                aria-hidden="true"
                className="mx-auto text-slate-300"
              />
              <p className="mt-3 font-semibold text-slate-700">
                No subjects found
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Try changing your search or filters.
              </p>
            </div>
          )}
        </section>

        {/* Pagination */}
        {filteredSubjects.length > 0 && (
          <nav
            aria-label="Subject pagination"
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-xs text-slate-500" aria-live="polite">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-700">
                {Math.min(
                  startIndex + subjectsPerPage,
                  filteredSubjects.length,
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {filteredSubjects.length}
              </span>{" "}
              subjects
            </p>

            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => {
                  setOpenMenu(null);
                  setCurrentPage((page) => Math.max(1, page - 1));
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Previous
              </button>

              <span className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600">
                {safePage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() => {
                  setOpenMenu(null);
                  setCurrentPage((page) => Math.min(totalPages, page + 1));
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </nav>
        )}
      </div>

      {/* Action menu portal */}
      {openMenu !== null &&
        createPortal(
          <>
            <button
              type="button"
              aria-label="Close subject actions menu"
              className="fixed inset-0 z-[9998] cursor-default bg-transparent"
              onClick={() => setOpenMenu(null)}
            />

            <ActionMenu
              position={menuPosition}
              subject={remoteSubjects.find(
                (subject) => subject.id === openMenu,
              )}
              onView={() => {
                const subject = remoteSubjects.find(
                  (item) => item.id === openMenu,
                );
                if (subject) handleView(subject);
              }}
              onEdit={() => {
                const subject = remoteSubjects.find(
                  (item) => item.id === openMenu,
                );
                if (subject) handleEdit(subject);
              }}
              onDelete={() => handleDelete(openMenu)}
            />
          </>,
          document.body,
        )}

      {/* Custom delete confirmation */}
      {subjectToDelete &&
        createPortal(
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && deletingId === null) {
                setSubjectToDelete(null);
              }
            }}
          >
            <section
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-subject-title"
              aria-describedby="delete-subject-description"
              className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
              <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2
                  id="delete-subject-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Delete Subject?
                </h2>

                <button
                  type="button"
                  onClick={() => setSubjectToDelete(null)}
                  disabled={deletingId !== null}
                  aria-label="Close delete confirmation"
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
                >
                  <X size={20} />
                </button>
              </header>

              <div className="px-6 py-7 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <Trash2 size={30} />
                </div>

                <p
                  id="delete-subject-description"
                  className="mt-4 text-sm leading-6 text-slate-600"
                >
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-slate-900">
                    {subjectToDelete.subjectName ||
                      subjectToDelete.subjectCode ||
                      "this subject"}
                  </span>
                  ? This action cannot be undone.
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Subject Code: {subjectToDelete.subjectCode || "-"}
                </p>
              </div>

              <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={deletingId !== null}
                  onClick={() => setSubjectToDelete(null)}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={deletingId !== null}
                  onClick={confirmDelete}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 size={16} />
                  {deletingId === subjectToDelete.id
                    ? "Deleting..."
                    : "Delete Subject"}
                </button>
              </footer>
            </section>
          </div>,
          document.body,
        )}
    </main>
  );
};

// Resolve professor name from the subject response or professor list.
const getSubjectProfessorName = (subject, professors) => {
  const directName = String(
    subject.professor_name ??
      subject.professorName ??
      subject.teacherName ??
      subject.teacher_name ??
      "",
  ).trim();

  if (directName) return directName;

  const professor = findProfessor(
    professors,
    subject.teacherId ??
      subject.professor_id ??
      subject.professorId ??
      subject.teacher_id,
  );

  return professor?.name || "-";
};

// Filter dropdown
const FilterSelect = ({ id, label, value, onChange, options }) => (
  <div className="relative">
    <label htmlFor={id} className="sr-only">
      {label}
    </label>

    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
    >
      {options.map(([optionValue, optionLabel]) => (
        <option key={optionValue} value={optionValue}>
          {optionLabel}
        </option>
      ))}
    </select>

    <ChevronDown
      size={17}
      aria-hidden="true"
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
    />
  </div>
);

// Status badge
const StatusBadge = ({ status }) => {
  const isActive = status === "Active";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        isActive
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {status || "Active"}
    </span>
  );
};

// Subject information
const Info = ({ label, value }) => (
  <div className="min-w-0 rounded-xl bg-slate-50 p-3">
    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <div className="mt-1 truncate text-xs font-semibold text-slate-700">
      {value || "-"}
    </div>
  </div>
);

// Action menu
const ActionMenu = ({ onView, onEdit, onDelete, position, subject }) => {
  if (!subject) return null;

  return (
    <menu
      role="menu"
      aria-label={`Actions for ${subject.subjectName || subject.subjectCode || "subject"}`}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: MENU_WIDTH,
        maxHeight: `calc(100vh - ${VIEWPORT_GAP * 2}px)`,
      }}
      className="z-[9999] m-0 list-none rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-2xl"
    >
      <li>
        <button
          type="button"
          role="menuitem"
          onClick={onView}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
        >
          <Eye size={16} />
          View
        </button>
      </li>

      <li>
        <button
          type="button"
          role="menuitem"
          onClick={onEdit}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
        >
          <Pencil size={16} />
          Edit
        </button>
      </li>

      <li>
        <button
          type="button"
          role="menuitem"
          onClick={onDelete}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </li>
    </menu>
  );
};

export default SubjectList;
