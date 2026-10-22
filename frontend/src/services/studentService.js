import { apiGet, apiPost, apiPut, apiDelete } from "./api";

const studentService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.department) params.set("department", filters.department);
    if (filters.course) params.set("course", filters.course);
    if (filters.semester !== "" && filters.semester != null) {
      params.set("semester", String(filters.semester));
    }

    const query = params.toString();
    return apiGet(`/api/students/${query ? `?${query}` : ""}`);
  },

  getById: (studentId) =>
    apiGet(`/api/students/${encodeURIComponent(studentId)}`),

  create: (studentData) =>
    apiPost("/api/students/", {
      registration_number: String(
        studentData.registration_number || studentData.registrationNumber || "",
      )
        .trim()
        .toUpperCase(),
      roll_number: String(
        studentData.roll_number ||
          studentData.rollNumber ||
          studentData.roll_no ||
          "",
      ).trim(),
      full_name: String(
        studentData.full_name || studentData.fullName || studentData.name || "",
      ).trim(),
      department: studentData.department || "",
      course: studentData.course || "",
      semester: Number(studentData.semester),
      section: studentData.section || "",
      email: studentData.email || "",
      phone: studentData.phone || "",
      status: studentData.status || "Active",
    }),

  update: (studentId, studentData) =>
    apiPut(`/api/students/${encodeURIComponent(studentId)}`, studentData),

  delete: (studentId) =>
    apiDelete(`/api/students/${encodeURIComponent(studentId)}`),
};

export default studentService;
