import { createContext, useContext, useEffect, useReducer } from "react";
import * as studentServiceModule from "../services/studentService";

const StudentContext = createContext(null);

const getStudentService = () => {
  const service =
    studentServiceModule.studentService ?? studentServiceModule.default;

  if (!service || typeof service.getAll !== "function") {
    throw new Error(
      "studentService must export getAll() and create() methods.",
    );
  }

  return service;
};

export function normalizeStudent(student = {}) {
  const registrationNo =
    student.registrationNo ??
    student.registration_number ??
    student.registrationNumber ??
    "";

  return {
    ...student,
    id: String(student.id ?? student._id ?? registrationNo),
    registrationNo,
    rollNo:
      student.rollNo ??
      student.roll_number ??
      student.rollNumber ??
      student.roll_no ??
      "",
    name: student.name ?? student.full_name ?? student.fullName ?? "",
    course: student.course ?? "",
    department: student.department ?? "",
    semester: String(student.semester ?? "1"),
    section: student.section ?? "",
    email: student.email ?? "",
    phone: student.phone ?? "",
    status: student.status ?? "Active",
    image: student.image ?? "",
  };
}

function studentReducer(state, action) {
  switch (action.type) {
    case "SET_STUDENTS":
      return Array.isArray(action.payload)
        ? action.payload.map(normalizeStudent)
        : [];

    case "ADD_STUDENT": {
      const newStudent = normalizeStudent(action.payload);

      const duplicate = state.some(
        (student) =>
          student.registrationNo &&
          student.registrationNo.trim().toUpperCase() ===
            newStudent.registrationNo.trim().toUpperCase(),
      );

      if (duplicate) return state;

      return [...state, newStudent];
    }

    case "UPDATE_STUDENT":
      return state.map((student) =>
        student.id === String(action.payload.id)
          ? normalizeStudent({
              ...student,
              ...action.payload,
            })
          : student,
      );

    case "DELETE_STUDENT":
      return state.filter((student) => student.id !== String(action.payload));

    default:
      return state;
  }
}

export function StudentProvider({ children }) {
  const [students, dispatch] = useReducer(studentReducer, []);

  useEffect(() => {
    let active = true;

    async function loadStudents() {
      try {
        const service = getStudentService();
        const response = await service.getAll();

        const records = Array.isArray(response)
          ? response
          : (response?.students ?? response?.data ?? response?.items ?? []);

        if (active) {
          dispatch({
            type: "SET_STUDENTS",
            payload: records,
          });
        }
      } catch (error) {
        console.error("Unable to load students from backend:", error);
      }
    }

    loadStudents();

    return () => {
      active = false;
    };
  }, []);

  return (
    <StudentContext.Provider
      value={{
        students,
        dispatch,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export function useStudents() {
  const context = useContext(StudentContext);

  if (!context) {
    throw new Error("useStudents must be used inside StudentProvider");
  }

  return context;
}
