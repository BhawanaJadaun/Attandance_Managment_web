import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";

const LectureContext = createContext(null);

const STORAGE_KEY = "lectures";

const initialLectures = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load lectures:", error);
    return [];
  }
})();

const lectureReducer = (state, action) => {
  switch (action.type) {
    case "ADD_LECTURE": {
      const lecture = {
        ...action.payload,
        id:
          action.payload.id ||
          action.payload.lectureCode ||
          `LEC-${Date.now()}`,
      };

      const exists = state.some(
        (item) =>
          String(item.lectureCode).toLowerCase() ===
          String(lecture.lectureCode).toLowerCase()
      );

      if (exists) {
        return state.map((item) =>
          String(item.lectureCode).toLowerCase() ===
          String(lecture.lectureCode).toLowerCase()
            ? { ...item, ...lecture }
            : item
        );
      }

      return [...state, lecture];
    }

    case "UPDATE_LECTURE":
      return state.map((lecture) =>
        String(lecture.id) === String(action.payload.id)
          ? { ...lecture, ...action.payload }
          : lecture
      );

    case "DELETE_LECTURE":
      return state.filter(
        (lecture) =>
          String(lecture.id) !== String(action.payload)
      );

    case "CLEAR_LECTURES":
      return [];

    default:
      return state;
  }
};

export const LectureProvider = ({ children }) => {
  const [lectures, dispatch] = useReducer(
    lectureReducer,
    initialLectures
  );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(lectures)
    );
  }, [lectures]);

  const addLecture = (lecture) => {
    dispatch({
      type: "ADD_LECTURE",
      payload: lecture,
    });
  };

  const updateLecture = (lecture) => {
    dispatch({
      type: "UPDATE_LECTURE",
      payload: lecture,
    });
  };

  const deleteLecture = (id) => {
    dispatch({
      type: "DELETE_LECTURE",
      payload: id,
    });
  };

  const getLectureByCode = (lectureCode) => {
    return lectures.find(
      (lecture) =>
        String(lecture.lectureCode).toLowerCase() ===
        String(lectureCode).toLowerCase()
    );
  };

  const getLecturesBySubject = (subjectCode) => {
    return lectures.filter(
      (lecture) =>
        String(lecture.subjectCode).toLowerCase() ===
        String(subjectCode).toLowerCase()
    );
  };

  const getLecturesByProfessor = (professorId) => {
    return lectures.filter(
      (lecture) =>
        String(lecture.professorId).toLowerCase() ===
        String(professorId).toLowerCase()
    );
  };

  const getLecturesByDate = (date) => {
    return lectures.filter(
      (lecture) => lecture.date === date
    );
  };

  const getLecturesByStudentScope = ({
    course,
    department,
    semester,
    section,
  } = {}) => {
    return lectures.filter((lecture) => {
      const courseMatch =
        !course ||
        String(lecture.course).toLowerCase() ===
          String(course).toLowerCase();

      const departmentMatch =
        !department ||
        String(lecture.department).toLowerCase() ===
          String(department).toLowerCase();

      const semesterMatch =
        !semester ||
        String(lecture.semester).toLowerCase() ===
          String(semester).toLowerCase();

      const sectionMatch =
        !section ||
        String(lecture.section).toLowerCase() ===
          String(section).toLowerCase();

      return (
        courseMatch &&
        departmentMatch &&
        semesterMatch &&
        sectionMatch
      );
    });
  };

  const isLectureExists = (lectureCode) => {
    return lectures.some(
      (lecture) =>
        String(lecture.lectureCode).toLowerCase() ===
        String(lectureCode).toLowerCase()
    );
  };

  const value = {
    lectures,
    dispatch,

    addLecture,
    updateLecture,
    deleteLecture,

    getLectureByCode,
    getLecturesBySubject,
    getLecturesByProfessor,
    getLecturesByDate,
    getLecturesByStudentScope,

    isLectureExists,
  };

  return (
    <LectureContext.Provider value={value}>
      {children}
    </LectureContext.Provider>
  );
};

export const useLectures = () => {
  const context = useContext(LectureContext);

  if (!context) {
    throw new Error(
      "useLectures must be used inside LectureProvider"
    );
  }

  return context;
};

export default LectureContext;