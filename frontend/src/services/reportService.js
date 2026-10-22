import { apiGet } from "./api";

const reportService = {
  getAttendanceReport: (filters = {}) => {
    const params = new URLSearchParams();

    const fields = [
      ["registration_number", "registrationNumber"],
      ["department", "department"],
      ["subject_code", "subjectCode"],
      ["professor_id", "professorId"],
      ["lecture_code", "lectureCode"],
      ["start_date", "startDate"],
      ["end_date", "endDate"],
    ];

    for (const [apiField, camelField] of fields) {
      const value = filters[apiField] ?? filters[camelField];

      if (value !== undefined && value !== null && String(value).trim()) {
        params.set(apiField, String(value).trim());
      }
    }

    const query = params.toString();

    return apiGet(`/api/reports/attendance${query ? `?${query}` : ""}`);
  },
};

export default reportService;
