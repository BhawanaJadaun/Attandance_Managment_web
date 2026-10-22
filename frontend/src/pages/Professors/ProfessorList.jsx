import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfessors } from "../../context/ProfessorsContext";
import { apiGet, apiDelete } from "../../services/api";
import { toast } from "react-hot-toast";

// --------------------------------------------------
// Normalize MongoDB/backend professor fields for UI
// --------------------------------------------------
const normalizeProfessor = (item) => ({
  ...item,
  id: String(item._id ?? item.id ?? item.professor_id ?? ""),
  professorId: item.professor_id ?? item.professorId ?? "",
  name: item.full_name ?? item.fullName ?? item.name ?? "",
  email: item.email ?? "",
  phone: item.phone ?? "",
  department: item.department ?? "",
  designation: item.designation ?? "",
  status: item.status ?? "Active",
});

const ProfessorList = () => {
  const navigate = useNavigate();
  const { professors: contextProfessors = [], dispatch } = useProfessors();

  const [serverProfessors, setServerProfessors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openMenu, setOpenMenu] = useState(null);
  const [deleteProfessor, setDeleteProfessor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const professorsPerPage = 8;

  // Use server data after it loads; otherwise use context data.
  const professors = serverProfessors ?? contextProfessors;

  // --------------------------------------------------
  // Load professors from FastAPI
  // --------------------------------------------------
  const loadProfessors = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiGet("/api/professors/");

      const list = Array.isArray(response)
        ? response
        : (response?.professors ?? response?.data ?? response?.items);

      if (!Array.isArray(list)) {
        throw new Error("Unexpected response from professors API.");
      }

      setServerProfessors(list.map(normalizeProfessor));
    } catch (error) {
      toast.error(
        error?.message || "Unable to load professors from the server.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfessors();
  }, [loadProfessors]);

  // --------------------------------------------------
  // Close action menu when clicking outside
  // --------------------------------------------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("[data-action-menu]")) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --------------------------------------------------
  // Search + Filters
  // --------------------------------------------------
  const filteredProfessors = professors.filter((professor) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      String(professor?.professorId ?? "")
        .toLowerCase()
        .includes(searchText) ||
      String(professor?.name ?? "")
        .toLowerCase()
        .includes(searchText) ||
      String(professor?.email ?? "")
        .toLowerCase()
        .includes(searchText) ||
      String(professor?.phone ?? "")
        .toLowerCase()
        .includes(searchText) ||
      String(professor?.department ?? "")
        .toLowerCase()
        .includes(searchText) ||
      String(professor?.designation ?? "")
        .toLowerCase()
        .includes(searchText);

    const matchesDepartment =
      departmentFilter === "All" || professor?.department === departmentFilter;

    const matchesStatus =
      statusFilter === "All" || professor?.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProfessors.length / professorsPerPage),
  );

  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * professorsPerPage;

  const currentProfessors = filteredProfessors.slice(
    startIndex,
    startIndex + professorsPerPage,
  );

  // --------------------------------------------------
  // Search
  // --------------------------------------------------
  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // --------------------------------------------------
  // Filters
  // --------------------------------------------------
  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  // --------------------------------------------------
  // Delete professor from MongoDB via FastAPI
  // --------------------------------------------------
  const handleDelete = async () => {
    if (!deleteProfessor || deleting) return;

    const professor = deleteProfessor;
    const professorId = professor.id;

    if (!professorId) {
      toast.error("Professor ID is missing.");
      return;
    }

    setDeleting(true);
    const toastId = toast.loading("Deleting professor...");

    try {
      await apiDelete(`/api/professors/${encodeURIComponent(professorId)}`);

      setServerProfessors((previous) =>
        (previous ?? professors).filter(
          (item) => String(item.id) !== String(professorId),
        ),
      );

      dispatch({
        type: "DELETE_PROFESSOR",
        payload: professorId,
      });

      setDeleteProfessor(null);
      setOpenMenu(null);

      toast.success("Professor deleted successfully.", {
        id: toastId,
      });
    } catch (error) {
      toast.error(error?.message || "Failed to delete professor.", {
        id: toastId,
      });
    } finally {
      setDeleting(false);
    }
  };

  // --------------------------------------------------
  // View
  // --------------------------------------------------
  const handleView = (id) => {
    setOpenMenu(null);
    navigate(`/professors/${encodeURIComponent(id)}`);
  };

  // --------------------------------------------------
  // Edit
  // --------------------------------------------------
  const handleEdit = (id) => {
    setOpenMenu(null);
    navigate(`/professors/edit/${encodeURIComponent(id)}`);
  };

  return (
    <>
      <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 p-3 sm:p-4 lg:p-5">
        <div className="mx-auto w-full max-w-7xl space-y-4">
          {/* HEADER */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Professors
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Manage the professors.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/professors/add")}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] sm:w-auto"
            >
              <Plus size={15} />
              Add Professor
            </button>
          </div>

          {/* FILTERS */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Search */}
              <div className="relative min-w-0">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search professor..."
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50"
                />
              </div>

              {/* Department */}
              <div className="relative min-w-0">
                <select
                  value={departmentFilter}
                  onChange={(e) =>
                    handleFilterChange(setDepartmentFilter, e.target.value)
                  }
                  className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-xs text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50"
                >
                  <option value="All">All Departments</option>
                  <option value="Computer Applications">
                    Computer Applications
                  </option>
                  <option value="Computer Science & Engineering">
                    Computer Science & Engineering
                  </option>
                  <option value="Electronics & Communication">
                    Electronics & Communication
                  </option>
                  <option value="Mechanical Engineering">
                    Mechanical Engineering
                  </option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Electrical Engineering">
                    Electrical Engineering
                  </option>
                  <option value="Management">Management</option>
                  <option value="Commerce">Commerce</option>
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              {/* Status */}
              <div className="relative min-w-0">
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    handleFilterChange(setStatusFilter, e.target.value)
                  }
                  className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-xs text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
              Loading professors...
            </div>
          )}

          {/* DESKTOP TABLE */}
          <div className="hidden w-full overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="w-full table-fixed text-xs">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-left">
                  <th className="w-[11%] px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Professor ID
                  </th>
                  <th className="w-[19%] px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Professor
                  </th>
                  <th className="w-[19%] px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Department
                  </th>
                  <th className="w-[16%] px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Designation
                  </th>
                  <th className="w-[18%] px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Contact
                  </th>
                  <th className="w-[10%] px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="w-[7%] px-2 py-2.5 text-right text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {!loading && currentProfessors.length > 0 ? (
                  currentProfessors.map((professor) => (
                    <tr
                      key={professor.id}
                      className="transition hover:bg-indigo-50/30"
                    >
                      <td className="px-2 py-2.5">
                        <span className="rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600">
                          {professor.professorId || "-"}
                        </span>
                      </td>

                      <td className="px-2 py-2.5">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                            <UserRound size={15} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-bold text-slate-800">
                              {professor.name || "-"}
                            </p>
                            <p className="mt-0.5 truncate text-[9px] text-slate-400">
                              {professor.email || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-2.5">
                        <p className="truncate text-[10px] font-medium text-slate-700">
                          {professor.department || "-"}
                        </p>
                      </td>

                      <td className="px-2 py-2.5">
                        <p className="truncate text-[10px] font-medium text-slate-700">
                          {professor.designation || "-"}
                        </p>
                      </td>

                      <td className="px-2 py-2.5">
                        <p className="truncate text-[10px] text-slate-700">
                          {professor.phone || "-"}
                        </p>
                        <p className="truncate text-[9px] text-slate-400">
                          {professor.email || "-"}
                        </p>
                      </td>

                      <td className="px-2 py-2.5">
                        <StatusBadge status={professor.status} />
                      </td>

                      <td className="relative px-2 py-2.5 text-right">
                        <div data-action-menu className="relative inline-block">
                          <button
                            type="button"
                            aria-label="Open actions"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(
                                openMenu === professor.id ? null : professor.id,
                              );
                            }}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                              openMenu === professor.id
                                ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                                : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <MoreVertical size={16} />
                          </button>

                          {openMenu === professor.id && (
                            <ActionMenu
                              onView={() => handleView(professor.id)}
                              onEdit={() => handleEdit(professor.id)}
                              onDelete={() => {
                                setOpenMenu(null);
                                setDeleteProfessor(professor);
                              }}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : !loading ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState />
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* MOBILE / TABLET CARDS */}
          <div className="grid grid-cols-1 gap-2.5 lg:hidden">
            {!loading && currentProfessors.length > 0 ? (
              currentProfessors.map((professor) => (
                <div
                  key={professor.id}
                  className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                        <UserRound size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-indigo-600">
                          {professor.professorId || "-"}
                        </p>
                        <h3 className="truncate text-xs font-bold text-slate-800">
                          {professor.name || "-"}
                        </h3>
                      </div>
                    </div>

                    <div data-action-menu className="relative shrink-0">
                      <button
                        type="button"
                        aria-label="Open actions"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(
                            openMenu === professor.id ? null : professor.id,
                          );
                        }}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                          openMenu === professor.id
                            ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                            : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openMenu === professor.id && (
                        <ActionMenu
                          onView={() => handleView(professor.id)}
                          onEdit={() => handleEdit(professor.id)}
                          onDelete={() => {
                            setOpenMenu(null);
                            setDeleteProfessor(professor);
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Info label="Department" value={professor.department} />
                    <Info label="Designation" value={professor.designation} />
                    <Info label="Phone" value={professor.phone} />
                    <Info
                      label="Status"
                      value={<StatusBadge status={professor.status} />}
                    />
                  </div>
                </div>
              ))
            ) : !loading ? (
              <EmptyState />
            ) : null}
          </div>

          {/* PAGINATION */}
          {!loading && filteredProfessors.length > 0 && (
            <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] text-slate-500">
                Showing{" "}
                <span className="font-bold text-slate-700">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-slate-700">
                  {Math.min(
                    startIndex + professorsPerPage,
                    filteredProfessors.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-700">
                  {filteredProfessors.length}
                </span>{" "}
                professors
              </p>

              <div className="flex items-center justify-between gap-1.5 sm:justify-end">
                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={13} />
                  Previous
                </button>

                <span className="rounded-lg bg-indigo-50 px-2.5 py-1.5 text-[10px] font-bold text-indigo-600">
                  {safePage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={safePage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteProfessor && (
        <DeleteModal
          professor={deleteProfessor}
          deleting={deleting}
          onCancel={() => {
            if (!deleting) setDeleteProfessor(null);
          }}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
};

// --------------------------------------------------
// STATUS BADGE
// --------------------------------------------------
const StatusBadge = ({ status }) => {
  const isActive = status === "Active";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold ${
        isActive
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {status || "Active"}
    </span>
  );
};

// --------------------------------------------------
// INFO CARD
// --------------------------------------------------
const Info = ({ label, value }) => (
  <div className="min-w-0 overflow-hidden rounded-lg bg-slate-50 p-2.5">
    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <div className="mt-1 truncate text-[10px] font-semibold text-slate-700">
      {value || "-"}
    </div>
  </div>
);

// --------------------------------------------------
// ACTION MENU
// --------------------------------------------------

const ActionMenu = ({ onView, onEdit, onDelete, placement = "bottom" }) => (
  <div
    className={`absolute right-0 z-[9999] w-36 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 text-left shadow-xl ring-1 ring-black/5 ${
      placement === "top" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"
    }`}
    onClick={(e) => e.stopPropagation()}
  >
    <button
      type="button"
      onClick={onView}
      className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[10px] font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
    >
      <Eye size={14} />
      View
    </button>

    <button
      type="button"
      onClick={onEdit}
      className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[10px] font-semibold text-slate-600 hover:bg-amber-50 hover:text-amber-600"
    >
      <Pencil size={14} />
      Edit
    </button>

    <div className="my-1 border-t border-slate-100" />

    <button
      type="button"
      onClick={onDelete}
      className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[10px] font-semibold text-red-600 hover:bg-red-50"
    >
      <Trash2 size={14} />
      Delete
    </button>
  </div>
);

// --------------------------------------------------
// EMPTY STATE
// --------------------------------------------------
const EmptyState = () => (
  <div className="px-4 py-10 text-center">
    <UserRound size={32} className="mx-auto text-slate-300" />
    <p className="mt-2 text-xs font-bold text-slate-700">No professors found</p>
    <p className="mt-1 text-[10px] text-slate-400">
      Try changing your search or filters.
    </p>
  </div>
);

// --------------------------------------------------
// DELETE MODAL
// --------------------------------------------------
const DeleteModal = ({ professor, deleting, onCancel, onConfirm }) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && !deleting) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onCancel, deleting]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm"
      onMouseDown={onCancel}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <Trash2 size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Delete Professor
              </h2>
              <p className="text-[10px] text-slate-400">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4">
          <div className="rounded-lg border border-red-100 bg-red-50 p-3">
            <p className="text-xs leading-5 text-slate-600">
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-900">{professor.name}</span>
              ?
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
              <span className="rounded-md bg-white px-2 py-1 font-semibold text-indigo-600 ring-1 ring-indigo-100">
                {professor.professorId}
              </span>
              <span className="rounded-md bg-white px-2 py-1 font-medium text-slate-600 ring-1 ring-slate-200">
                {professor.department}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 size={14} />
            {deleting ? "Deleting..." : "Delete Professor"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessorList;
