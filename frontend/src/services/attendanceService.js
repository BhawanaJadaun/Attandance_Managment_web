
import { apiGet, apiPost, apiPut } from "./api";

const attendanceService = {
  // Get attendance records, optionally filtered by lecture, student, or date.
  getAll: (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.lecture_code || filters.lectureCode) {
      params.set(
        "lecture_code",
        filters.lecture_code || filters.lectureCode
      );
    }

    if (filters.registration_number || filters.registrationNumber) {
      params.set(
        "registration_number",
        filters.registration_number || filters.registrationNumber
      );
    }

    if (filters.date) {
      params.set("date", filters.date);
    }

    const query = params.toString();
    return apiGet(`/api/attendance/${query ? `?${query}` : ""}`);
  },

  // Mark attendance for one student in one lecture.
  mark: (data) => {
    const lectureCode = data.lecture_code || data.lectureCode;
    const registrationNumber =
      data.registration_number || data.registrationNumber;

    if (!lectureCode || !registrationNumber) {
      throw new Error(
        "Lecture Code and Registration Number are required."
      );
    }

    if (typeof data.present !== "boolean") {
      throw new Error("Attendance must be true (Present) or false (Absent).");
    }

    return apiPost("/api/attendance/", {
      lecture_code: String(lectureCode).trim().toUpperCase(),
      registration_number: String(registrationNumber).trim().toUpperCase(),
      present: data.present,
    });
  },

  // Update an existing attendance record using its MongoDB ID.
  update: (attendanceId, present) => {
    if (typeof present !== "boolean") {
      throw new Error("Attendance must be true (Present) or false (Absent).");
    }

    return apiPut(
      `/api/attendance/${encodeURIComponent(attendanceId)}`,
      { present }
    );
  },
};

export default attendanceService;